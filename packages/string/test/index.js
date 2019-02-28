/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));


describe('@utilities/string', function () {
  let string;

  before('before', function () {
    string = require('../lib/');
  });


  describe('lpad', function () {

    it('is a function', function () {
      assert(typeof string.lpad === 'function', 'Expect function');
    });

    it('simple check', function () {
      const s = '12345'; // 5 chars
      const c = '0';
      const expected = '0000012345';
      const result = string.lpad(s, 10, c);
      expect(result).to.be.equals(expected);
    });

  });


  describe('rpad', function () {

    it('is a function', function () {
      assert(typeof string.rpad === 'function', 'Expect function');
    });

    it('simple check', function () {
      const s = '12345'; // 5 chars
      const c = '0';
      const expected = '1234500000';
      const result = string.rpad(s, 10, c);
      expect(result).to.be.equals(expected);
    });

  });


  describe('lpadZeros', function () {

    it('is a function', function () {
      assert(typeof string.lpadZeros === 'function', 'Expect function');
    });

    it('simple check', function () {
      const s = '12345'; // 5 chars
      const c = '0';
      const n = 10;
      const expected = string.lpad(s, n, c);
      const result = string.lpadZeros(s, 10);
      expect(result).to.be.equals(expected);
    });

  });


  describe('splitQuoted', function () {

    it('is a function', function () {
      assert(typeof string.splitQuoted === 'function', 'Expect function');
    });

    it('returns array with empty string for empty string', function () {
      const data = '';
      const expected = [''];
      const result = string.splitQuoted(data);
      expect( result ).to.be.array();
      expect( result ).to.be.ofSize(1);
      expect(result).to.be.equalTo(expected);
    });

    it('splits unquoted strings as `split(/\\s+/)`', function () {
      const data = ' abc def    ghi ';
      const expected = data.split(/\s+/);
      const result = string.splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });

    it('not splits spaces inside quoted strings`', function () {
      const data = 'abc "def ghi" jkl';
      const expected = ['abc', 'def ghi', 'jkl'];
      const result = string.splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });

    it('handles several spaces as one', function () {
      const data = 'abc "def"  \"ghi\"   jkl';
      const expected = ['abc', 'def', 'ghi', 'jkl'];
      const result = string.splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });

    it('handles escaped quote \\" as regular character', function () {
      const data = 'abc \\"def\\" "ghi \\" jkl" mno pqr';
      const expected = ['abc', '"def"', 'ghi " jkl', 'mno', 'pqr'];
      const result = string.splitQuoted(data);
      expect(result).to.be.equalTo(expected);
    });


  });


  describe('templateLiterals', function () {

    it('must be a function', function () {
      expect(string.templateLiterals).to.be.a('function');
    });

    it('simple check', function () {
      const data = 'abc ${def} ghi';
      const context = { def: 'fed' };
      const expected = 'abc fed ghi';
      const result = string.templateLiterals(data, context);
      expect(result).to.be.equal(expected);
    });

    it('another simple check', function () {
      const s = '${first} ${second} ${third}';
      const context = { first: '1st', second: '2nd', third: '3rd' };
      const expected = '1st 2nd 3rd';
      expect(string.templateLiterals(s,context)).to.equals(expected)
    });

  });


});
