import {EventEmitter2} from "eventemitter2";

import Debug from 'debug';
import WebSocket from "ws";

import {WSServer} from ".";
import {NodeJSError,GenericNodejsCallback} from '../types'

import {WsConn} from "./wsConn";


export interface WSClientConnectionOptions {
  parent?: WSClient | WSServer
  // ws: WebSocket
  // req?: http.IncomingMessage
  // isServer: boolean,
  url: string
  pingInterval: number
  inactivityTimeout: number
  reconnectInterval: number
  encodedToken: string
}

type ConnectResolve  = (result: any) => void;
type ConnectCallback = GenericNodejsCallback;


export class WSClientConnection extends WsConn {
  protected _connecting: boolean
  private _connectResolve: ConnectResolve
  private _connectCallback: ConnectCallback
  protected _reconnectAttempt: number
  // protected url: string
  parent: WSClient | WSServer
  protected _options: WSClientConnectionOptions

  constructor(options: WSClientConnectionOptions) {
    super({ ...options, isServer: false });
    this._options = options;
    this._connecting = true;
    this._reconnectAttempt = 0;
  }

  protected onOpen(data: Buffer) {
    super.onOpen(data);
    this._connecting = false;
    this._reconnectAttempt = 0;
    this._connectResolve(true);
  }

  protected onClose(reason) {
    super.onClose(reason);
    this.delayedReconnect();
  }

  protected onError (err: NodeJSError) {
    super.onError(err);
    this._connecting = false;
    if (err.code === 'ECONNREFUSED') {
      //  this.delayedReconnect();
    }
    // close; we'll try to reconnect in on('close') handler
    this.close();
  }

  protected onMessage(data: Buffer) {
    super.onMessage(data);
    // this._sendTestResponse();
  }

  close() {
    this._debug('=> [close]');
    this.timers.stop();
    this.ws.close();
  }

  _connect(): WebSocket {
    this._debug('=> [_connect]');
    // this._connecting = true;
    //
    // https://stackoverflow.com/questions/46998781/web-socket-connection-with-basic-access-authentication
    //
    const encodedToken = this._options.encodedToken;
    const wsOptions = {
      perMessageDeflate: false,
      headers: {
        Authorization: `Basic ${encodedToken}`,
      },
    }

    const ws = new WebSocket( this._options?.url, wsOptions );

    return ws;
  }

  async connect(cb?: ConnectCallback): Promise<void> {
    return new Promise((resolve, reject) => {

      this._debug('=> [connect]');
      this.ws = this._connect();

      this._connectResolve = resolve;
      this._connectCallback = cb;
    })

  }

  async _reconnect(cb?: ConnectCallback) {
    this._reconnectAttempt++;
    this._debug(`   [_reconnect] attempt ${this._reconnectAttempt}`);
    return this.connect(cb);
  }

  async delayedReconnect(cb?: ConnectCallback): Promise<void> {
    return new Promise((resolve, reject) => {
      this._debug(`   [delayedReconnect] will reconnect after ${this._options.reconnectInterval} ms`);
      return setTimeout(async () => {
        try {
          await this._reconnect(cb);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, this._options.reconnectInterval)
    });
  }

}



export interface WSClientOptions {
  ws: WebSocket
  url: string
  pingInterval: number
  inactivityTimeout: number
  reconnectInterval: number
  encodedToken: string
}


export class WSClient extends EventEmitter2 {
  public conn: WSClientConnection
  protected _options: WSClientOptions
  protected _debug: Debug

  constructor(options: WSClientOptions) {
    super();
    this._debug = Debug(this.constructor.name);
    this._options = options;
    this.conn = new WSClientConnection({
      parent: this,
      url: this._options.url,
      pingInterval: this._options.pingInterval,
      inactivityTimeout: this._options.inactivityTimeout,
      encodedToken: this._options.encodedToken,
      reconnectInterval: this._options.reconnectInterval,
    });
  }

  _connect(cb?: GenericNodejsCallback): Promise<void> {
    this._debug('=> [_connect]');
    // this._connecting = true;
    //
    // https://stackoverflow.com/questions/46998781/web-socket-connection-with-basic-access-authentication
    //
    const encodedToken = this._options.encodedToken;
    const wsOptions = {
      perMessageDeflate: false,
      headers: {
        Authorization: `Basic ${encodedToken}`,
      },
    }

    // const ws = new WebSocket( this._options?.url, wsOptions );

    // const conn = new WSClientConnection({
    //   url: this._options.url,
    //   parent: this,
    //   // ws,
    //   pingInterval:      this._options.pingInterval,
    //   inactivityTimeout: this._options.inactivityTimeout,
    // });
    return this.conn.connect(cb);
  }

  async connect(cb?: GenericNodejsCallback): Promise<void> {
    // return new Promise((resolve, reject) => {
    this._debug('=> [connect]');
    return this._connect(cb);

  }


} // class Client

