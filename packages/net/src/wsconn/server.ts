import {EventEmitter2} from "eventemitter2";
import http from "http";
import {Socket} from "net";
import url from "url";

import Debug from 'debug';
import WebSocket from "ws";

import {WsConn} from "./wsConn";

import {WSClient} from ".";

//

export interface WSServerConnectionOptions {
  // parent: WebSocket.Server,
  parent: WSClient | WSServer
  // ws: WebSocket
  req: http.IncomingMessage
  client
  pingInterval: number
  inactivityTimeout: number
}


export class WSServerConnection extends WsConn {
  parent: WSClient | WSServer

  constructor(options: WSServerConnectionOptions) {
    super({
      parent: options.parent,
      // ws: options.ws,
      isServer: true,
      pingInterval: options.pingInterval,
      inactivityTimeout: options.inactivityTimeout,
    });

    const ip = options.req?.socket?.remoteAddress;
    // this._debug('   [server/connection] req?.headers:', options.req?.headers);
    let xForwardedForHeaders = options.req?.headers['x-forwarded-for'];
    if (Array.isArray(xForwardedForHeaders)) xForwardedForHeaders = xForwardedForHeaders[0];
    const xForwardedFor = xForwardedForHeaders?.split(/\s*,\s*/)?.[0] ?? '';

    this._debug(`=> [connection] New connection from IP "${ip}" xForwardedFor: "${xForwardedFor}"`, );

    this._handleActivity();
  }

}


export interface WSServerOptions {
  pingInterval: number
  inactivityTimeout: number
  port: number
  encodedToken: string
}


export class WSServer extends EventEmitter2 {
  wsServer: WebSocket.Server
  protected _options: WSServerOptions
  protected _debug: Debug
  protected _conns: WSServerConnection[] = []

  constructor(options: WSServerOptions) {
    super();
    this._options = options;
    this._debug = Debug(this.constructor.name);

    const wsOptions = {
      // port: config.port,
      noServer: true
    };
    this.wsServer = new WebSocket.Server(wsOptions);

    this.wsServer.on('connection', this.onConnection.bind(this));

    [
      'listening',
      'error',
      'headers',
      'close',
    ].forEach(name => {
      this.wsServer.on(name, (...args) => this._debug(`<= WebSocket.Server [${name}]`/*, ...args*/))
    });

    //

    const httpServer = http.createServer();
    httpServer.on('upgrade', this.onUpgrade.bind(this));

    [
      'listening',
      // 'error',
      'headers',
      'close',
    ].forEach(name => {
      httpServer.on(name, (...args) => this._debug(`<= httpServer [${name}]`/*, ...args*/))
    });
    [
      // 'listening',
      'error',
      // 'headers',
      // 'close',
    ].forEach(name => {
      httpServer.on(name, (...args) => this._debug(`<= httpServer [${name}]`, ...args))
    });

    httpServer.listen({ port: options.port });

  }


  onConnection (ws: WebSocket, req: http.IncomingMessage, client) {
    this._debug(`<= [connection] count:${this._conns.length}`);

    const conn = new WSServerConnection({
      parent: this,
      // ws,
      req,
      client,
      pingInterval:      this._options.pingInterval,
      inactivityTimeout: this._options.inactivityTimeout,
    });
    conn.ws = ws;

    const idx = this._conns.length-1;
    this._conns.push(conn);
    conn.on('close', (reason) => {
      this._debug('<= [connection] => close');
      this._conns.splice(idx,idx+1);
    })

    this.emit('connection', conn);

  }


  onUpgrade(request: http.IncomingMessage, socket: Socket, head: Buffer) {
    const pathname = url.parse(request.url).pathname;
    this._debug(`<= [upgrade] pathname: "${pathname}`);

    return this.authenticate(request, (err: Error, client?) => {
      if (err || !client) {
        const response = 'HTTP/1.1 401 Unauthorized\r\n\r\n'
        this._debug(response);
        socket.write(response);
        socket.destroy();
        return;
      }
      // if (pathname === '/foo') {
      this.wsServer.handleUpgrade(request, socket, head, (ws) => {
        this.wsServer.emit('connection', ws, request);
      });
      // } else if (pathname === '/bar') {
      //   wss2.handleUpgrade(request, socket, head, function done(ws) {
      //     wss2.emit('connection', ws, request);
      //   });
      // } else {
      //   socket.destroy();
      // }
    });

  }


  authenticate (request: http.IncomingMessage, callback: (err: Error, client?)=>void ) {

    const IGNORE_TOKEN = true;

    this._debug('   [authenticate] request?.headers:', request?.headers);

    let auth = request.headers['authorization'];
    auth = Array.isArray(auth) ? auth[0] : auth;
    const encodedToken = auth?.match(/^Basic\s(.*)/)?.[1];
    // this._debug(`   [authenticate] token: ${encodedToken}`);

    const fakeClient = { token: encodedToken, };

    if (encodedToken === this._options.encodedToken) {
      this._debug(`   [authenticate] token is valid: ${encodedToken}`);
      return callback(null, fakeClient);

    } else if (IGNORE_TOKEN) {
      this._debug(`   [authenticate] token "${encodedToken}" is invalid, but accepted as IGNORE_TOKEN=${IGNORE_TOKEN}`);
      return callback(null, fakeClient);

    } else {
      this._debug(`   [authenticate] token "${encodedToken}" is invalid and not accepted as IGNORE_TOKEN=${IGNORE_TOKEN}`);
      return callback(new Error('Unauthorized'), null);
    }

  }


}
