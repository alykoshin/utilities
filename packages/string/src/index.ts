'use strict';

const _ = require('lodash');
const urlQuery = require('./urlQuery');


const repeat = (c: string, len: number) => {
  return lpad('', len, c);
};


const lpad = (s: string, size: number, c: string = ' ') => {
  // c = c || ' ';
  if (c.length > 1)  console.warn('lpad expects one padding character');
  while (s.length < size) s = c + s;
  return s;
};


const rpad = (s: string, size: number, c: string = ' ') => {
  // c = c || ' ';
  if (c.length > 1) console.warn('rpad expects one padding character');
  while (s.length < size) s = s + c;
  return s;
};


const lpadZeros = (num: number, size: number): string => lpad(num+"", size, '0');


function splitQuoted(s: string): string[] {
  if (typeof s !== 'string') throw new Error('Expected string');
  return s
    .match(/\\?.|^$/g) // split to chars, consider \" as single char
    .reduce(
      (p, c) => {
        if (c === '"') {
          p.quote = !p.quote;
          p.space = false;
        } else if (!p.quote && c === ' ') {
          if (!p.space) {
            p.a.push('');
            p.space = true;
          }
        } else {
          p.a[ p.a.length - 1 ] +=
            c.replace(/\\(.)/, "$1"); // remove first \ char
          p.space = false;
        }
        return p;
      },
      { a: [ '' ], quote: false, space: false } // initialValue
    )
    .a;
}


const replaceEol = (s: string='', replacement: string=''): string => {
  const re = /(?:\r\n|\r|\n)/g;
  return s.replace(re, replacement);
};


const replaceEolWithBr = (s: string=''): string => {
  return replaceEol(s, '<br/>');
};


const defaultTemplate = (tmpl: string, context: object, options): string => {
  try {
    const compiled: (object)=>string = _.template(tmpl, options);
    return compiled(context);

  } catch(e) {
    const msg = 'Error processing template';
    console.error(msg, 'tmpl:', tmpl, 'context:', context);
    throw new Error(e);
  }
};


const customTemplate = (tmpl, context: object, re: RegExp): string => {
  const saved = _.templateSettings.evaluate;
  _.templateSettings.evaluate = re;

  let result;
  try {
    result = defaultTemplate(
      tmpl,
      context,
      { interpolate: re }
    );

  } finally {
    _.templateSettings.evaluate = saved;

  }
  return result;
};


const literalTemplate = (tmpl, context): string => {
  const re = /\${([\s\S]+?)}/g;
  return customTemplate(tmpl, context, re);
};


const routeTemplate = (route, values): string => {
  const re = /:([^\/]+)/g;
  return customTemplate(route, values, re);
};


const addfix = (s:string, { prefix='', delimiter='.', suffix=''}: { prefix:string, delimiter:string, suffix:string}): string => {
  return (
    (prefix ? prefix+delimiter : '') +
    s +
    (suffix ? delimiter+suffix : '')
  );
};


const joinNonEmpty = (arrayOfStrings: string[], delimiter: string='.'): string => {
  return arrayOfStrings
    .filter(s => !!s)
    .join(delimiter);
};


function generateUUID(): string {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};

/**
 * https://gist.github.com/gordonbrander/2230317#gistcomment-1175717
 */
function id_unique_13(): string {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
}


const SHORTEN_MAX_STR_LEN = 1024;
const SHORTEN_MAX_GREATER = 5;

/**
 * Limit string length by replacing middle part of it with ellipsys
 *
 *
 * @param {string}  s          - original string
 * @param {number}  [max=1024] - Maximum result string length (>5)
 * @result {string}
 */
function shorten(s: string, max: number=SHORTEN_MAX_STR_LEN): string {
  // options.body.data may be huge; we need to shorten it when printing
  if (typeof s !== 'string') return s;// = JSON.stringify(s);

  if (max<=SHORTEN_MAX_GREATER) throw new Error(`Invalid max must be greater than ${SHORTEN_MAX_GREATER}, : ${max}`);

  const ellLength = max < 20
                    ? max % 2===0
                      ? Math.trunc(max/2)-1
                      : Math.trunc(max/2)
                    : 10;

  const ell = '.'.repeat(ellLength);

  if (s.length > max) {
    s = s.substring(0,(max-ell.length)/2) +
      ell +
      s.substring(s.length - (max-ell.length)/2/*, MAX_STR_LEN*/)
  }
  return s;
}


module.exports = {
  repeat,
  lpad,
  rpad,
  lpadZeros,

  splitQuoted,
  replaceEol,
  replaceEolWithBr,

  defaultTemplate,
  customTemplate,
  literalTemplate,
  routeTemplate,

  urlQuery: urlQuery,

  addfix,
  joinNonEmpty,

  generateUUID,
  id_unique_13,

  shorten,
};
