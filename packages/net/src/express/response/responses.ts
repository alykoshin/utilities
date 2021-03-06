import http from "http";
import express from 'express'

//

const DEFAULT_SUCCESS_CODE = 200;

export function _sendJsonSuccess({ req, res, code=DEFAULT_SUCCESS_CODE, result }: { req: express.Request, res: express.Response, code?: number, result?: any }) {
  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  return res.status(code).json({
    result: result ? result : true
  });
}

//

const DEFAULT_ERROR_CODE = 500;

const getDefaultMessage = (code) => http.STATUS_CODES[code];

export function _sendJsonError({ req, res, code=DEFAULT_ERROR_CODE, error, message }: { req: express.Request, res: express.Response, code?: number, error?: Error, message?: string }) {
  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  return res.status(code).json({
    error: {
      message: message || error?.message || getDefaultMessage(code),
      data: error,
    }
  })
}

export function _sendTextError({ req, res, code=DEFAULT_ERROR_CODE, error, message }: { req: express.Request, res: express.Response, code?: number, error?: Error, message?: string }) {
  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  return res.status(code).send(//{
    // error: {
    //   message:
    message || error?.message || getDefaultMessage(code),
      // data: error,
    // }
  // }
  )
}


