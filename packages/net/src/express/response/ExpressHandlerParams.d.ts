import express from 'express'

export interface ExpressHandlerParams {
  req: express.Request,
  res: express.Response,
  code?: number,
}

export default ExpressHandlerParams
