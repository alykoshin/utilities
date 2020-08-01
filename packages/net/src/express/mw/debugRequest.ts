import express from 'express'
import Debug from 'debug'

const debug = Debug('@utilities/net/express');


export const debugRequest = (req: express.Request, res: express.Response, next: express.Next) => {
  // console.log(`[${req.method} ${req.url}]: req.params:`, req.params, ' req.query:', req.query);
  debug(`[${req.method} ${req.url}]: req.params:`, req.params, ' req.query:', req.query);
  next();
}
