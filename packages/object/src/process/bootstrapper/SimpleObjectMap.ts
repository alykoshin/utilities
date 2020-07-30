const assert = require('assert');


interface GetOptions {
  mustExist: boolean
}

export class SimpleObjectMap {
  private readonly _data: { [k: string]: any; };

  constructor () {
    this._data = {};
  }

  protected _get(name: string): any {
    return this._data[name];
  }

  protected _set(name: string, value: any) {
    this._data[name] = value;
  }

  protected _ensureExist(name: string) {
    assert(typeof name === 'string', 'mandatory argument "name" missing');
    if (!this._get(name)) throw new Error(`Property named "${name}" does not exist`);
  }

  protected _ensureNotExist(name: string) {
    assert(typeof name === 'string', 'mandatory argument "name" missing');
    if (this._get(name)) throw new Error(`Property named "${name}" already exists`);
  }

  //

  public get(name: string, { mustExist=true }: GetOptions={mustExist:true}): any {
    if (mustExist) this._ensureExist(name);
    return this._get(name);
  }

  public set(name: string, value: any): any {
    this._ensureExist(name);
    return this._set(name, value);
  }

  public has(name) {
    return !!this._get(name);
  }

  public add(name: string, data: any): {name: string, data: any} {
    // add(name, data) {
    this._ensureNotExist(name);
    this._set(name, data);
    return { name, data };
    //return
  }

  public remove(name: string): void {
    this._ensureExist(name);
    delete this._data[name];
  }

}


export default SimpleObjectMap
