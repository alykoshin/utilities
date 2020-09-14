//
// JSON-RPC 2.0 Specification
//
// https://www.jsonrpc.org/specification
//

import {EventEmitter2} from "eventemitter2";

import Debug from 'debug';

import {INTERNAL_ERROR_CODE, METHOD_NOT_FOUND_CODE} from './errors'

import { Request, Id } from './_types/Request'
import {Notification} from './_types/Notification'
import {SuccessResponse} from './_types/SuccessResponse'
import {ErrorResponse, ErrorObject} from './_types/ErrorResponse'

import {
  Response, Message, ErrorInfo,
  createErrorResponse, createNotification,createRequest,createSuccessResponse,processMessage,generateId
} from './methods'


export interface GenericNodejsCallback { (error: Error|undefined, ...result: any[]): any }

import { Requestors, Requestor, RequestPromiseResolve, RequestPromiseReject, RequestCallback, REQUEST_TIMEOUT } from '../requestors'


export interface JsonrpcTransport extends EventEmitter2 {
  send (data: string|Buffer, cb?: GenericNodejsCallback): Promise<void>
  sendJson (data: any, cb?: GenericNodejsCallback): Promise<void>
}

export interface JsonrpcHandler extends EventEmitter2 {
  onRequest(method: string, params: any, request: Request): Promise<any>
}

//

export class Jsonrpc extends EventEmitter2 {
  protected _debug: Debug
  protected _transport: JsonrpcTransport
  protected _handler: JsonrpcHandler
  // protected requestors: {
  //   [id: string]: RequestData,
  // } = {}
  protected _requestors: Requestors<Request,ErrorObject>

  constructor ({
                 transport,
                 handler,
               }: {
    transport: JsonrpcTransport,
    handler: JsonrpcHandler,
  }) {
    super();
    this._debug = Debug(this.constructor.name);
    this._requestors = new Requestors({
      timeoutError: {code: 0, message: `TIMEOUT ${REQUEST_TIMEOUT}ms`},
    });

    this._transport = transport;
    this._handler = handler;
    transport.on('message', this.onMessage.bind(this))
  }

  protected async onMessage(buffer: Buffer): Promise<void> {
    // super.handleMessage(buffer);
    this.emit('message', buffer);

    this._debug('<= onMessage:message', buffer)

    // // const str = buffer.toString();
    // // let message: Request | Notification | ErrorResponse | SuccessResponse;
    // let parsed;
    // let messageType;
    try {
      // parsed = await processMessage(buffer);
      const { parsed, messageType } = await processMessage(buffer);
    //   parsed = parseMessage(buffer);

      switch (messageType) {
        case 'request': return this.onRequest(<Request> parsed);
        case 'notification': return this.onNotification(<Notification> parsed);
        case 'errorResponse': return this.onErrorResponse(<ErrorResponse> parsed);
        case 'successResponse': return this.onSuccessResponse(<SuccessResponse> parsed);
        default: throw new Error('Invalid message type');
      }

    } catch (err) {
    //   const msg = `Parse Error`;
    //   const s = buffer.toString();
    //   this._debug(`<= onMessage:ERROR: ${msg} "${s}"`, err);
    //
    //   if (err instanceof ErrorResponse)
      if (err instanceof Error) throw err;

      return this._response( err
    //     createErrorResponse({
    //       code: PARSE_ERROR_CODE,
    //       message: msg,
    //       data: s,
    //     })
      )
    }


  }

  protected async onNotification(notification: Notification): Promise<void> {
    this._debug('<= onNotification', JSON.stringify(notification,null,2));
    try {
      await this._emitEvent(notification.method, notification.params, notification);
    } catch(error) {
      this._debug('onRequest >>> errorResponse', error)
      await this.errorResponse(notification, error);
      return;
    }
    this.emit('notification', notification.method, notification.params);
  }

  protected onSuccessResponse(response: SuccessResponse): void {
    this._debug('<= onSuccessResponse:', JSON.stringify(response,null,2))
    this._requestors.respondSuccess(response.id, response.result);
  }

  protected onErrorResponse(response: ErrorResponse): void {
    this._debug('<= onResponse:', JSON.stringify(response,null,2))
    this._requestors.respondError(response.id, response.error);
  }

  protected async _emitEvent(method: string | symbol, ...args: any[]): Promise<any> {
    //
    // remove dot from method name, example: 'gap.InitialDP' to 'gapInitialDP'
    //
    if (typeof method === 'string') {
      // method = method.replace('.', '');
      method = method.replace(/([\-\_\.\ ])([a-z]?)/ig, (match,$1,$2)=>{/*console.log(`(${match})[${$1}][${$2}]`);*/return $2.toUpperCase();})

    }
    //
    this._debug(`   _emitEvent: method: ${String(method)}`)

    // return this._handler.emit(method, ...args);
    const emitResult = await this._handler.emitAsync(method, ...args);

    if (emitResult.length === 0) {
      return Promise.reject({ code: METHOD_NOT_FOUND_CODE })
    } if (emitResult.length > 1) {
      console.warn(`emitResult.length: ${emitResult.length}`)
    }
    return emitResult[0];
  }

  protected async onRequest(request: Request): Promise<void> {
    this._debug('<= onRequest:', JSON.stringify(request,null,2))
    try {
      // const promisedResult = await this.emit('request', request.method, request.params,
      const emitResult = await this._emitEvent(request.method, request.params, request);
      this._debug('<= onRequest:emitResult:', emitResult)
      return this.successResponse(request, emitResult);

    } catch(error) {
      this._debug('onRequest >>> errorResponse', error)
      return this.errorResponse(request, error);

    }
  }


  protected getNewId(prefix?: string): string {
    return generateId(prefix);
  }


  protected async _request(request: Request, callback?: RequestCallback<Request,ErrorObject>): Promise<any> {
    this._debug('=> _request', JSON.stringify(request,null,2));
    const id = request.id;

    // send request

    await this._transport.sendJson(request);

    //

    return new Promise((resolve: RequestPromiseResolve<Request>, reject: RequestPromiseReject<ErrorObject>) => {

      // store request data
      this._requestors.new({ id: id.toString(), request, resolve, reject, callback })

    })
  }

  protected _notification(notification: Notification, cb?: GenericNodejsCallback): Promise<void> {
    this._debug('=> _notification', JSON.stringify(notification,null,2));
    return this._transport.sendJson(notification, cb);
  }


  protected _response(response: Response, cb?: GenericNodejsCallback): Promise<void> {
    this._debug('=> _response', JSON.stringify(response,null,2));
    return this._transport.sendJson(response, cb);
  }

//

  public async request(method: string, params: any, cb?: RequestCallback<Request,ErrorObject>): Promise<any> {
    this._debug('=> request', method, params);
    return this._request(
      createRequest({
        method,
        params,
      }),
      cb,
    );
  }


  public notification(method: string, params: any): Promise<void> {
    return this._notification(
      createNotification({
        method,
        params,
      })
    );
  }


  public successResponse (request: Request, result: any): Promise<void> {
    return this._response(
      createSuccessResponse({
        request,
        result,
      }));
  }


  public errorResponse (request, { code=INTERNAL_ERROR_CODE, message, data }: ErrorInfo): Promise<void> {
    return this._response(
      createErrorResponse({
        request,
        code,
        message,
        data,
      })
    );
  }


}
