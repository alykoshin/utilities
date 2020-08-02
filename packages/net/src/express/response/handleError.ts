import http from 'http'
import express from 'express'
import Debug from 'debug'

import { _sendJsonError, _sendTextError } from "./responses";

const debug = Debug('@utilities/net/express');



export function handleError({ req, res, code, error, type='json' }: { req: express.Request, res: express.Response, code?: number, error?: Error, type?: string }) {
  debug('ERROR:', error);

  if (type==='json' || req?.is('application/json')) {
    return _sendJsonError({ req, res, code, error });

  } else {
    return _sendTextError({ req, res, code, error });
  }
}
