const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');

const debug = require('debug')('@utilities/fs');


const loadTextSync = (pathname, options={}) => {
  const s = fs.readFileSync(pathname, { encoding: 'utf8' });
  debug(`Loaded ${s.length} characters from "${pathname}"`);
  return s;
};


const saveTextSync = (pathname, s, options={}) => {
  mkdirp.sync(path.dirname(pathname));
  fs.writeFileSync(pathname, s, { encoding: 'utf8' });
  debug(`Saved ${s.length} characters to "${pathname}"`);
  return s.length;
};


module.exports = {
  loadTextSync,
  saveTextSync,
};
