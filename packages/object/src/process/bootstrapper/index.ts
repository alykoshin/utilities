import * as path from 'path';
import _ from 'lodash';
const debug = require('debug')('bootstrapper');

import * as util from 'util';
const {asyncForEach,setTimeoutAsPromised} = require('@utilities/async');
const {sanitizeArray} = require('@utilities/array');

//const Dependency = require('./Dependency');
//const Dependencies = require('./Dependencies');
import {HandlerFn, NameToOneTimeHandlerMap as Dependencies, HandlerFullData} from './Dependencies';
const {WatchdogTimer, WatchdogCounter, EWATCHDOG} = require('../../');

class EPRIORITY_NOT_FOUND {
  constructor(prio) {
    return new Error(`priority ${prio} not found. Set priorities by register()`);
  }
}

export interface BootstrapperThis {
  context,
}

//


export class Bootstrapper extends Dependencies {
  readonly _logger;

  constructor(phases?, {timeout,logger=console,context={},defaultAction}:{timeout?: number, logger?, context?: any, defaultAction?: string}={}) {
    super({timeout, defaultAction});
    //this._timeout  = timeout;
    this._logger   = logger.child
      ? logger.child({ module: 'bootstrapper' })
      : logger;

    this._context  = context;

    //console.log('phases:', phases)
    //sanitizeArray(phases).forEach(phase => //typeof phase === 'string'
    //                                       /*?*/ this.add(phase)
    //                                       //: this.add(phase)
    //);
    this.add(sanitizeArray(phases));

    //this.register(priorities);

    // Object.defineProperty(this, 'context', {
    //   get() { return this._context; },
    //   //set(newValue) { this._context = newValue; },
    //   enumerable: true,
    //   configurable: true
    // });

  }

  get context() {
    return this._context;
  }

  runAt(nameTo: string, ...rest) {
    return this.addTo(nameTo, ...rest);
  }

  run(...args) {
    return this.execute(...args);
  }

  // setSignals (sigs: string[]) {
  setSignals (sigs: NodeJS.Signals[]) {
    const logger = this._logger; // console;
    const DEFAULT_SIGNALS: NodeJS.Signals[] = [
      'SIGINT',  // Ctrl+C
      'SIGTERM',
      'SIGQUIT',
      'SIGUSR2',
      // SIGUSR1 - Node debugger
      // SIGKILL cannot be interrupted
    ];
    sigs = sigs || DEFAULT_SIGNALS;
    logger.debug(`process.pid: ${process.pid} process.ppid: ${process.ppid}`);
    logger.info(`* setSignals: ${sigs.join(', ')}`);

    //process.stdin.resume();

    sigs.forEach(sig => {
      process.on(sig, async () => {
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.')
        logger.info(`* ${sig} received`);
        await doShutdown();
      })
    })
  }
}


if (module === require.main) {
  process.env.DEBUG = 'bootstrapper,watchdog';
  //process.env.DEBUG = '*';
  (async () => {

    console.log('process.env.DEBUG:', process.env.DEBUG);

    //const createTestActionFn = (name) => async (context, prio) => new Promise(resolve => {
    const createTestActionFn = function (name)  {
      return async function (this: BootstrapperThis, name_, handler, ...args) {
        return new Promise(resolve => {
          //console.log('2222222222222222', this);

          const line1 = `started > `;
          const line2 = line1 + `[${name_}:${name}] (${args.join(',')})`;

          //console.log('>>>>>', context);
          //console.log('>>>>>', this);

          console.log(line2);
          setTimeout(() => {
            console.log(' '.repeat(line1.length) + `[${name_}:${name}] (${args.join(',')}) > finished`);
            const result    = `result: ${name}`;
            this.context[ name ] = result;
            resolve(result);
          }, 500);
        });
      }
    };

    //

    //const x = new Bootstrapper();
    //const a = x.addDependency('a', [], (node) => { console.log(`Entered a"${node._data.name}"`); });
    //
    //const b = a.addDependency('b', [], (node) => { console.log(`Entered b"${node._data.name}"`); });
    //const c = a.addDependency('c', [], (node) => { console.log(`Entered c"${node._data.name}"`); });
    //const d = a.addDependency('d', [], (node) => { console.log(`Entered d"${node._data.name}"`); });
    //
    //const e = c.addDependency('e', [], (node) => { console.log(`Entered e"${node._data.name}"`); });
    //const f = c.addDependency('f', [], (node) => { console.log(`Entered f"${node._data.name}"`); });
    //
    //const g = d.addDependency('g', [], (node) => { console.log(`Entered g"${node._data.name}"`); });
    //
    //await x.run_new();

    const x = new Bootstrapper();
    //x.add('a', ['b','c','d'], (name, handler) => { console.log(`Entered a-"${name}" handler: ${JSON.stringify(handler)}`); })
    x.add('a', ['b','c','d'], createTestActionFn(/*.call({xxx:'yyy'}, */'a'));

    x.add('b', [],            createTestActionFn('b') );
    x.add('c', ['e','f'],     createTestActionFn('c') );
    x.add('d', [],            createTestActionFn('d') );

    x.add('e', [],            createTestActionFn('e') );
    x.add('f', ['e'],         createTestActionFn('f') );
    //x.add('g', [], createTestActionFn('g') )
    x.addTo('d', 'g', [], createTestActionFn('g') );


    await x.execute('a', 'arg1', 'arg2')
      .catch(e => console.log('ERROR:', e));

    //a = new NamedTreeNode('a');
    //b = new TreeNode('b');
    //c = new TreeNode('c');
    //d = new TreeNode('d');
    //e = new TreeNode('e');
    //f = new TreeNode('f');
    //g = new TreeNode('g');
    //a.addChild(b,c,d);
    //c.addChild(e,f);
    //d.addChild(g);


    /*
        b.register([ 'one', 'two' ]);

        b.addChild();

        b.runAt('one', 'test-1-1', [ 'test-1-3', 'test-1-5' ], createTestActionFn('test-1-1'));
        b.runAt('one', 'test-1-2', [             'test-1-5' ], createTestActionFn('test-1-2'));
        b.runAt('one', 'test-1-3', createTestActionFn('test-1-3'));
        b.runAt('one', 'test-1-4', createTestActionFn('test-1-4'));
        b.runAt('one', 'test-1-5', createTestActionFn('test-1-5'));
        b.runAt('two', 'test-2-1', createTestActionFn('test-2-1'));

        await b.run()
        //await b._runPrio('one')
        //await b._runHandler(test1)
          .catch(e => console.log('>>>>>>>>>>>>>> catch:', e));
     */

    console.log('context:', x.context);

  })();
}


// predefined bootstrap sequence
export const bootstrap: Bootstrapper = new Bootstrapper([
  { name: 'initialize' },                                            // read configs, init loggers, schedulers etc
  { name: 'backend',   dependsOn: [ 'initialize' ] },                // prepare connections to backends
  { name: 'frontend',  dependsOn: [ 'initialize', 'backend' ] },     // start to serve incoming requests
  { name: 'bootstrap', dependsOn: [ 'initialize', 'backend', 'frontend' ] },
], {
  defaultAction: 'bootstrap',
});
export const startup: Bootstrapper = bootstrap;

// predefined shutdown sequence
export const shutdown: Bootstrapper = new Bootstrapper([
  { name: 'suspend',  dependsOn: [                           ] }, // pause to server incoming requests
  { name: 'stop',     dependsOn: [ /*'suspend',*/            ] }, // stop and free resources
  { name: 'exit',     dependsOn: [ /*'suspend', 'stop'*/     ] }, // last priority, running predefined exit actions
  { name: 'shutdown', dependsOn: [ 'suspend', 'stop', 'exit' ] }  // will execute it in the order
], {
  defaultAction: 'shutdown',
  context: bootstrap.context, // both use same shared context
});


//console.log(bootstrap)

const ERROR_EXIT_CODE = 1;

/**
 *
 * @param {number} successExitCode
 * @return {Promise<void>}
 */
export const doShutdown = async (successExitCode:number=0): Promise<void> =>  {

  if (shutdown.running) {
    shutdown._logger.warn(`* shutdown is already running, ignoring consequent requests`);
    return;
  }

  shutdown._logger.info(`* initiating shutdown...`);
  /*await*/ shutdown.run('shutdown')
    .then((res) => {
      shutdown._logger.info(`* shutdown sequence has been finished with success, exiting`);
      process.exit(successExitCode);
    })
    .catch((e) => {
      shutdown._logger.error(e);

      if (e instanceof EWATCHDOG) {
        shutdown._logger.error(`Forcing the exit, code: ${ERROR_EXIT_CODE}`);
      }

      shutdown._logger.info(`* shutdown sequence has been finished with error, exiting`);
      process.exit(ERROR_EXIT_CODE);

    })
  ;

};

// type myCallbackType = (arg1: string, arg2: boolean) => number;
// interface myCallbackInterface { (arg1: string, arg2: boolean): number };

interface SimpleActionConstructorArgs { defaultDependsOn?: string[] }

interface SimpleActionHandler { (this: BootstrapperThis, context: any): Promise<any> }
// type SimpleActionHandler = async function (this: BootstrapperThis, context: any) => Promise<any>;

export type SimpleActionClass = (new(SimpleActionConstructorArgs?)=>SimpleAction)

export class SimpleAction {
  activityName: string;
  protected _defaultDependsOn: string[];

  onInitialize: SimpleActionHandler;
  onSuspend: SimpleActionHandler;

  constructor ({ defaultDependsOn }: SimpleActionConstructorArgs={}) {
    this._defaultDependsOn = defaultDependsOn;
  }

  _getActivityName(module: NodeJS.Module): string {
    if (this.activityName) {
      return this.activityName;

    } else {
      const pathname: string = module.filename;
      const dirname:  string = path.dirname(module.filename);
      const upDir:    string = path.resolve(dirname, '..');
      return this.constructor.name + '/' +
        path.relative(upDir, dirname) + '/' +
        path.basename(pathname, '.js');
    }
  }


  // overload
  registerHandler(bootstrapper: Bootstrapper, stateName: string, method: SimpleActionHandler): void
  registerHandler(bootstrapper: Bootstrapper, stateName: string, activityName: string, method: SimpleActionHandler): void
  registerHandler(bootstrapper: Bootstrapper, stateName: string, activityName: string, dependsOn: string[], method: SimpleActionHandler): void
  // implementation
  registerHandler(
    bootstrapper: Bootstrapper,
    stateName: string,
    ...args: (string|string[]|SimpleActionHandler)[]
    // arg4: string|string[]|SimpleActionHandler,
    // arg5?: SimpleActionHandler,
  ): void {
    let method: SimpleActionHandler;
    let activityName: string;
    let dependsOn: string[] = this._defaultDependsOn || [];

    args.forEach((a: string|string[]|SimpleActionHandler) => {
      if (typeof a === 'string') activityName = a;
      else if (Array.isArray(a)) dependsOn = a;
      else if (typeof a === 'function') method = a;
      else throw new Error('Expected string, string[] or function');
    });
    if (!activityName) activityName = this._getActivityName(module);
    const runArgs = [
      // stateName,
      activityName,
      dependsOn,
      function (this: BootstrapperThis) {
        return method.call(this, this.context)
      }
    ].filter(a => !!a);
    bootstrapper.runAt(stateName, ...runArgs);
  }

  // register to run at startup
  register() {
    const activityName = this._getActivityName(module);
    console.log(`SimpleAction: ${this.constructor.name} register ${activityName}`);

    this.registerHandler(bootstrap, 'initialize', activityName, this.onInitialize );
    this.registerHandler(shutdown,  'suspend',    activityName, this.onSuspend )
  };

}

