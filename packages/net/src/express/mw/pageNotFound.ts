import express from 'express'
import Debug from 'debug'

import {handleError} from '../../'

const debug = Debug('@utilities/net/express');


export const pageNotFoundMw = (req: express.Request, res: express.Response, next: express.Next) => {
  //return res.status(404)
  //.send('Page Not Found');
  //console.log('Page Not Found');
  // console.log(`[${req.method} ${req.url}]: req.params:`, req.params, 'NOT FOUND');
  debug(`[${req.method} ${req.url}]: req.params:`, req.params, 'NOT FOUND');
  // if (req.is('application/json')) {
  //   return res.status(404).json({ error: '404 Not found' });
  // } else {
  //   return res.status(404).send('404 Not found');
  // }
  //next();
  handleError({ req, res, code: 404 });
}
