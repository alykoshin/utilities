/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things

var path = require('path');
var miniFs = require('../../');
var miniFile = require('../../../fs/lib/textFile');

var invalidPath = 1;
var existingFile = module.filename;
var nonExistingFile = existingFile+'xyz';
var existingDir = path.dirname(module.filename);
var nonExistingDir = existingDir+'xyz';
var nonAccessibleDir = '/root/anything';

describe('# mini-fs', function () {

  describe('# fileExistsSync', function () {
    it('# existing file', function () {
      expect(miniFs.fileExistsSync(existingFile)).equal(true);
    });
    it('# existing dir', function () {
      expect(miniFs.fileExistsSync(existingDir)).equal(false);
    });
    it('# not existing', function () {
      expect(miniFs.fileExistsSync(nonExistingFile)).equal(false);
    });
    it('# invalid path', function () {
      expect(function () {
        miniFs.fileExistsSync(invalidPath);
      }).throw();
    });

    if (process.platform !== 'win32') {
      it('# inaccessible (unix/darwin only)', function () {
        expect(function () {
          miniFs.fileExistsSync(nonAccessibleDir);
        }).throw();
      });
    }

  });

  describe('# fileExistsAsync', function () {
    it('# empty callback', function () {
      expect(function() {
        miniFs.fileExistsAsync(existingFile, undefined);
      }).not.throw();
    });
    it('# existing file', function (done) {
      miniFs.fileExistsAsync(existingFile, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(true);
        done();
      });
    });
    it('# existing dir', function (done) {
      miniFs.fileExistsAsync(existingDir, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });
    it('# not existing file', function (done) {
      miniFs.fileExistsAsync(nonExistingFile, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });
    it('# not existing dir', function (done) {
      miniFs.fileExistsAsync(nonExistingDir, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });
    it('# invalid path', function (done) {
      miniFs.fileExistsAsync(invalidPath, function(err, res) {
        expect(err).not.equal(null);
        done();
      });
    });
    if (process.platform !== 'win32') {
      it('# inaccessible (unix/darwin only)', function (done) {
        miniFs.fileExistsAsync(nonAccessibleDir, function(err, res) {
          expect(err).not.equal(null);
          done();
        });
      });
    }
    it('# fileExists equal fileExistsAsync', function () {
      expect(miniFs.fileExists).equal(miniFs.fileExistsAsync);
    });
  });

  //leno4ka.buka@gmail.com
  describe('loadTextSync', function () {
    let loadTextSync;

    before(()=>{
      loadTextSync = miniFile.loadTextSync;
    });

    it('is a function', function () {
      assert(typeof loadTextSync === 'function');
    });

    it('if unvalible pathname ', function () {
      const pathname = 'test-data';
      expect(function () {
        loadTextSync(pathname, {});
      }).throw();
    });

    it('if pathname !== string', function () {
      const pathname = loadTextSync;
      expect(function () {
        loadTextSync(pathname, false);
      }).throw();
    });

    it('should read text from file', function () {
      const pathname = 'test-data/saveJsonSync/test';
      const result = loadTextSync(pathname);
      expect(result).to.eql('this is my text for writing the file /test');
    });

  });


  describe('saveTextSync', function () {
    let saveTextSync;

    before(()=> {
      saveTextSync = miniFile.saveTextSync;
    });

    it('is a function', function () {
      assert(typeof saveTextSync === 'function');
    });

    it('if s !== string', function () {
      const pathname = 'abcd';
      const s = [];
      expect(function () {
        saveTextSync(pathname, s);
      }).throw();
    });

    it('if pathname !== string', function () {
      const pathname = saveTextSync;
      const s = '';
      expect(function () {
        saveTextSync(pathname, s);
      }).throw();
    });

    it('should write in the file', function () {
      const pathname = 'test-data/saveJsonSync/test';
      const s = 'this is my text for writing the file /test';
      const result = saveTextSync(pathname, s);
      expect(result).to.eql(42);
    });

  });


});
