const _ = require('lodash');


export class Counters {
  private _logger;
  private _data;

  constructor (logger=console) {
    this._logger = logger;
    this.resetAll();
  }

  _get (name, defaultValue) {
    return _.get(this._data, name, defaultValue);
  }

  _set (name, value) {
    return _.set(this._data, name, value);
  }

  resetAll() {
    this._data = {};
  }

  get (name, defaultValue: any = 0) {
    return this._get(name, defaultValue);
  }

  set (name, value) {
    return this._set(name, value);
  }

  reset(name) {
    return this.set(name, 0);
  }

  inc (name, value=1) {
    const current = this.get(name, 0);
    return this.set(name, current+value);
  }

  print(msg='Counters:') {
    this._logger.info(msg, this._data);
  }

}


// export = Counters;
