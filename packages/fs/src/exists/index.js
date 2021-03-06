/**
 * Created by alykoshin on 01.02.16.
 */

'use strict';

var fs = require('fs');
var utils = require('../utils');


var _existsStatAsync = function(path, condition, cb) {
  cb = utils.sanitizeCb(cb);
  try {
    fs.lstat(path, function (err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          return cb(null, false); // Directory does not exists
        //} else if (err.code === 'EACCESS') {
        //  return cb(null, false); // Not enough permissions - is it correct to return false?
        //} else if (err.code === 'EPERM') {
        //  return cb(null, false); // Not enough permissions - is it correct to return false?
        } else {
          return cb(err);         // Some error
        }
      }
      return cb(null, condition(stats), stats);
    });
  } catch (e) {
    return cb(e);
  }
};


var existsAsync = function(path, cb) {
  return _existsStatAsync(path, (stats) => stats.isFile() || stats.isDirectory(), cb);
};
//var existsAsync = function(path, cb) {
//  cb = utils.sanitizeCb(cb);
//  return _existsStatAsync(path, function(err, stats) {
//    if (err || typeof stats === 'boolean') { return cb(err, stats); }
//    return cb(err, stats.isFile() || stats.isDirectory());
//  });
//};


var fileExistsAsync = function(path, cb) {
  return _existsStatAsync(path, (stats) => stats.isFile(), cb);
  //cb = utils.sanitizeCb(cb);
  //return _existsStatAsync(path, function(err, stats) {
  //  if (err || typeof stats === 'boolean') { return cb(err, stats); }
  //  return cb(err, stats.isFile());
  //});
};


var dirExistsAsync = function(path, cb) {
  return _existsStatAsync(path, (stats) => stats.isDirectory(), cb);
  //cb = utils.sanitizeCb(cb);
  //return _existsStatAsync(path, function(err, stats) {
  //  if (err || typeof stats === 'boolean') { return cb(err, stats); }
  //  return cb(err, stats.isDirectory());
  //});
};


var _existsStatSync = function(path, condition) {
  try {
    var stats = fs.lstatSync(path);
    return condition(stats);
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return false; // Directory does not exists
    //} else if (err.code === 'EACCESS') {
    //  return false; // Not enough permissions - is it correct to return false?
    //} else if (err.code === 'EPERM') {
    //  return false; // Not enough permissions - is it correct to return false?
    } else {
      throw err;    // Some error
    }
  }
};

var existsSync = function(path) {
  //var stats = _existsStatSync(path);
  //if (typeof stats === 'boolean') { return stats; }
  //return stats.isFile() || stats.isDirectory();
  return _existsStatSync(path, (stats) => stats.isFile() || stats.isDirectory());
};

var fileExistsSync = function(path) {
  return _existsStatSync(path, (stats) => stats.isFile());
};

var dirExistsSync = function(path) {
  return _existsStatSync(path, (stats) => stats.isDirectory());
};

//
//var dirExistsSync = function(dir) {
//  try {
//    var stats = fs.lstatSync(dir);
//    return (stats.isDirectory());  // true only if it is directory
//  }
//  catch (err) {
//    if (err.code === 'ENOENT') {
//      return false; // Directory does not exists
//    } else if (err.code === 'EPERM') {
//      return false; // Not enough permissions - is it correct to return false?
//    } else {
//      throw err;    // Some error
//    }
//  }
//};



module.exports = {
  exists:      existsAsync,
  existsAsync: existsAsync,
  existsSync:  existsSync,

  fileExists:      fileExistsAsync,
  fileExistsAsync: fileExistsAsync,
  fileExistsSync:  fileExistsSync,

  dirExists:      dirExistsAsync,
  dirExistsAsync: dirExistsAsync,
  dirExistsSync:  dirExistsSync,
};
