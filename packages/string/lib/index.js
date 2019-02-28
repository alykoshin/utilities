'use strict';

const _ = require('lodash');


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


const templateLiterals = (s, context) => {
  //_.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  _.templateSettings.evaluate = /\${([\s\S]+?)}/g;
  const compiled = _.template(s);
  return compiled(context);
};


module.exports = {
  lpad,
  rpad,
  lpadZeros,
  splitQuoted,
  templateLiterals,
};