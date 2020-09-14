import Debug from 'debug'
import express from 'express'
import {handleError,handleSuccess} from '../'

const debug = Debug('LongPollingResponder');

const ONE_SECOND           = 1000;
const THROTTLING_TIMEOUT   = 250;
const LONG_POLLING_TIMEOUT = 10  * ONE_SECOND;


export class Responder {
  data: any[] = []
  req: express.Request  = null
  res: express.Response = null
  done: boolean     = false
  finished: boolean = false
  throttlingTimer: NodeJS.Timeout = null
  pollingTimer:    NodeJS.Timeout = null

  constructor () {
    // this.data = [];
    // this.req = null;
    // this.res = null;
    // this.done = false;
    // this.finished = false;
    // this.throttlingTimer = null;
    // this.pollingTimer    = null;
    this._reset();
  }
  _reset(): void {
    this.data = [];
    this.req = null;
    this.res = null;
  }
  _clearThrottling(): void {
    debug(`_clearThrottling`);
    if (this.throttlingTimer) {
      clearTimeout(this.throttlingTimer);
      this.throttlingTimer = null;
    }
  }
  _clearPolling(): void {
    debug(`_clearPolling`);
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  handleData(data: any): void {
    debug(`handleData`);
    this._addData(data);
    //this._tryRespond();
    this._startThrottling();
  }
  handleRequest(req: express.Request, res: express.Response): void {
    debug(`handleRequest`);
    this.req = req;
    this.res = res;
    //if (this._tryRespond()) this._startWaiting();
    this._startThrottling();
    //this._startWaiting();
  }
  finish(): void {
    debug(`finish: ${this.done} this.data`, this.data);

    this.done = true;
    this._clearTimers();
    //this._tryRespond();
    //this._respond();
    this._tryRespond();
  }
  _clearTimers(): void {
    this._clearThrottling();
    this._clearPolling();
  }
  _addData(data: any): void {
    debug(`_addData`);
    this.data.push(data);
  }
  _tryRespond(): boolean {
    debug(`_tryRespond`);
    if (this.res && this.data.length > 0) {
      this._respond();
      return true;
    }
    return false;
  }
  _respond(): boolean {
    debug(`_respond`);
    this._clearTimers();
    if (this.done) {
      this.data.push(null); // null means end of data
      this.finished = true;
    }

    handleSuccess({ req: this.req, res: this.res, result: this.data })
    // debug(`_respond: ${this.done} this.data`, this.data);
    // this.res.json({ result: this.data });

    //this._reset()
    this.data = [];
    //if (this.done) {
      this.res = null;
      this._clearPolling();
    //}
    return true;
  }
  _startThrottling(): void {
    debug(`_startThrottling: enter`);

    // if we already set this timer, just continue to wait until it trigger
    //this._clearThrottling();
    if (!this.throttlingTimer) {
      debug(`_startThrottling: setting timer`);
      this.throttlingTimer = setTimeout(() => {
        debug(`throttlingTimer: triggered: done:${this.done} finished:${this.finished}`);
        this._clearThrottling();
        if (!this._tryRespond()) this._startWaiting();
      }, THROTTLING_TIMEOUT);
    }
  }
  _startWaiting(): void {
    debug(`_startWaiting`);
    if (this.pollingTimer) {
      debug(`_startWaiting: pollingTimer is already active, clearing`);
      this._clearPolling();
    }
    this.pollingTimer = setTimeout(() => {
      debug(`pollingTimer: triggered: done:${this.done} finished:${this.finished}`);
      this._clearTimers();
      if (!this.finished) {
        //this.done = true;
        this._respond();
        //this._reset();
      }
    }, LONG_POLLING_TIMEOUT);
  }
}


export class Responders {
  protected responders: { [key:string]: Responder } = {}

  public new (id: string): Responder {
    if (this.responders[id]) {
      throw new Error(`Another request with same id ${id} is in progress`);
    } else {
      const responder = new Responder();
      this.responders[ id ] = responder;
      return responder;
    }
  }

  public handleData(id: string, data: any): void {

    if (!this.responders[id]) {
      return console.error(`runner.on(output): received for non-existing request`);
    }
    //responders[id].data += data;
    //if (responders[id].res) res.json(data);
    this.responders[id].handleData(data);
  }

  public cleanResponder(id: string): void {
    console.log(`*** cleanResponder: enter`)
    // if we have data, keep responder for some time
    // maybe somebody will read it...
    // bt not for a long otherwise it will prevent consecutive requests...
    const CLEANUP_TIMEOUT = 500;
    if (this.responders[ id ]) {

      console.log(`*** cleanResponder: responder "${id}" exists; finish it now, but postpone its deletion for ${CLEANUP_TIMEOUT}ms`);
      this.responders[ id ].finish();

      setTimeout(() => {
          console.log('*** cleanResponder: timer has been triggered; deleting the responder')
          delete this.responders[ id ];
        }, CLEANUP_TIMEOUT
      );
    }
  }

  public handleRequest(id: string, req: express.Request, res: express.Response): void {
    if (typeof this.responders[id] === 'undefined') {
      return handleError({ req, res, code: 404, error: new Error(`Not Found "${id}"`)})
    }
    return this.responders[id].handleRequest(req, res);
  }

}
