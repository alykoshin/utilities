/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));
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

    it('replace in replaceEol', function () {
      const replacement = '1';
      const s = '\n\r';
      const expected = '11';
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

    it('return addfix', function () {
      const s = 'text';
      const prefix = 'www';
      const suffix = 'com';
      const result = 'www.text.com';
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


  // describe('defaultTemplate', function () {
  //   it('is a function', function () {
  //     expect(string.defaultTemplate).to.be.a('function');
  //   });
  //
  //   it('@defaultTemplate', function () {
  //     const template = '/profiles/:_id/profile/';
  //     const context = { _id: 'value' };
  //     const options = { _id: 'value' };
  //     const expected = '/profiles/value/profile/';
  //     const result = string.defaultTemplate(template, context, options);
  //
  //     expect(result).to.be.equal(expected);
  //   });
  // });
});
