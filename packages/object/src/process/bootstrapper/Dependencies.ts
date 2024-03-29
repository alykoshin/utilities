const util = require('util');
const assert = require('assert');
import * as _ from 'lodash';

const {sanitizeArray} = require('@utilities/array');
const {asyncForEach} = require('@utilities/async');
const {joinNonEmpty} = require('@utilities/string');

import {SimpleObjectMap} from "./SimpleObjectMap";

const {WatchdogTimer, WatchdogCounter} = require('../../');
const debug = require('debug')('bootstrapper');


// export type HandlerName = string;
export type HandlerFn<N> = (this, name: N, handler?: HandlerData<N>, ...args: any[]) => Promise<any>;
export type DependsOn<N> = N[];
export type HandlerState = 'init' | 'done' | 'run';


interface HandlerData<N> {
  fn?: HandlerFn<N>,
  dependsOn?: DependsOn<N>,
  state?: HandlerState,
}

interface NamedHandlerInternalStructure<N> {
  name: N
  data: HandlerData<N>
}

export interface HandlerFullData<K> extends HandlerData<K> {
  name: K,
  // dependsOn?: DependsOn,
  // fn?: HandlerFn,
  // state?: HandlerState,
}

type HandlerDataPartial<N> = Partial<HandlerFullData<N>>

type InputHandlerSingleArgument<N> = N | HandlerFn<N> | DependsOn<N>;
type InputHandlerArguments<N> = InputHandlerSingleArgument<N> [];


const DEFAULT_TIMEOUT = 30 * 1000;


//class NamedArray {
//
//  constructor () {
//    this._array = [];
//  }
//
//  add(name, data) {
//    this._array.push({ name, data });
//  }
//
//  find(nameOrHandler) {
//    return this._array.find(h => h.name === nameOrHandler || h.data === nameOrHandler);
//  }
//
//  findIndex(nameOrHandler) {
//    return this._array.findIndex(h => h.name === nameOrHandler || h.data === nameOrHandler);
//  }
//
//  remove(nameOrHandler) {
//    const idx = this._findIndex(nameOrHandler);
//    if (idx < 0) throw new Error(`Element not found: ${nameOrHandler}`);
//    return this._array.splice(idx,1);
//  }
//
//}


// type HandlerMapDataOnly<K> = {
//   [key: K]: any
// }


export type HandlerName = number|string|symbol

type HandlerMapDataOnly<K extends HandlerName> = Record<K, any>

interface HandlerMapDataWithFn<K,T> {
  fn?: HandlerFn<K>

  [key: string]: any
}

interface HandlerMapDataInternal<N,T> {
  name: N
  data: HandlerMapDataWithFn<N,T>
}

export class NameToHandlerWithDataMap<N extends string> extends SimpleObjectMap<N, HandlerMapDataWithFn<N,any>> {

  _addNamedHandler(
    origName: N,
    {fn, ...data}: HandlerMapDataWithFn<N,any>
  ): HandlerMapDataInternal<N,any> {

    const getDefaultName = (fn: HandlerFn<N>) => {
      return joinNonEmpty([
          fn?.name ?? 'temp',
          _.uniqueId(),
        ],
        '_'
      )
    }

    // sanitize and check name
    const name = (typeof origName === 'undefined')
      ? getDefaultName(fn)
      : origName;

    assert(typeof name === 'string', 'Name must be string');

    // sanitize and check fn
    assert(['function', 'undefined'].indexOf(typeof fn) >= 0, 'must be function or undefined');

    // store
    return super._addNamedData(name, {fn, ...data});
  }

  async _executeHandler(name: N, ...args: any[]): Promise<any> {
    //debug(`[${name}/_executeHandler`);
    const handler: HandlerMapDataWithFn<N,any> = this.get(name);
    const result = await handler.fn.call(this, name, handler, ...args);
    //debug(`[${name}/_executeHandler, result: ${util.inspect(result, {depth:1})}`);
    return result;
  }

}


export class NameToOneTimeHandlerMap<N extends string> extends NameToHandlerWithDataMap<N> {
  protected _current: string | null;
  private readonly _timeout: number;
  private readonly _defaultAction: N;

  constructor({timeout = DEFAULT_TIMEOUT, defaultAction}: {
    timeout?: number,
    defaultAction?: N
  }) {
    super();
    this._timeout = timeout;
    this._defaultAction = defaultAction;
    this._running = false;
    this._current = null;
  }

  protected _running: boolean;

  get running(): boolean {
    return this._running;
  }

  protected _context: any;

  get context(): any {
    return this._context;
  }

  _add({name, fn, dependsOn}: HandlerDataPartial<N>): NamedHandlerInternalStructure<N> {

    dependsOn = sanitizeArray(dependsOn);

    return super._addNamedHandler(name, {
      fn,
      dependsOn,
      state: 'init',
    });
  }

  addOne(...args: (InputHandlerSingleArgument<N> | HandlerDataPartial<N>)[]): NamedHandlerInternalStructure<N> {
    let handler: HandlerDataPartial<N> = {};
    debug('addOne(): args:', args)
    args.forEach(a => {
      if (typeof a === 'string') handler.name = a;
      else if (typeof a === 'function') handler.fn = a;
      else if (Array.isArray(a)) handler.dependsOn = a;
      else if (typeof a === 'undefined' || a === null) { /* skip */
      } else handler = a;//this._add( a ); // object
      //else throw new Error(`Unexpected typeof: ${typeof a}, value: ${JSON.stringify(a)}`);
    });
    // console.log('addOne:', handler)
    return this._add(handler);
  }


  // @ts--ignore:
  add(...argHandlers: (InputHandlerSingleArgument<N> | HandlerDataPartial<N>)[]): NamedHandlerInternalStructure<N> | NamedHandlerInternalStructure<N>[] {
    //console.log('>>>>>>>>>>>>> add: argHandlers:', argHandlers);
    if (argHandlers.length === 1 && Array.isArray(argHandlers[0])) {
      const results: NamedHandlerInternalStructure<N>[] = [];
      const handlers: InputHandlerSingleArgument<N>[] = argHandlers[0];
      handlers.forEach(
        (handler) => results.push(this.addOne(handler))
      );
      return results;

    } else {
      const result: NamedHandlerInternalStructure<N> = this.addOne(...argHandlers);
      return result;
    }
  }

  addTo(nameTo: N, ...argHandlers): HandlerFullData<N> | HandlerFullData<N>[] {
    assert(typeof nameTo === 'string', 'nameTo must be string');
    //console.log('>>>>>>>>>>>>> add: nameTo:', nameTo, ', argHandlers:', argHandlers);
    //console.log('>>> rests', argHandlers)

    const handler: HandlerFullData<N> | HandlerFullData<N>[] = this.add(...argHandlers);

    //console.log('>>> handler', handler);
    const handlerTo = this.get(nameTo);
    if (Array.isArray(handler)) {
      handlerTo.dependsOn = handlerTo.dependsOn.concat(handler.map(h => h.name));
    } else {
      handlerTo.dependsOn.push(handler.name);
    }
    return handler;
  }

  _ensureNotRunning(name: N) {
    if (this._isRun(name)) throw new Error(`handler named "${name}" is already running`);
  }

  _setState(name: N, state: HandlerState): void {
    const handler = this.get(name);
    handler.state = state;
  }

  _setDone(name: N) {
    return this._setState(name, 'done');
  }

  _setRunning(name: N) {
    return this._setState(name, 'run');
  }

  _getState(name: N): HandlerState {
    const handler = this.get(name);
    return handler.state;
  }

  _isDone(name: N): boolean {
    return this._getState(name) === 'done';
  }

  _isRun(name: N): boolean {
    return this._getState(name) === 'run';
  }

  async _executeDependencies(name: N, ...args) {
    debug(`[${name}/exec/deps] enter: args: ${JSON.stringify(args)}`);
    const handler: HandlerData<N> = this.get(name);
    let allHandlersPromised;

    if (handler.dependsOn && handler.dependsOn.length > 0) {
      //debug(`[${name}/exec/deps] before asyncForEach`);

      allHandlersPromised = await asyncForEach(handler.dependsOn, async (dependencyName) => {
        //debug(`[${name}/exec/deps] 1 -> ${dependencyName}`);
        const result = await this._execute(dependencyName, ...args);
        //debug(`[${name}/exec/deps] 2 -> ${dependencyName}`);
        return result;
      });

      //debug(`[${name}/exec/deps] 222`);
    } else {
      //debug(`[${name}/exec/deps] 333`);
      allHandlersPromised = Promise.resolve();
      //debug(`[${name}/exec/deps] 444`);
    }

    debug(`[${name}/exec/deps] exit:`, allHandlersPromised);
    return allHandlersPromised;
  }

  async _executeSelf(name: N, ...args) {
    let watchdog/*: WatchdogTimer*/;

    const finishSelf = (msg: string) => {
      //console.log('_executeSelf finishSelf >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..',this._getState(name))
      debug(msg);
      if (watchdog) watchdog.stop();
      this._setDone(name);
      this._current = null;
    };

    const handler = this.get(name);
    debug(`[${name}/exec/self] enter: ${JSON.stringify(handler)}`);
    this._current = name;

    if (handler.state === 'done') return finishSelf(`[${name}/exec/self] is already done, skipping`);

    if (typeof handler.fn === 'undefined') return finishSelf(`[${name}/exec/self] handler is not set, skipping`);

    //console.log('starting watchdog');
    watchdog = new WatchdogTimer({name, timeout: this._timeout});
    const timeoutPromise = watchdog.start({name});
    const executionPromise = super._executeHandler(name, ...args);
    //console.log('000000000000000000',this._getState(name));

    return Promise.race([
      timeoutPromise,
      executionPromise,
    ])
      .then(() => {
        finishSelf(`[${name}/exec/self] exit: ${JSON.stringify(handler)}`);
      })
      .catch((e) => {
        //console.log('222222222222222',this._getState(name));
        console.log('Error', e);
        finishSelf('Error: '); //L! 1 arg
        throw e;

      })
    //.catch(() => {
    //  console.log('333333333333333333',this._getState(name))
    //  finishSelf();
    //})
    //  ;

    //const result = await super._executeHandler(name, ...args);
  }

  async _execute(name?: N, ...args) {
    //debug(`[${name}/exec] enter: `,this.get(name));
    const validName = (!name) ? this._defaultAction : name;

    this._ensureNotRunning(validName);
    if (this._isDone(validName)) return debug(`[${validName}/exec] is already done, skipping`);
    this._setRunning(validName);

    //debug(`[${name}/exec/1]: ${JSON.stringify(this.get(name))}`);

    return this._executeDependencies(validName, ...args)
      .then((r) => {
        //console.log()
        //console.log('_execute:then:', r);

        //debug(`[${name}/exec/2]`);
        return r;
      })
      .then((r) => {
        const result = this._executeSelf(validName, ...args);
        //debug(`[${name}/exec/3]`);
        //debug(`[${name}/exec] exit: ${JSON.stringify(this.get(name))}`);

        return result;
      })
      .catch((e) => {
        //console.log('_execute:then:', e);
        throw e;
      });

  }

  async execute(...args) {
    this._running = true;
    debug(`execute:enter ${JSON.stringify(args)}`);

    await this._execute(...args);

    //.finally(() => {
    debug(`execute:exit: ${JSON.stringify(args)}`);
    this._running = false;
    return this._context;
    //});
  }

}


export type Dependencies<HandlerName extends string> = NameToOneTimeHandlerMap<HandlerName>;
// module.exports = NameToOneTimeHandlerMap;

