//
// JSON-RPC 2.0 Specification
//
// https://www.jsonrpc.org/specification
//

import * as util from 'util';

import _ from 'lodash';
import Debug from 'debug';
const debug = Debug('jsonrpc');
import Ajv from 'ajv';
// import AjvImportPatch from 'ajv-merge-patch'

import {INTERNAL_ERROR_CODE, PARSE_ERROR_CODE, ERROR_CODES, INVALID_REQUEST_CODE, METHOD_NOT_FOUND_CODE} from './errors'
export * from './errors'
import {JSONRPC_VERSION} from './const'

// data schemas

import RequestSchema from './_schemas/Request.json';
// import RequestSchema_weak from './_schemas/Request_weak.json';
import NotificationSchema from './_schemas/Notification.json';
// import ResponseSchema from './_schemas/Response.json';
import SuccessResponseSchema from './_schemas/SuccessResponse.json';
import ErrorResponseSchema from './_schemas/ErrorResponse.json';
import MessageSchema from './_schemas/Message.json';

// data types


import { Request, Id } from './_types/Request'
import {Notification} from './_types/Notification'
import {SuccessResponse} from './_types/SuccessResponse'
import {ErrorResponse, ErrorObject} from './_types/ErrorResponse'

export { Request, Id, Notification, SuccessResponse, ErrorResponse };

export type Response = SuccessResponse | ErrorResponse;
export type Message = Request | Notification | ErrorResponse | SuccessResponse;
// export type MessageType = 'request'|'notification'|'errorResponse'|'successResponse'
const messageTypes = [
  'request',
  'notification',
  'errorResponse',
  'successResponse',
] as const;
type MessageType = typeof messageTypes[number];

//

async function loadSchema(uri): Promise<any> {
  //return request.json(uri).then(function (res) {
  //  if (res.statusCode >= 400)
  //    throw new Error('Loading error: ' + res.statusCode);
  //  return res.body;
  //});
  console.log('>>>>>>>>>>>>>>>> loadSchema',uri)
}
// const validator = new Ajv({ useDefaults: true, allErrors: true, loadSchema });
const messageValidator = new Ajv({ /*removeAdditional: true,*/ useDefaults: true, allErrors: true, loadSchema });

// const MessageSchema  = {
//     allOf: [
//       RequestSchema,
//       NotificationSchema,
//       SuccessResponseSchema,
//       ErrorResponseSchema,
//     ],
//   };

// const MessageSchema = {
//   "$merge": {
//     "source": {
//       "type": "object",
//       "properties": { "p": { "type": "string" } },
//       "additionalProperties": false
//     },
//     "with": {
//       "properties": { "q": { "type": "number" } }
//     }
//   }
// }
// AjvImportPatch(messageValidator);

const addValidatorSchema = (validator, Schema, schemaName) => {
  if (validator.getSchema(schemaName)) {
    throw new Error(`Schema "${schemaName}" already added`);
  }
  try {
    messageValidator.addSchema(Schema, schemaName);
  } catch (e) {
    e.message += `; Error trying to add validator schema; schemaName: ${schemaName}`;
    console.error(e);
    throw e;
  }
}

addValidatorSchema(messageValidator, RequestSchema,         'Request.json');
// addValidatorSchema(messageValidator, RequestSchema_weak,         'Request_weak.json');
addValidatorSchema(messageValidator, NotificationSchema,    'Notification.json');
addValidatorSchema(messageValidator, SuccessResponseSchema, 'SuccessResponse.json');
addValidatorSchema(messageValidator, ErrorResponseSchema,   'ErrorResponse.json');
addValidatorSchema(messageValidator, MessageSchema,   'Message.json');

const internalValidate = ( schemaName, data ) => {
  try {
    return  messageValidator.validate(schemaName, data);
  } catch (e) {
    e.message += `__checkProps: schemaName: ${schemaName}`;
    console.error(e);
    throw e;
  }
};


//

export const generateId = (prefix?: string): string => {
  return _.uniqueId(prefix);
}

export const createRequest = ({ method, params, id }: { method: string, params: any, id?: Id }): Request => {
  if (typeof id === 'undefined') id = generateId();
  const res: Request = {
    jsonrpc: JSONRPC_VERSION,
    method,
    // params,
    id,
  };
  if (typeof params !== 'undefined') res.params = params;
  return res;
}

export const createNotification = ({ method, params }: { method: string, params: any }): Notification => {
  const res: Notification = {
    jsonrpc: JSONRPC_VERSION,
    method,
    // params,
  };
  if (typeof params !== 'undefined') res.params = params;
  return res;
}

export const createSuccessResponse = ({ request, result }: { request?: Request, result?: any }): SuccessResponse => {
  const id: Id = request?.id ?? null;
  const res: SuccessResponse = {
    jsonrpc: JSONRPC_VERSION,
    result,
    id,
  };
  // if (typeof result !== 'undefined') res.result = result;
  return res;
}


//
//https://stackoverflow.com/a/54178819
//
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
//

export type ErrorInfo = PartialBy<ErrorObject, 'code'|'message'>

interface ErrorResponseArguments extends ErrorInfo {
  request?: Request|Notification
}


export const createErrorResponse = ({ request, code, message, data }: ErrorResponseArguments): ErrorResponse => {
  if (typeof code === 'undefined') code = INTERNAL_ERROR_CODE;
  if (typeof message === 'undefined') message = ERROR_CODES[code];
  const id: Id = (typeof request === 'object' && 'id' in request) ? request?.id : null;
  const res: ErrorResponse = {
    jsonrpc: JSONRPC_VERSION,
    error: {
      code,
      message,
      // data,
    },
    id,
  };
  if (typeof data !== 'undefined') res.error.data = data;
  else res.error.data = JSON.stringify(request);
  return res;
}


const validate = async (validator: Ajv.Ajv, schemaName: string, data: any, { mode }: { mode: 'throw'|'log'|'silent'}): Promise<boolean> => {
  try {
    // await messageValidator.addSchema(Schema, schemaName);        `

    // const start = new Date().getTime()
    // const hrstart = process.hrtime()

    // const valid = await messageValidator.validate(Schema, data);
    const valid = await messageValidator.validate(schemaName, data);

    // const end = new Date().getTime()
    // const hrend = process.hrtime(hrstart)
    // console.info(`[validate/${schemaName}] Execution time: %dms`, end - start)
    // console.info(`[validate/${schemaName}] Execution time (hr): %ds %dms`, hrend[0], hrend[1] / 1000000)

    if (!valid && mode !== 'silent') {
      console.log(`ERROR: schemaName: "${schemaName}", messageValidator.errors:`, messageValidator.errors);
      const msg = `Message validation failed; data: ${util.inspect(data)}; errors: ${util.inspect(validator.errors)}`;
      if (mode === 'throw') {
        throw new Error('Message validation error');
      }
    }
    return valid;

  } catch(error) {
    console.error(`ERROR:`, error);  // validator compilation or validation
    throw error;
  }
  // var valid = ajv.validate(schema, data);
  // if (!valid) {
  //   console.log(`ERROR: schemaName: "${schemaName}", messageValidator.errors:`, messageValidator.errors);
  //   const msg = `Message validation failed; data: ${util.inspect(data)}; errors: ${util.inspect(validator.errors)}`;
  //   throw new Error('Message validation error');
  // }
  // return valid;
}

export const parseMessage = (buffer: Buffer): Object => {
  try {
    let str;
    if (typeof buffer === 'string') {
      str = buffer;
    } else if (Buffer.isBuffer(buffer)) {
      str = buffer.toString();
    }
    if (typeof str === 'string') {
      const message = JSON.parse(str);
      return message;
    } else {
      return str;
    }
  } catch (error) {
    console.log('ERROR: parseMessage()', error);
    throw error;
  }
}


export const getMessageType = (message: Object): MessageType => {
  if ('method' in message) {
    if ('id' in message) return 'request';
    else return 'notification';
  } else if ('result' in message) return 'successResponse';
  else if ('error' in message) return 'errorResponse'
  else throw new Error('Invalid Message Type');
}

export const validateMessage = async (messageType: MessageType, message: Object): Promise<Message> => {

  if (messageType === 'successResponse') {
    await validate(messageValidator, 'SuccessResponse.json', message, {mode:'throw'});
    debug('<= validateMessage:SuccessResponse');
    return <SuccessResponse> message;

  } else if (messageType === 'errorResponse') {
    await validate(messageValidator, 'ErrorResponse.json', message, {mode:'throw'});
    debug('<= validateMessage:ErrorResponse');
    return <ErrorResponse> message;

  } else if (messageType === 'notification') {
    await validate(messageValidator, 'Notification.json', message, {mode:'silent'})
    debug('<= validateMessage:Notification');
    return <Notification> message;


    //
    // "weakValidation" workaround for null in request
    //
  } else if (messageType === 'request') {
    if(false /*config.weakValidation*/) {
      if (await validate(messageValidator, 'Request.json', message, {mode: 'silent'})) {
        debug('<= validateMessage:Request');
        return <Request>message;
      }
      await validate(messageValidator, 'Request_weak.json', message, {mode:'throw'})
      debug('<= validateMessage:Request_weak');
      return <Request> message;

    } else {
      await validate(messageValidator, 'Request.json', message, {mode: 'throw'});
      debug('<= validateMessage:Request');
      return <Request>message;
    }
    //


  } else {
    throw new Error('Invalid Message');

  }

}


interface ProcessMessageResult {
  messageType: string,
  parsed: Message,
}


export const processMessage = async (buffer: Buffer): Promise<ProcessMessageResult> => {

  let parsed;
  try {
    parsed = parseMessage(buffer);
    // return Promise.resolve(parsed);

  } catch (err) {
    const msg = `Parse Error`;
    const s = buffer.toString();
    // this._debug(`<= onMessage:ERROR: ${msg} "${s}"`, err);

    // return this._response(
    return Promise.reject(
      createErrorResponse({
        code: PARSE_ERROR_CODE,
        message: msg,
        data: s,
      })
    );
  }

  let messageType;
  try {
    if (typeof parsed !== 'object') throw new Error(`Expected object, but found "${typeof parsed}"`);

    messageType = await getMessageType(parsed);
    // return Promise.resolve(messageType);

  } catch (err) {
    const msg = 'Invalid Message Type';
    // this._debug(`<= onMessage:ERROR: ${msg} "${JSON.stringify(parsed)}"`, err);
    // return this._response(
    return Promise.reject(
      createErrorResponse({
        request: parsed,
        code: PARSE_ERROR_CODE,
        message: msg,
        data: parsed,
      })
    );
  }

  // let validationResult;
  try {
    await validateMessage(messageType, parsed);

  } catch (err) {
    // const s = buffer.toString();
    // this._debug(`<= onMessage:ERROR: Error validating buffer "${JSON.stringify(parsed)}"`, err);
    // return this._response(
    return Promise.reject(
      createErrorResponse({
        request: parsed,
        code: messageType === 'request' ? INVALID_REQUEST_CODE : PARSE_ERROR_CODE,
        message: 'Validation Error',
        data: parsed,
      })
    );
  }

  return Promise.resolve({ messageType, parsed });

}


