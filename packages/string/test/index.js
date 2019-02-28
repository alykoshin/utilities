/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));


describe('@utilities/string', function () {

  before('before', function () {

  });

  beforeEach('beforeEach', function () {

  });

  afterEach('afterEach', function () {

  });

  after('after', function () {

  });


  describe('splitQuoted', function () {
    let splitQuoted;

    before('before', function () {
      splitQuoted = require('../lib/').splitQuoted;
    });

    it('is a function', function () {
      assert(typeof splitQuoted === 'function', 'Expect function');
    });

    it('returns array with empty string for empty string', function () {
      const data = '';
      const expected = [''];
      const result = splitQuoted(data);
      expect( result ).to.be.array();
      expect( result ).to.be.ofSize(1);
      expect(result).to.be.equalTo(expected);
    });

    it('splits unquoted strings as `split(/\\s+/)`', function () {
      const data = ' abc def    ghi ';
      const expected = data.split(/\s+/);
      const result = splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });

    it('not splits spaces inside quoted strings`', function () {
      const data = 'abc "def ghi" jkl';
      const expected = ['abc', 'def ghi', 'jkl'];
      const result = splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });

    it('handles several spaces as one', function () {
      const data = 'abc "def"  \"ghi\"   jkl';
      const expected = ['abc', 'def', 'ghi', 'jkl'];
      const result = splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });

    it('handles escaped quote \\" as regular character', function () {
      const data = 'abc \\"def\\" "ghi \\" jkl" mno pqr';
      const expected = ['abc', '"def"', 'ghi " jkl', 'mno', 'pqr'];
      const result = splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });


  });


  describe('templateLiterals', function () {
    let templateLiterals;

    before('before', function () {
      templateLiterals = require('../lib/').templateLiterals;
    });

    it('must be a function', function () {
      expect(templateLiterals).to.be.a('function');
    });

    it('simple check', function () {
      const data = 'abc ${def} ghi';
      const context = { def: 'fed' };
      const expected = 'abc fed ghi';
      const result = templateLiterals(data, context);
      expect(result).to.be.equal(expected);
    });

    it('another simple check', function () {
      const s = '${first} ${second} ${third}';
      const context = { first: '1st', second: '2nd', third: '3rd' };
      const expected = '1st 2nd 3rd';
      expect(templateLiterals(s,context)).to.equals(expected)
    });

  });


});
