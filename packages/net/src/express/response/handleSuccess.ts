import express from 'express'
import Debug from 'debug'

import { _sendJsonSuccess } from "./responses";

const debug = Debug('@utilities/net/express');


export function handleSuccess({ req, res, code=200, result, type='json' }: { req: express.Request, res: express.Response, code?: number, result?: any, type?: string }) {
  debug(`SUCCESS [${type}]:`, result);

  if (type==='json') {
    return _sendJsonSuccess({ req, res, result });
  } else {
    throw new Error(`handleSuccess(): Invalid format type value: "${type}"`);
  }
}
