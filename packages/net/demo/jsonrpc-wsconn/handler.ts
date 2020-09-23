import {EventEmitter2} from "eventemitter2";
import Debug from 'debug';
import {applyMixins} from "@utilities/object";

import {jsonrpc} from "../../";

//

export class Handler /*extends EventEmitter*/ {
  public jrpc: jsonrpc.Jsonrpc
  protected _debug: Debug

  constructor() {
    this._debug = Debug(this.constructor.name);

    this.on('ping', this.pingResponse );
  }

  async onRequest(method: string, params_: any, request: jsonrpc.Request): Promise<any> {
    this._debug('onRequest', method, params_);

    const methods = {
      'ping': this.pingResponse,
    }
    const objMethod = methods[method];
    if (objMethod in this) return this[objMethod].call(this, params_);
  }

  async request(method: string, params: any): Promise<any> {
    return this.jrpc.request(method, params);
  }

  async pingResponse(params) {
    return Promise.resolve({});
  }

  async pingRequest(params) {
    return this.jrpc.request('ping', params);
  }

}
applyMixins(Handler, [ EventEmitter2/*, SdpBaseApiClient, SdpapiGapClient*/ ]);



type MergedClass = EventEmitter2 /*& SdpBaseApiClient & SdpapiGapClient*/;
// interface Handler extends /*EventEmitter, */SdpBaseApiClient, SdpapiGapClient {}
export interface Handler extends MergedClass {}




