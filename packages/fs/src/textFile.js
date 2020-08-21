const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');

const {fileExistsSync} = require('./exists/index');
const {newNoSuchFileError} = require('./errors');

const debug = require('debug')('@utilities/fs');


const loadTextSync = (pathname, options={}) => {
  if (typeof pathname !== 'string') throw new Error('loadTextSync: first argument must be string pathname');

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
  debug(`loadTextSync(): Loading from "${pathname}"`);
  const s = fs.readFileSync(pathname, { encoding: 'utf8' });
  debug(`loadTextSync(): Loaded ${s.length} characters`);
  return s;
};


const saveTextSync = (pathname, s, options={}) => {
  if (typeof pathname !== 'string') throw new Error('saveTextSync: first argument must be string pathname');
  if (typeof s !== 'string') throw new Error('saveTextSync: second argument must be the string to save');

  debug(`saveTextSync: Saving ${s.length} characters to "${pathname}"`);
  //console.log(' mkdirp.sync(path.dirname(pathname)):',  mkdirp.sync(path.dirname(pathname)));
  mkdirp.sync(path.dirname(pathname));
  fs.writeFileSync(pathname, s, { encoding: 'utf8' });
  debug(`saveTextSync: Done"`);
  return s.length;
};


module.exports = {
  loadTextSync,
  saveTextSync,
};
