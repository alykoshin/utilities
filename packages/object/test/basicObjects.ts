/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));

const _ = require('lodash');
const mm = require('micromongo');

import {/*GenericOptions,*/OptionsStore, EmptyOptions} from '../src/';

type AB = /*extends GenericOptions*/ {
  a: number,
  b?: number,
  c?: any,
  e?: any,
  g?: any,
}

describe('Options', function () {

  const a
    : AB
    = { a: 1,  b: 2, c: { d: 3  }, e: 4,         g: { h: 5  }, };
  const b
    : AB
    = {
    a: 11,
    c: 33,        e: { f: 44 }, g: { h: 55 }, };
  const ab
    : AB
    = { a: 11, b: 2, c: 33,        e: { f: 44 }, g: { h: 55 }, };

  this.timeout(10*1000);

  before('before', function () {
  });

  after('after', async function () {
  });

  describe('OptionsStore', function () {

    it('is a function', function () {
      expect(OptionsStore).to.be.a('function');
    });

    describe('constructor', function() {

      it('constructor', function () {
        const options = new OptionsStore(a);
        expect(options.options).to.be.eql(a);
      });

      it('constructor with generic type setting', function () {
        const options = new OptionsStore<AB>(a);
        expect(options.options).to.be.eql(a);
      });

    });

    describe('_extendOptions', function() {

      class TestOptionsStore<Options extends EmptyOptions> extends OptionsStore<Options> {
        public extendOptions (...args) {
          return this._extendOptions(...args);
        }
      }

      it('extend', function () {
        const options = new TestOptionsStore(a);
        options.extendOptions(b);
        expect(options.options).to.be.eql(ab);
      });

    });

  });

});
