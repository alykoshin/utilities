import util from "util";
import {EventEmitter2} from "eventemitter2";
import {TimerGroup} from "@utilities/object";

import { ClientRequest, ServerResponse, IncomingMessage } from "http";
import Debug from 'debug';
import WebSocket from 'ws';

import { WSClient } from ".";
import { WSServer } from ".";

import {NodeJSError} from "../types";

//

interface ClientRequest_fix extends ClientRequest {
  method: string   // not defined in @node/types@12 and earlier
  host: string     // not defined in @node/types@14
  protocol: string // not defined in @node/types@14
}

type WSParent = WSClient | WSServer

type WsPing = {
  start: Date
}
type WsPong = WsPing

interface WsConnConstructorOptions {
  parent?: WSParent,
  // ws: WebSocket,
  isServer: boolean,
  pingInterval: number,
  inactivityTimeout: number,
}

export class WsConn extends EventEmitter2 {
  protected _isServer: boolean
  protected _parent: WSClient | WSServer
  protected timers: TimerGroup
  protected _debug: Debug
  protected _ws: WebSocket
  public get ws (): WebSocket { return this._ws }
  public set ws (value) {
    this._ws = value;
    this._setHandlers();
  }

  constructor({ /*ws,*/ parent, isServer, pingInterval, inactivityTimeout }: WsConnConstructorOptions) {
    super();
    this._debug = Debug(this.constructor.name);
    // this._ws = ws;
    this._parent = parent;
    this._isServer = isServer;
    this.timers = new TimerGroup();
    this.timers.create({
      name: 'ping',
      autostart: false,
      timeout: pingInterval,
      // callback: () => this.ping(),
      callback: this.onPingTimer.bind(this),
    })
    this.timers.create({
      name: 'terminate',
      autostart: false,
      timeout:   inactivityTimeout,
      // callback:  this.terminate.bind(this),
      callback:  this.onTerminateTimer.bind(this),
    })
  }


  protected _setHandlers() {
    this._ws.on('close', this.onClose.bind(this));
    this._ws.on('error', this.onError.bind(this));
    this._ws.on('message', this.onMessage.bind(this));
    this._ws.on('open', this.onOpen.bind(this));
    this._ws.on('ping', this.onPing.bind(this));
    this._ws.on('pong', this.onPong.bind(this));

    [
      'conclude',
      'drain',
      'upgrade',
      // 'unexpected-response',
    ].forEach(name => this._ws.on(name, (...args) => this._debug(`<= [${name}]`)));
    [
      // 'conclude',
      // 'drain',
      // 'upgrade',
      'unexpected-response',
    // ].forEach(name => this._ws.on(name, (...args) => {
    ].forEach(name => this._ws.on(name, (request: ClientRequest_fix, response: IncomingMessage): void => {
      // this._debug(`<= [${name}]`, req, res);
      this._debug(`<= [${name}]`, `${request.method} ${request.protocol}//${request.host}${request.path}`, response.statusCode, response.statusMessage);
      // this._debug(`<= [${name}]`, args.length);
      // console.log(req)
    }));

    [

    ].forEach(name => this._ws.on(name, (...args) => this._debug(`<= [${name}]`, ...args)));

    // this._ws.on('conclude', () => { this._debug('<= [conclude]');  });
    // this._ws.on('drain',    () => { this._debug('<= [drain]');  });
    // this._ws.on('upgrade', (res) => { this._debug('<= [upgrade]');  });
    // this._ws.on('unexpected-response', (req, res) => { this._debug('<= [unexpected-response]');  });
  }

  //

  protected _handleActivity() {
    this._debug('   _handleActivity');
    this.timers.restart();
  }

  //

  protected onClose(reason) {
    this._debug('<= [close]', reason)
    this.emit('close', reason);
    this.timers.stop();
  }

  protected onError(err: NodeJSError) {
    this._debug(`<= [error] code ${err.code}`);
    this._debug(`         `, err);
  }

  protected onMessage(data: Buffer) {
    this._debug('<= [message]', data);
    this.emit('message', data);
    this._handleActivity();
  }

  protected onOpen(data: Buffer) {
    this._debug('<= [open]', data);
    this.emit('open', data);
    this._handleActivity();
  }

  protected onPing(buffer: Buffer) {
    const s = buffer.toString();
    // this._debug(`<= [onPing]`, s);
    try {
      const data = JSON.parse(s);
      this._debug(`<= [onPing] ${util.inspect(data)} roundtrip delay: ${Date.now() - Date.parse(data.start)}ms`);
    } catch (err) {
      this._debug(`<= [onPing] <invalid data>`);
    }
    this._handleActivity();
  }

  protected onPong(buffer: Buffer) {
    const s = buffer.toString();
    // this._debug(`<= [onPong]`, s);
    try {
      const data = JSON.parse(s);
      this._debug(`<= [onPong] ${util.inspect(data)} roundtrip delay: ${Date.now() - Date.parse(data.start)}ms`);
    } catch (err) {
      this._debug(`<= [onPong] <invalid data>`);
    }
    this._handleActivity();
  }

  //

  public terminate(): void {
    this._debug('=> [terminate]');
    this.timers.stop();
    return this._ws.terminate();
  }

  public _pingPong(method: 'ping'|'pong', data: WsPing, cb?:(err:Error)=>void): Promise<void> {
    this._debug(`=> [_pingPong]`, method, data);
    return new Promise((resolve, reject) => {
      return this._ws[method](JSON.stringify(data), !this._isServer, (err: Error): void => {
        if (err) {
          this._debug(`=> [${method}] err:`, err)
          if (cb) cb(err);
          return reject(err);
        }
        if (cb) cb(null);
        resolve();
      });
    });
  }

  protected onPingTimer(error, timeout): void {
    this._debug('   [onPingTimer]');
    this.ping();
  }

  protected onTerminateTimer(error, timeout): void {
    this._debug('   [onTerminateTimer]');
    this.terminate();
  }

  public ping(cb?:(err:Error)=>void): Promise<void> {
    this._debug('=> [ping]');
    const data = {
      start: new Date(),//.toISOString(),
    };
    return this._pingPong('ping', data, cb);
  }

  public pong(cb?:(err:Error)=>void): Promise<void> {
    this._debug('=> [pong]');
    const data = {
      start: new Date(),//.toISOString(),
    };
    return this._pingPong('pong', data, cb);
  }

  //

  send(data: any, cb?: (err: Error)=> void): Promise<void> {
    this._debug('=> [send]', data);

    return new Promise((resolve, reject) => {
      this._ws.send(data, (err) => {
        if (cb) cb(err);
        resolve();
      });
    });
  }

  sendJson(data: object, cb?: (err: Error)=> void): Promise<void> {
    this._debug('=> [sendJson]');
    // this._debug('=> [sendJson]', data);

    const s = JSON.stringify(data);
    return this.send(s, cb);
  }

  //

}
