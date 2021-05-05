import http from 'http'
import express from 'express'
import Debug from 'debug'
import ExpressHandlerParams from "./ExpressHandlerParams";

const debug = Debug('@utilities/net/express');

const DEFAULT_ERROR_CODE = 500;
const DEFAULT_ERROR_MESSAGE = 'Internal Server Error';
const getDefaultErrorMessage = (code) => http.STATUS_CODES[code] ?? DEFAULT_ERROR_MESSAGE;

const getErrorMessage = ({ message, error, code }) => message || error?.message || getDefaultErrorMessage(code)


export function handleError({
  req,
  res,
  code = DEFAULT_ERROR_CODE,
  error,
  message,
  type = 'json',
}: ExpressHandlerParams & {
  error?: Error,
  message?: string,
  type?: 'json' | 'text',
}) {
  debug(`ERROR: ${code} ${req ? '"'+req.originalUrl+'"' : ''} ${(message?`message: "${message}", `:``)}`, error);

  if (!res) {
    debug('res cannot be empty');
    return;
  }

  res.status(code);

  if (type==='json' || req?.is('application/json')) {
    // return _sendJsonError({ req, res, code, error, message });
    const body = {
      error: {
        message: getErrorMessage({ message, error, code }),
        data: error,
      }
    };
    return res.json(body);

  } else {
    // return _sendTextError({ req, res, code, error, message });
    const body = getErrorMessage({ message, error, code });
    return res.end(body);

  }
}
