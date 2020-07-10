'use strict';

const _ = require('lodash');
const urlQuery = require('./urlQuery');


const repeat = (c, len) => {
  return lpad('', len, c);
};


const lpad = (s, size, c) => {
  c = c || ' ';
  if (c.length > 1)  console.warn('lpad expects one padding character');
  while (s.length < size) s = c + s;
  return s;
};


const rpad = (s, size, c) => {
  c = c || ' ';
  if (c.length > 1) console.warn('rpad expects one padding character');
  while (s.length < size) s = s + c;
  return s;
};


const lpadZeros = (num, size) => lpad(num+"", size, '0');


function splitQuoted(s) {
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


const replaceEol = (s='', replacement='') => {
  const re = /(?:\r\n|\r|\n)/g;
  return s.replace(re, replacement);
};


const replaceEolWithBr = (s='') => {
  return replaceEol(s, '<br/>');
};


const defaultTemplate = (tmpl, context, options) => {
  try {
    const compiled = _.template(tmpl, options);
    return compiled(context);

  } catch(e) {
    const msg = 'Error processing template';
    console.error(msg, 'tmpl:', tmpl, 'context:', context);
    throw new Error(e);
  }
};


const customTemplate = (tmpl, context, re) => {
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


const literalTemplate = (tmpl, context) => {
  const re = /\${([\s\S]+?)}/g;
  return customTemplate(tmpl, context, re);
};


const routeTemplate = (route, values) => {
  const re = /:([^\/]+)/g;
  return customTemplate(route, values, re);
};


const addfix = (s, { prefix='', delimiter='.', suffix=''}) => {
  return (
    (prefix ? prefix+delimiter : '') +
    s +
    (suffix ? delimiter+suffix : '')
  );
};


const joinNonEmpty = (arrayOfStrings, delimiter='.') => {
  return arrayOfStrings
    .filter(s => !!s)
    .join(delimiter);
};


function generateUUID(){
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};



const SHORTEN_MAX_STR_LEN = 1024;
const SHORTEN_MAX_GREATER = 5;

/**
 * Limit string length by replacing middle part of it with ellipsys
 *
 *
 * @param {string}  s        - original string
 * @param {number}  [max=1024] - Maximum result string length (>5)
 * @result {string}
 */
function shorten(s, max=SHORTEN_MAX_STR_LEN) {
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

  shorten,
};
