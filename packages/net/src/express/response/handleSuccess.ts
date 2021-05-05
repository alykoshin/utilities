import express from 'express'
import Debug from 'debug'

import ExpressHandlerParams from './ExpressHandlerParams';

const debug = Debug('@utilities/net/express');

const DEFAULT_SUCCESS_CODE = 200;


export function handleSuccess({
  req,
  res,
  code = DEFAULT_SUCCESS_CODE,
  result,
  type = 'json',
}: ExpressHandlerParams & {
  result?: any,
  type?: 'json' | 'text',
}) {
  debug(`SUCCESS [${type}]: ${code} ${req ? '"'+req.originalUrl+'"' : ''}`, result);

  if (!res) {
    console.trace('res cannot be empty');
    return;
  }

  res.status(code);

  if (type === 'json' || req?.is('application/json')) {
    // return _sendJsonSuccess({req, res, result, code });
    const body = {
      result: result ? result : true
    };
    return res.json(body);

  } else {
    // throw new Error(`handleSuccess(): Invalid format type value: "${type}"`);
    const body = typeof result === 'string'
      ? result
      : JSON.stringify(result);
    return res.end(body);

  }
}
