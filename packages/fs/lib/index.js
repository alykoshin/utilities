/**
 * Created by alykoshin on 01.02.16.
 */

'use strict';


const exists   = require('./exists');
const copy     = require('./copy');
const textFile = require('./textFile');
const dirList  = require('./dirList');


module.exports = {
  exists:      exists.existsAsync,
  existsAsync: exists.existsAsync,
  existsSync:  exists.existsSync,

  fileExists:      exists.fileExistsAsync,
  fileExistsAsync: exists.fileExistsAsync,
  fileExistsSync:  exists.fileExistsSync,

  dirExists:      exists.dirExistsAsync,
  dirExistsAsync: exists.dirExistsAsync,
  dirExistsSync:  exists.dirExistsSync,

  copyFile:      copy.copyFile,
  copyFileSync:  copy.copyFileSync,
  copySync:      copy.copyFileSync, // for backward compatibility

  ...textFile,
  ...dirList,
};
