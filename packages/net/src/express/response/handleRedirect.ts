import http from 'http'
import express from 'express'
import Debug from 'debug'
import ExpressHandlerParams from "./ExpressHandlerParams";

const debug = Debug('@utilities/net/express');

const DEFAULT_REDIRECT_CODE = 302;
const DEFAULT_ERROR_MESSAGE = 'Internal Server Error';


export function handleRedirect({
  req,
  res,
  code = DEFAULT_REDIRECT_CODE,
  url,
}: ExpressHandlerParams & {
  url?: string;
}) {
  debug(`REDIRECT: ${code} ${req ? '"'+req.originalUrl+'"' : ''} -> "${url}"`);

  if (!res) {
    debug('REDIRECT: res cannot be empty');
    return;
  }

  return res.redirect(code, url);
}
