/* globals describe, before, beforeEach, after, afterEach, it */

//'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));
chai.use(require('chai-arrays'));

const string = require('../src/');

describe('@utilities/string', function () {

  before('before', function () {
  });

  describe('lpad', function () {
    it('is a function', function () {
      assert(typeof string.lpad === 'function', 'Expect function');
    });

    it('simple check', function () {
      const s = '12345'; // 5 chars
      const c = '0';
      const expected = '0000012345';
      const result = string.lpad(s, 10,  c);
      expect(result).to.be.equals(expected);
    });

    it('second check where s = \' \'', function () {
      const s = ' '; // 5 chars
      const c = ' ';
      const expected = '          ';
      const result = string.lpad(s, 10, c);
      expect(result).to.be.equals(expected);
    });

    it('return repeat', function () {
      const c = ' ';
      const expected = '          ';
      const result = string.repeat( c, 10);
      expect(result).to.be.equals(expected);
    });

    it('if c is underfind', function () {
      const s = '12345'; // 5 chars
      const c = undefined;
      const expected = '12345';
      const result = string.lpad(s, 5,  c);
      expect(result).to.be.equals(expected);
    });

    it('if expects more then one padding character', function () {
      const s = '12345'; // 5 chars
      const c = '99';
      const expected = '9912345';
      const result = string.lpad(s, 6,  c);
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

    it('if c is underfind', function () {
      const s = '12345'; // 5 chars
      const c = undefined;
      const expected = '12345     ';
      const result = string.rpad(s, 10, c);
      expect(result).to.be.equals(expected);
    });

    it('rpad expects more then one padding character', function () {
      const s = '12345'; // 5 chars
      const c = '99';
      const expected = '12345999999';
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

    it('error \'Expected string\'', function () {
      const s = 45;
      expect(function () {
        string.splitQuoted(s);
      }).throw();
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


  describe('replaceEol', function () {
    it('must be a function', function () {
      expect(string.replaceEol).to.be.a('function');
    });

    it('@replaceEol', function () {
      const replacement = '1';
      const s = '\n\r';
      const expected = '11';
      const result = string.replaceEol(s, replacement);
      expect(result).to.be.equal(expected);
    });

    it('if s and  replacement are equal undefined', function () {
      const replacement = undefined;
      const s = undefined;
      const expected = '';
      const result = string.replaceEol(s, replacement);
      expect(result).to.be.equal(expected);
    });
  });


  describe('replaceEolWithBr', function () {
    it('must be a function', function () {
      expect(string.replaceEolWithBr).to.be.a('function');
    });

    it('replace in replaceEolWithBr', function () {
      const s = '\n\r';
      const expected = '<br/><br/>';
      const result = string.replaceEolWithBr(s);
      expect(result).to.be.equal(expected);
    });

    it('replace in replaceEolWithBr when s is undefined', function () {
      const s = undefined;
      const expected = '';
      const result = string.replaceEolWithBr(s);
      expect(result).to.be.equal(expected);
    });

  });


  describe('literalTemplate', function () {

    it('must be a function', function () {
      expect(string.literalTemplate).to.be.a('function');
    });

    it('simple check', function () {
      const template = 'abc ${def} ghi';
      const context = { def: 'fed' };
      const expected = 'abc fed ghi';
      const result = string.literalTemplate(template, context);
      expect(result).to.be.equal(expected);
    });

    it('another simple check', function () {
      const template = '${first} ${ second } ${third}';
      const context = { first: '1st', second: '2nd', third: '3rd' };
      const expected = '1st 2nd 3rd';
      expect(string.literalTemplate(template,context)).to.equals(expected)
    });

  });


  describe('routeTemplate', function () {

    it('must be a function', function () {
      expect(string.routeTemplate).to.be.a('function');
    });

    it('simple check', function () {
      const template = '/profiles/:_id/profile/';
      const context = { _id: 'value' };
      const expected = '/profiles/value/profile/';
      const result = string.routeTemplate(template, context);
      expect(result).to.be.equal(expected);
    });
  });


  describe('addfix', function () {
    it('must be function', function(){
      expect(string.addfix).to.be.a('function');
    });

    it('@addfix', function () {
      const s = 'text';
      const prefix = 'www';
      const suffix = 'com';
      const result = 'www.text.com';
      expect(string.addfix(s, {prefix, suffix})).to.be.equal(result);
    });

    it('if prefix is undefined', function () {
      const s = 'text';
      const prefix = undefined;
      const suffix = 'com';
      const result = 'text.com';
      expect(string.addfix(s, {prefix, suffix})).to.be.equal(result);
    });

    it('if suffix is undefined', function () {
      const s = 'text';
      const prefix = 'www';
      const suffix = undefined;
      const result = 'www.text';
      expect(string.addfix(s, {prefix, suffix})).to.be.equal(result);
    });
  });


  describe('joinNonEmpty', function () {
    it('must be function', function () {
      expect(string.joinNonEmpty).to.be.a('function');
    });

    it('@joinNonEmpty', function () {
      const arrayOfStrings = ['RABBIT', 'BIRD'];
      const result = 'RABBIT.BIRD';
      expect(string.joinNonEmpty(arrayOfStrings)).to.be.equal(result);
    });

  });


  describe('defaultTemplate', function () {
    it('is a function', function () {
      expect(string.defaultTemplate).to.be.a('function');
    });

    it('@defaultTemplate', function () {
      const template = 'abc ${def} ghi';
      const context = { undf: 'smt' };
      const options = { undf: 'smt'};

      expect(()=> {
        string.defaultTemplate(template, context, options);
      }).throw();
    });

  });


  describe('id_unique_13', function () {
    it('is a function', function () {
      expect(string.id_unique_13).to.be.a('function');
    });

    const tries = 10;
    describe(`repeat ${tries} tries`, function () {

      it(`@returns string [A-Z0-9] with length=13`, function () {
        for (let i=0; i<10; i++) {
          const result = string.id_unique_13();
          expect(result).to.be.a('string');
          expect(result).to.have.lengthOf(13);
          console.log(result);
          expect(result).to.match(/[A-Z0-9]{13}/);
        }
      });

      it('@returns different results', function () {
        for (let i=0; i<10; i++) {
          const result1 = string.id_unique_13();
          const result2 = string.id_unique_13();
          console.log(`${result1} / ${result2}`);
          expect(result1).to.be.not.equal(result2);
        }
      });

    });

  });


  describe('shorten', function () {
    it('is a function', function () {
      expect(string.shorten).to.be.a('function');
    });

    it('@throws if max <= 5', function () {
      expect(()=> {
        string.shorten('some-string', 5);
      }).throw();
    });

    it('@shorten 10->10', function () {
      const s0 = '0123456789';
      const s = s0.repeat(1); // 10 chars
      const max = 10;
      const result = string.shorten(s, max);
      expect(result).to.equal(s0);
      expect(result.length).to.equal(max);
    });

    it('@shorten 100->6', function () {
      const s0 = '0123456789';
      const s = s0.repeat(10); // 100 chars
      const max = 6;
      const result = string.shorten(s, max);
      expect(result).to.equal('01..89');
      expect(result.length).to.equal(max);
    });

    it('@shorten 100->10', function () {
      const s0 = '0123456789';
      const s = s0.repeat(10); // 100 chars
      const max = 10;
      const result = string.shorten(s, max);
      expect(result).to.equal('012....789');
      expect(result.length).to.equal(max);
    });

    it('@shorten 100->15', function () {
      const s0 = '0123456789';
      const s = s0.repeat(10); // 100 chars
      const max = 15;
      const result = string.shorten(s, max);
      expect(result).to.equal('0123.......6789');
      expect(result.length).to.equal(max);
    });

    it('@shorten 100->20', function () {
      const s0 = '0123456789';
      const s = s0.repeat(10); // 100 chars
      const max = 20;
      const result = string.shorten(s, max);
      expect(result).to.equal('01234'+'.'.repeat(10)+'56789');
      expect(result.length).to.equal(max);
    });

    it('@shorten 100->100', function () {
      const s0 = '0123456789';
      const s = s0.repeat(10); // 100 chars
      const max = 100;
      const result = string.shorten(s, max);
      expect(result).to.equal(s);
      expect(result.length).to.equal(max);
    });

  });


});
