import express from 'express'
import Debug from 'debug'

const debug = Debug('@utilities/net/express');


export function handleSuccess({ res, code=200, result, format='josn' }: { res: express.Response, code?: number, result?: any, format?: string }) {
  debug('SUCCESS:', result);
  if (format==='json') {
    return res.status(code).json({
      result: result ? result : true
    });
  } else throw new Error('handleSuccess(): Invalid format value');
}
