'use strict';

const _ = require('lodash');
const urlQuery = require('./urlQuery');


const lpad = (s, size, c) => {
  c = c || ' ';
  if (c.length > 1) console.warn('lpad expects one padding character');
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



const defaultTemplate = (tmpl, context) => {
  try {
    const compiled = _.template(tmpl);
    return compiled(context);

  } catch(e) {
    const msg = 'Error processing template';
    console.error(msg, 'tmpl:', tmpl, 'context:', context);
    throw new Error(e);
  }
};


const customTemplate = (tmpl, context, evaluate) => {
  const saved = _.templateSettings.evaluate;
  _.templateSettings.evaluate = evaluate;

  let result;
  try {
    result = defaultTemplate(tmpl, context);

  } finally {
    _.templateSettings.evaluate = saved;

  }
  return result;
};


const literalTemplate = (tmpl, context) => {
  //const saved = _.templateSettings.evaluate;
  //
  ////_.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  //_.templateSettings.evaluate = /\${([\s\S]+?)}/g;
  //const compiled = _.template(tmpl);
  //const result   = compiled(context);
  //
  //_.templateSettings.evaluate = saved;
  //return result;
  return customTemplate(tmpl, context, /\${([\s\S]+?)}/g);
};


const routeTemplate = (route, values) => {
  //const defaultInterpolate = _.templateSettings.interpolate;
  //
  //_.templateSettings.interpolate = /:([^\/]+)/g;
  //const compiled = _.template(route);
  //const result = compiled(values);
  //
  //_.templateSettings.interpolate = defaultInterpolate;
  //return result;
  return customTemplate(route, values, /:([^\/]+)/g);
};


module.exports = {
  lpad,
  rpad,
  lpadZeros,
  
  splitQuoted,

  defaultTemplate,
  customTemplate,
  literalTemplate,
  routeTemplate,

  urlQuery: urlQuery,
};
