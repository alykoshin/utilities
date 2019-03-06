/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));


describe('@utilities/string/queryString', function () {
  let urlQuery;

  before('before', function () {
    urlQuery = require('../lib/urlQuery');
  });


  describe('parse', function () {

    it('is a function', function () {
      assert(typeof urlQuery.parse === 'function', 'Expect function');
    });

    it('simple check (only allowed symbols), with starting "?"', function () {
      const query    = '?aaa=bbb&ccc=ddd';
      const expected = { aaa: 'bbb', ccc: 'ddd' };
      const result = urlQuery.parse(query);
      expect(result).to.eql(expected);
    });

    it('simple check (only allowed symbols), without starting "?"', function () {
      const query    = 'aaa=bbb&ccc=ddd';
      const expected = { aaa: 'bbb', ccc: 'ddd' };
      const result = urlQuery.parse(query);
      expect(result).to.eql(expected);
    });

  });


  describe('stringify', function () {

    it('is a function', function () {
      assert(typeof urlQuery.stringify === 'function', 'Expect function');
    });

    it('simple check (no prefix, only allowed symbols)', function () {
      const obj      = { aaa: 'bbb', ccc: 'ddd' };
      const expected = 'aaa=bbb&ccc=ddd';
      const result = urlQuery.stringify(obj);
      expect(result).to.eql(expected);
    });

  });


});
