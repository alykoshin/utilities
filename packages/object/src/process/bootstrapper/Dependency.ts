import {HandlerName} from "./Dependencies";

const assert = require('assert');
const {sanitizeArray} = require('@utilities/array');
const {asyncForEach}  = require('@utilities/async');

const NamedTreeNode = require('../../TreeNodes/NamedTreeNode');
const TreeNode = require('../../TreeNodes/TreeNode');


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

class NameToDataMap {
  _data: { [key: string]: any }

  constructor () {
    this._data = {};
  }

  _get(name: string): any {
    return this._data[name];
  }

  _set(name: string, value: any) {
    this._data[name] = value;
  }

  _ensureExist(name: string) {
    assert(typeof name === 'string');
    if (!this._get(name)) throw new Error(`Property named "${name}" does not exist`);
  }

  _ensureNotExist(name: string) {
    assert(typeof name === 'string');
    if (this._get(name)) throw new Error(`Property named "${name}" already exists`);
  }

  get(name: string): any {
    this._ensureExist(name);
    return this._get(name);
  }

  add(name: string, value) {
    this._ensureNotExist(name);
    this._set(name, value);
    //return
  }

  remove(name: string) {
    this._ensureExist(name);
    delete this._data[name];
  }

}


class NameToHandlerWithDataMap extends NameToDataMap {

  add (name: string, { fn, ...data }: { fn: ()=>void }) {
    assert(typeof fn === 'function');
    return super.add(name, { fn, ...data });
  }

  async _execute (name: string, ...args) {
    const handler = this.get(name);
    return await handler.fn(name, handler, ...args);
  }

}


class NameToOneTimeHandlerMap extends NameToHandlerWithDataMap {

  add(name: string, { fn, dependsOn }: { fn: ()=>void, dependsOn: string[] }) {
    assert(typeof fn === 'function');
    const data = { dependsOn, done: false }
    return super.add(name, { fn, ...data });
  }

  _ensureNotDone(name: string) {
    const handler = this.get(name);
    if (handler.done) throw new Error(`handler named "${name}" has been called multiple times`);
  }

  _setDone(name: string, done=true) {
    const handler = this.get(name);
    handler.done = done
  }

  async _executeDependencies (name: string, ...args) {
    const handler = this.get(name);
    const allHandlersPromised = asyncForEach(handler.dependsOn, () => this._runHandler.call(this, name, handler, ...args));
  }
  async _runHandler (name: HandlerName, handler, ...args: any[]): Promise<any> {
    const result = await handler.fn.call(this, name, handler, ...args);
    return result;
  }

  async _executeSelf (name: string, ...args) {
    const result = await super._execute(name, ...args);
  }

  async execute(name: string, ...args) {
    this._ensureNotDone(name);
    const handler = this.get(name);

    await this._executeDependencies(name, ...args);
    const result = await this._executeSelf(name, ...args);
    this._setDone(name);
    return result;
  }

}


class Dependency extends NamedTreeNode {

  constructor (data) {
    super (data);
    //this._nameHandlerMap = new NameToOneTimeHandlerMap();
    //this._handlerNamesTree = new TreeNode();
  }

  addDependency(name: string, dependsOn, fn) {
    //this._nameHandlerMap.add(name, dependsOn, fn);
    const dependency = new Dependency({ name, dependsOn, fn });
    this.addChild( dependency );
    return dependency;
  }

  //async _execute(...args) {
  //   return this._data.handler(...args)
  //}

  //async execute (...args) {
  //  await this.traversePostOrder(async node => await node.execute(...args));
  //  await this._execute(...args);
  //}

}


module.exports = Dependency;

