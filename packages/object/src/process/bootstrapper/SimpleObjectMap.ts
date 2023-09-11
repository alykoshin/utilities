const assert = require('assert');


interface GetOptions {
  mustExist: boolean
}

type StringMap<K extends string> = {
  [key in K]: unknown;
};

export class BaseMap<K extends string, T> {
  private readonly _data: { [k in K]?: T; } = {};

  protected _get(name: K): T | undefined {
    return this._data[name];
  }

  protected _set(name: K, value: T): T | undefined {
    this._data[name] = value;
    return value;
  }

  protected _remove(name: K): void {
    delete this._data[name];
  }

}


export class SimpleObjectMap<K extends string, T> extends BaseMap<K, T> {

  public get(name: K, {mustExist = true}: GetOptions = {mustExist: true}): T {
    this._validateName(name);
    if (mustExist) this._ensureExist(name);
    return this._get(name);
  }

  public set(name: K, value: T): T {
    this._validateName(name);
    this._ensureExist(name);
    return this._set(name, value);
  }

  public has(name) {
    this._validateName(name);
    return !!this._get(name);
  }

  public remove(name: K): void {
    this._validateName(name);
    this._ensureExist(name);
    return this._remove(name);
  }

  //

  protected _validateName(name: K) {
    assert(typeof name === 'string', 'mandatory argument "name" missing');
  }

  protected _ensureExist(name: K) {
    if (!this._get(name)) throw new Error(`Property named "${name}" does not exist`);
  }

  protected _ensureNotExist(name: K) {
    if (this._get(name)) throw new Error(`Property named "${name}" already exists`);
  }

  protected _addNamedData(name: K, data: T): { name: K, data: T } {
    // add(name, data) {
    this._ensureNotExist(name);
    this._set(name, data);
    return {name, data};
    //return
  }

}

