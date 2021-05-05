import http from "http";
import express from 'express'

//

const DEFAULT_SUCCESS_CODE = 200;

export function _sendJsonSuccess({
  req,
  res,
  code=DEFAULT_SUCCESS_CODE,
  result
}: {
  req: express.Request,
  res: express.Response,
  code?: number,
  result?: any,
}) {
  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  return res
    .status(code)
    .json({
      result: result ? result : true
    });
}

//

const DEFAULT_ERROR_CODE = 500;
const DEFAULT_ERROR_MESSAGE = 'Internal Server Error';

const getDefaultErrorMessage = (code) => http.STATUS_CODES[code] ?? DEFAULT_ERROR_MESSAGE;

export function _sendJsonError({
  req,
  res,
  code = DEFAULT_ERROR_CODE,
  error,
  message,
}: {
  req: express.Request,
  res: express.Response,
  code?: number,
  error?: Error,
  message?: string,
}) {
  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  return res.status(code).json({
    error: {
      message: message || error?.message || getDefaultErrorMessage(code),
      data: error,
    }
  })
}

export function _sendTextError({
  req,
  res,
  code = DEFAULT_ERROR_CODE,
  error,
  message,
}: {
  req: express.Request,
  res: express.Response,
  code?: number,
  error?: Error,
  message?: string,
}) {
  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  return res.status(code).send(//{
    // error: {
    //   message:
    message || error?.message || getDefaultErrorMessage(code),
    // data: error,
    // }
    // }
  )
}


