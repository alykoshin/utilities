'use strict';

const _ = require('lodash');
const urlQuery = require('./urlQuery');


const repeat = (char, len) => {
  return lpad('', len, char);
};


const lpad = (s, size, char) => {
  char = char || ' ';
  if (char.length > 1) console.warn('lpad expects one padding character');
  while (s.length < size) s = char + s;
  return s;
};


const rpad = (s, size, char) => {
  char = char || ' ';
  if (char.length > 1) console.warn('rpad expects one padding character');
  while (s.length < size) s = s + char;
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
};
