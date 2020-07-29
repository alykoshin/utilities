import {EventEmitter} from "events";
import Debug from 'debug';
import _ from'lodash';
import {TimerOptions} from "./timers";
const {joinNonEmpty} = require('@utilities/string');

import {defaultsDeep} from 'lodash';


type EmptyOptions = {
}

type GenericOptions = EmptyOptions & {
  [key: string]: any
}


export class OptionsStore<Options extends EmptyOptions> {
  protected _options: Partial<Options>;
  get options(): Partial<Options> { return this._options; }

  constructor(defaults: Partial<Options>) {
    this._clearOptions();
    this._assignOptions(defaults);
  }

  protected _clearOptions() {
    this._options = {};
    return this._options;
  }

  protected _assignOptions(options: Partial<Options>={}): Partial<Options> {
    this._options = defaultsDeep({}, options, this._options);
    return this._options;
  }

  protected _extendOptions(options: Partial<Options>={}): Partial<Options> {
    return this._assignOptions(options);
  }

}



export interface NamedObjectOptions {
  name?: string
}

export class NamedObject extends OptionsStore<NamedObjectOptions> {
  public readonly name: string

  constructor(options: Partial<NamedObjectOptions> = {}) {
    super(options);
    this.name = joinNonEmpty([this.constructor.name, options.name, _.uniqueId()], ':');
  }

}


export interface DebuggableObjectOptions extends NamedObjectOptions {
}

export class DebuggableObject extends NamedObject {
  protected readonly debug: Debug

  constructor(options: Partial<DebuggableObjectOptions>) {
    super(options);
    this.debug = Debug(`timers:${this.name}`)
    this.debug(`[constructor]`, this.options);
  }

}
