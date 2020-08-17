/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));

const _ = require('lodash');
const path = require('path');
const mkdirp = require('mkdirp');

const baseTestDir = path.join(process.cwd(), 'test-data');

const {replaceEol} = require('@utilities/string');


describe('@utilities/object', () => {
  let object;

  before('before', () => {
    object = require('../src/');
  });

  describe('misc', () => {

    describe('repeat', () => {

      it('is a function', () => {
        assert(typeof object.repeat === 'function', 'Expect function');
      });

      it('repeat', () => {
        let a = [];
        object.repeat(2, (i) => { a.push(i); })
        expect( a ).to.deep.equal([ 0, 1 ]);
      });

    });

  });

});
