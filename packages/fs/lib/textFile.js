const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');

const {fileExistsSync} = require('./exists/index');
const {newNoSuchFileError} = require('./errors');

const debug = require('debug')('@utilities/fs');


const loadTextSync = (pathname, options={}) => {
  const {mustExist=true} = options;
  if (!fileExistsSync(pathname)) {
    if (mustExist===false) {
      debug(`File "${pathname}" does not exist, ignoring.`);
      return '';
    } else {
      const extMsg = `You can disable this error by setting options.mustExist to false when calling loadTextSync()`;
      const e = newNoSuchFileError({path: pathname}, extMsg);
      throw e;
    }
  }
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
