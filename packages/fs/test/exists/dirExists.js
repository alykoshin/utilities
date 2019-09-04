/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things

var path = require('path');
var miniFs = require('../../');
var dirL = require('../../../fs/lib/dirList');

var invalidPath = 1;
var existingFile = module.filename;
var nonExistingFile = existingFile+'xyz';
var existingDir = path.dirname(module.filename);
var nonExistingDir = existingDir+'xyz';
var nonAccessibleDir = '/root/anything';
//var nonAccessibleDir = '/root/t';

describe('# mini-fs', function () {


  describe('# dirExistsSync', function () {
    it('# existing file', function () {
      expect(miniFs.dirExistsSync(existingFile)).equal(false);
    });
    it('# existing dir', function () {
      expect(miniFs.dirExistsSync(existingDir)).equal(true);
    });
    it('# not existing', function () {
      expect(miniFs.dirExistsSync(nonExistingFile)).equal(false);
    });
    it('# invalid path', function () {
      expect(function () {
        miniFs.fileExistsSync(invalidPath);
      }).throw();
    });

    if (process.platform !== 'win32') {
      it('# inaccessible (unix/darwin only)', function () {
        expect(function () {
          miniFs.dirExistsSync(nonAccessibleDir);
        }).throw();
      });
    }

  });


  describe('# dirExistsAsync', function () {

    it('# empty callback', function () {
      expect(function() {
        miniFs.dirExistsAsync(existingFile, undefined);
      }).not.throw();
    });

    it('# existing file', function (done) {
      miniFs.dirExistsAsync(existingFile, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });

    it('# existing dir', function (done) {
      miniFs.dirExistsAsync(existingDir, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(true);
        done();
      });
    });

    it('# non-existing file', function (done) {
      miniFs.dirExistsAsync(nonExistingFile, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });
    it('# non-existing dir', function (done) {
      miniFs.dirExistsAsync(nonExistingDir, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });
    it('# invalid path', function (done) {
      miniFs.dirExistsAsync(invalidPath, function(err, res) {
        expect(err).not.equal(null);
        done();
      });
    });
    if (process.platform !== 'win32') {
      it('# inaccessible (unix/darwin only)', function (done) {
        miniFs.dirExistsAsync(nonAccessibleDir, function(err, res) {
          expect(err).not.equal(null);
          done();
        });
      });
    }
    it('# fileExists equal fileExistsAsync', function () {
      expect(miniFs.dirExists).equal(miniFs.dirExistsAsync);
    });
  });


  describe('dirListFilenames', function () {
    let dirListFilenames;

    before(()=>{
      dirListFilenames = dirL.dirListFilenames;
    });

    it('is a function', function () {
      assert(typeof dirListFilenames === 'function');
    });

    it('if recursive == true', function () {
      const dir = 'test-data';
      const options = {'recursive' : true};

      expect(()=> {
        dirListFilenames(dir, options);
      }).to.throw();
    });

    it('if options = {}', function () {
      const dir = 'test-data';
      const options = {};
      const result = dirListFilenames(dir, options);
      const expected = [];

      expect(result).to.be.eql(expected);
    });

    it('if options eql undefined', function () {
      const dir = 'test-data';
      const result = dirListFilenames(dir, undefined);
      const expected = [];

      expect(result).to.be.eql(expected);
    });

    it('if recursive == true && addPath == joinBase', function () {
      const dir = 'test-data';
      const options = {'recursive' : true, addPath: 'joinBase'};
      const result = dirListFilenames(dir, options);
      const expected = [
        'test-data/fileCopy/toFileCopy',
        'test-data/saveJsonSync/fromFileCopy',
        'test-data/saveJsonSync/test'
      ];

      expect(result).to.eql(expected);
    });

    it('if recursive == true && addPath == joinSub', function () {
      const dir = 'test-data';
      const options = {
        'recursive' : true,
        addPath: 'joinSub'
      };
      const result = dirListFilenames(dir, options);
      const expected = [
        'fileCopy/toFileCopy',
        'saveJsonSync/fromFileCopy',
        'saveJsonSync/test'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if recursive == true && addPath == resolve', function () {
      const dir = 'test-data';
      const options = {
        'recursive' : true,
        addPath: 'resolve'
      };
      const result = dirListFilenames(dir, options);
      const expected = [
        path.join(process.cwd(), 'test-data/fileCopy/toFileCopy'),
        path.join(process.cwd(), 'test-data/saveJsonSync/fromFileCopy'),
        path.join(process.cwd(), 'test-data/saveJsonSync/test'),
      ];

      expect(result).to.be.eql(expected);
    });

    it('if nameOnly == false && addPath == joinBase', function () {
      const dir = 'test-data';
      const options = {
        'recursive' : true,
        nameOnly: false,
        addPath: 'joinBase'
      };
      const result = dirListFilenames(dir, options);
      const expected = [
        {'name': 'toFileCopy',
          'pathname': 'test-data/fileCopy/toFileCopy',
        },
        {'name': 'fromFileCopy',
          'pathname':'test-data/saveJsonSync/fromFileCopy'
        },
        {'name': 'test',
          'pathname':'test-data/saveJsonSync/test'
        }
      ];

      expect(result).to.be.eql(expected);
    });

    it('if nameOnly == false && addPath == joinSub', function () {
      const dir = 'test-data';
      const options = {
        'recursive' : true,
        nameOnly: false,
        addPath: 'joinSub'
      };
      const result = dirListFilenames(dir, options);
      const expected = [
        {'name': 'toFileCopy',
          'pathname': 'fileCopy/toFileCopy'
        },
        {'name': 'fromFileCopy',
          'pathname': 'saveJsonSync/fromFileCopy'
        },
        {'name': 'test',
          'pathname': 'saveJsonSync/test'
        }
      ];

      expect(result).to.be.eql(expected);
    });

    it('if nameOnly == false && addPath == resolve', function () {
      const dir = 'test-data';
      const options = {
        'recursive' : true,
        nameOnly: false,
        addPath: 'resolve'
      };
      const result = dirListFilenames(dir, options);
      const expected = [
        {'name': 'toFileCopy',
          'pathname': path.join(process.cwd(), 'test-data/fileCopy/toFileCopy'),
        },
        {'name': 'fromFileCopy',
          'pathname': path.join(process.cwd(), 'test-data/saveJsonSync/fromFileCopy')
        },
        {'name': 'test',
          'pathname': path.join(process.cwd(), 'test-data/saveJsonSync/test')
        },
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'joinBase\'', function () {
      const dir = 'test-data/saveJsonSync';
      const options = { addPath : 'joinBase' };
      const result = dirListFilenames(dir, options);
      const expected = [
        'test-data/saveJsonSync/fromFileCopy',
        'test-data/saveJsonSync/test'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'joinSub\'', function () {
      const dir = 'test-data/saveJsonSync';
      const options = { addPath : 'joinSub' };
      const result = dirListFilenames(dir, options);
      const expected = [
        'fromFileCopy',
        'test'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'resolve\'', function () {
      const dir = 'test-data/saveJsonSync';
      const options = { addPath : 'resolve' };
      const result = dirListFilenames(dir, options);
      const expected = [
        path.join(process.cwd(), 'test-data/saveJsonSync/fromFileCopy'),
        path.join(process.cwd(), 'test-data/saveJsonSync/test'),
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'undefined\'', function () {
      const dir = 'test-data/saveJsonSync';
      const options = { addPath : 1 };
      expect(()=> {
        dirListFilenames(dir, options);
      }).throw();
    });

  });


  describe('dirListDirnames', function () {
    let dirListDirnames;

    before(()=> {
      dirListDirnames = dirL.dirListDirnames;
    });

    it('is a function', function () {
      assert(typeof dirListDirnames === 'function');
    });

    it('if options = {}', function () {
      const dir = 'test-data';
      const options = {};
      const result = dirListDirnames(dir, options);
      const expected = [
        'fileCopy',
        'saveJsonSync'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if options is eql undefined', function () {
      const dir = 'test-data';
      const result = dirListDirnames(dir, undefined);
      const expected = [
        'fileCopy',
        'saveJsonSync'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if nameOnly == false', function () {
      const dir = 'test-data';
      const options = {nameOnly : false};
      const result = dirListDirnames (dir, options);
      const expected = [
        {'pathname': 'fileCopy',
          'name': 'fileCopy'
        },
        {'pathname': 'saveJsonSync',
          'name': 'saveJsonSync'
        }
      ];

      expect(result).to.be.eql(expected);
    });

    it('if recursive ==  true', function () {
      const dir = 'test-data';
      const options = {recursive: true};

      expect(()=>{
        dirListDirnames(dir, options);
      }).throw();
    });

    it('if addPath == joinBase && recursive == true ', function () {
      const dir = 'test-data';
      const options = {
        addPath : 'joinBase',
        recursive : true,
      };
      const result = dirListDirnames(dir, options);
      const expected = [
        'test-data/fileCopy',
        'test-data/saveJsonSync'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addPath == joinSub && recursive == true ', function () {
      const dir = 'test-data';
      const options = {
        addPath: 'joinSub',
        recursive: true,
      };
      const result = dirListDirnames(dir, options);
      const expected = [
        'fileCopy',
        'saveJsonSync'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addPath == resolve && recursive == true ', function () {
      const dir = 'test-data';
      const options = {
        addPath: 'resolve',
        recursive: true
      };
      const result = dirListDirnames(dir, options);
      const expected = [
        path.join(process.cwd(),'test-data/fileCopy'),
        path.join(process.cwd(),'test-data/saveJsonSync'),
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'joinBase\'', function () {
      const dir = 'test-data';
      const options = { addPath : 'joinBase' };
      const result = dirListDirnames(dir, options);
      const expected = [
        'test-data/fileCopy',
        'test-data/saveJsonSync'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'joinSub\'', function () {
      const dir = 'test-data';
      const options = { addPath : 'joinSub' };
      const result = dirListDirnames(dir, options);
      const expected = [
        'fileCopy',
        'saveJsonSync'
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'resolve\'', function () {
      const dir = 'test-data';
      const options = { addPath : 'resolve' };
      const result = dirListDirnames(dir, options);
      const expected = [
        path.join(process.cwd(), 'test-data/fileCopy'),
        path.join(process.cwd(), 'test-data/saveJsonSync'),
      ];

      expect(result).to.be.eql(expected);
    });

    it('if addpath === \'undefined\'', function () {
      const dir = 'test-data';
      const options = { addPath : 1 };
      expect(()=> {
        dirListDirnames(dir, options);
      }).throw();
    });

  });


});
