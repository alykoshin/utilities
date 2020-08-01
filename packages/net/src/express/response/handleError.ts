import express from 'express'
import Debug from 'debug'

const debug = Debug('@utilities/net/express');


export function handleError({ res, code=500, error }: { res: express.Response, code?: number, error?: Error }) {
  debug('ERROR:', error);
  return res.status(code).json({
    error: {
      message: error?.message,
      data:    error,
    }
  });
}
