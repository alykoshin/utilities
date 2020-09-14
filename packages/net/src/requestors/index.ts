import Debug from 'debug';
import { Timer } from "@utilities/object";

export const REQUEST_TIMEOUT = 5000

import {INVALID_PARAMS_CODE} from "./jsonrpc/src/errors"
import {ErrorObject} from "./jsonrpc/src/_types/ErrorResponse"
import {Request} from "./jsonrpc/src/_types/Request"
import {NodeJSError} from './errors'


export type RequestPromiseResolve<ResultType> = (result: ResultType) => void;
export type RequestPromiseReject<ErrorType>  = (error: ErrorType) => void;
export type RequestCallback<ResultType,ErrorType> = (error: ErrorType, result: ResultType) => void

export type RequestTimeoutParentCallback<ResultType,ErrorType> = (id: string, requestor: Requestor<ResultType,ErrorType>)=>void

const debug = Debug('requestor');

export class Requestor<ResultType,ErrorType> {
  _id:       string
  _request:  Request
  // timeout: Timeout
  _timer:    Timer
  _resolve:  RequestPromiseResolve<ResultType>
  _reject:   RequestPromiseReject<ErrorType>
  _callback: RequestCallback<ResultType,ErrorType> // GenericNodejsCallback
  _onRequestTimeoutParent: RequestTimeoutParentCallback<ResultType,ErrorType>
  _timeoutError: ErrorType

  constructor({
                id,
                request,

                resolve,
                reject,
                callback,
                onRequestTimeoutParent,

                timeout=REQUEST_TIMEOUT,
                timeoutError,
              }: {
    id: string,
    request: Request,

    resolve: RequestPromiseResolve<ResultType>,
    reject: RequestPromiseReject<ErrorType>,
    callback?: RequestCallback<ResultType,ErrorType>,
    onRequestTimeoutParent: RequestTimeoutParentCallback<ResultType,ErrorType>,

    timeout?: number,
    timeoutError: ErrorType
  }) {
    this._id       = id;
    this._request  = request;
    this._resolve  = resolve;
    this._reject   = reject;
    this._callback = callback;
    this._onRequestTimeoutParent = onRequestTimeoutParent;
    this._timeoutError = timeoutError;

    this._timer = new Timer({ // timer to wait for response
      autostart: true,
      timeout: timeout,
      // callback: (error, timeout) => { this.onRequestTimeout(id, timeout, this) },
      callback: this._onRequestTimeout.bind(this),
    })

  }

  _onRequestTimeout(error: Error, timeout: number): void {
    // const err = {code: 0, message: `TIMEOUT ${REQUEST_TIMEOUT}ms`};
    debug(`Requestor._onRequestTimeout: ${timeout}ms for request:`, this._request);
    if (this._callback) this._callback(this._timeoutError, undefined);
    this._reject(this._timeoutError);
    this._onRequestTimeoutParent(this._id, this);
  }

  request() {

  }

  _respond(error: ErrorType, result: ResultType) {
    // stop timer
    this._timer.stop();
    // return result/error to the requestor
    if (this._callback) this._callback(error, result);
    if (error) {
      return this._reject(error);
    } else {
      return this._resolve(result);
    }
  }

  respondSuccess(result: ResultType) {
    return this._respond(null, result);
  }

  respondError(error: ErrorType) {
    return this._respond(error, undefined);
  }

}


export class Requestors<ResultType,ErrorType> {
  protected _debug: Debug
  protected _timeoutError: ErrorType
  protected _requestors: {
    [id: string]: Requestor<ResultType,ErrorType>,
  } = {}

  constructor({ timeoutError }: { timeoutError: ErrorType }) {
    this._debug = Debug(this.constructor.name);
    this._timeoutError = timeoutError;
  }

  protected _create({
                      id,
                      request,

                      resolve,
                      reject,
                      callback,

                      timeout=REQUEST_TIMEOUT,
                    }: {
    id: string,
    request: Request,

    resolve: RequestPromiseResolve<ResultType>,
    reject: RequestPromiseReject<ErrorType>,
    callback?: RequestCallback<ResultType,ErrorType>,

    timeout?: number,
  }) {
    const requestor = new Requestor({
      id,
      request,

      resolve,
      reject,
      callback,
      onRequestTimeoutParent: this.onRequestTimeout.bind(this),

      timeout,
      timeoutError: this._timeoutError,
    });
    return this._add(id, requestor);
  }

  new({
        id,
        request,

        resolve,
        reject,
        callback,

        timeout,
      }: {
    id: string,
    request: Request,

    resolve:   RequestPromiseResolve<ResultType>,
    reject:    RequestPromiseReject<ErrorType>,
    callback?: RequestCallback<ResultType,ErrorType>,

    timeout?: number,
  }) {
    const requestor = this._create({
      id,
      request,

      resolve,
      reject,
      callback,

      timeout,
    });
    return this._add(id, requestor);
  }

  protected onRequestTimeout(id: string, requestor: Requestor<ResultType,ErrorType>): void {
    this.remove(id);
  }

  protected _add(id, requestor: Requestor<ResultType,ErrorType>): Requestor<ResultType,ErrorType> {
    this._requestors[id] = requestor;
    return requestor;
  }

  protected remove(id: string): void {
    const requestor = this.get(id);
    if (requestor) {
      delete this._requestors[id];
    }
  }

  public get(id: string): Requestor<ResultType,ErrorType> {
    const requestor = this._requestors[id];
    if (requestor) {
      return requestor;
    } else {
      this.handleRequestNotFound(id);
      return null;
    }
  }

  protected handleRequestNotFound(id) {
    const code = INVALID_PARAMS_CODE;
    const msg = 'Invalid id';
    // const error = new Error(msg);
    // error.code = code;
    this._debug(`ERROR ${code} "${msg}", id: "${id}"`);
  }

  public respondSuccess(id, result) {
    const requestor = this.get(id);
    if (requestor) {
      // we found original request for this response;
      // return response to it
      requestor.respondSuccess(result);
      // delete object
      this.remove(id)
    }
  }

  public respondError(id, error) {
    const requestor = this.get(id);
    if (requestor) {
      // we found original request for this response;
      // return response to it
      requestor.respondError(error);
      // delete object
      this.remove(id)
    }
  }

}


