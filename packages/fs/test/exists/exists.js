/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things



var path = require('path');
var miniFs = require('../../');
const mkdirp = require('mkdirp');
const baseCopyDir = path.join(process.cwd(), 'test-data');


var invalidPath = 1;
var existingFile = module.filename;
var nonExistingFile = existingFile+'xyz';
var existingDir = path.dirname(module.filename);
var nonExistingDir = existingDir+'xyz';
var nonAccessibleDir = '/root/anything';

describe('' +
  '-fs', function () {

  describe('existsSync', function () {
    it('existing file', function () {
      expect(miniFs.existsSync(existingFile)).equal(true);
    });
    it('existing dir', function () {
      expect(miniFs.existsSync(existingDir)).equal(true);
    });
    it('not existing file', function () {
      expect(miniFs.existsSync(nonExistingFile)).equal(false);
    });
    it('not existing dir', function () {
      expect(miniFs.existsSync(nonExistingDir)).equal(false);
    });
    it('invalid path', function () {
      expect(function () {
        miniFs.fileExistsSync(invalidPath);
      }).throw();
    });

    if (process.platform !== 'win32') {
      it('inaccessible (unix/darwin only)', function () {
        expect(function () {
          miniFs.existsSync(nonAccessibleDir);
        }).throw();
      });
    }

  });

  describe('existsAsync', function () {
    it('# empty callback', function () {
      expect(function() {
        miniFs.existsAsync(existingFile, undefined);
      }).not.throw();
    });
    it('existing file', function (done) {
      miniFs.existsAsync(existingFile, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(true);
        done();
      });
    });
    it('existing dir', function (done) {
      miniFs.existsAsync(existingDir, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(true);
        done();
      });
    });
    it('not existing', function (done) {
      miniFs.existsAsync(nonExistingFile, function(err, res) {
        expect(err).equal(null);
        expect(res).equal(false);
        done();
      });
    });
    it('# invalid path', function (done) {
      miniFs.existsAsync(invalidPath, function(err, res) {
        expect(err).not.equal(null);
        done();
      });
    });
    if (process.platform !== 'win32') {
      it('# inaccessible (unix/darwin only)', function (done) {
        miniFs.existsAsync(nonAccessibleDir, function(err, res) {
          expect(err).not.equal(null);
          done();
        });
      });
    }
    it('# exists equal existsAsync', function () {
      expect(miniFs.exists).equal(miniFs.existsAsync);
    });
  });

  describe('copyFile ', function () {
    let copyFile;
    let copyFileDir = path.join(baseCopyDir,'saveJsonSync');
    let copyFilePath = path.join(copyFileDir, 'fromFileCopy');
    let copyErrorPath = path.join(copyFileDir, 'errorCopy');
    let copyPastDir = path.join(baseCopyDir,'fileCopy');
    let expectedCopyPastPath = path.join(copyPastDir, 'toFileCopy');

    before(() => {
      copyFile = miniFs.copyFile;
      mkdirp(copyFileDir);
      mkdirp(copyPastDir);
    });

    it('is a function', function () {
      assert(typeof copyFile === 'function');
    });

    it('should be async copy element from -> to', function (done) {
      copyFile(copyFilePath, expectedCopyPastPath, function (err) {
        if(err ){
          throw new Error(`My error`);
        }
        done();
      });
    });

    it('return error rd.on', function (done) {
      copyFile(copyErrorPath,expectedCopyPastPath, function (err) {
        // console.log(err);
        expect(err).to.be.an('error');
        expect(err.code).to.equal('ENOENT');
        done();
      });
    });

    it('return error wr.on', function (done) {
      copyFile(copyFilePath, '/', function (err) {
        //console.log(err);
        expect(err).to.be.an('error');
        expect(err.code).to.equal('EISDIR');
        done();
      });
    });

  });

  describe('copyFileSync', function () {
    let copyFileSync;
    let copyFileDir = path.join(baseCopyDir,'saveJsonSync');
    let copyFilePath = path.join(copyFileDir, 'fromFileCopy');
    let copyPastDir = path.join(baseCopyDir,'fileCopy');
    let expectedCopyPastPath = path.join(copyPastDir, 'toFileCopy');

    before(() => {
      copyFileSync = miniFs.copyFileSync;
      mkdirp(copyFileDir);
      mkdirp(copyPastDir);
    });

    it('is a function', function () {
      assert(typeof copyFileSync === 'function');
    });

    it('should be run function copyFile, end return copy file from -> to', function (done) {
      const result = copyFileSync(copyFilePath, expectedCopyPastPath);
      expect(result).to.eql( done());
    });

  });
});



