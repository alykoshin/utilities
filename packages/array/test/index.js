/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));


describe('@utilities/array', function () {
  let array;

  before('before', function () {
    array = require('../lib/');
  });


  describe('sanitize', function () {

    it('is a function', function () {
      assert(typeof array.sanitize == 'function', 'Expect function');
    });

    it('is an array', function () {
      const myArray = [5,4,3,2,1];
      const expected = [5,4,3,2,1];
      const result = array.sanitize(myArray);
      expect( result ).to.be.eql(expected);
    });

    it('is an not array', function () {
      const myArray = null;
      const result = array.sanitize(myArray);
      expect(
        array.sanitize(result)
      ).to.be.eql([null]);
    });

    it('if array == \'undefined\'', function () {
      const result = array.sanitize(undefined);
      expect(result).to.be.eqls([]);
    });

  });


  describe('peek', function () {

    it('is a function', function () {
      assert(typeof array.peek === 'function', 'Expect function');
    });

    it('simple check', function () {
      const a = [ 1, 2, 3 ];
      expect(array.peek(a, 0)).to.be.equal(a[a.length-1]);
      expect(array.peek(a, 1)).to.be.equal(a[a.length-2]);
      expect(array.peek(a, 2)).to.be.equal(a[a.length-3]);
    });

    it('undefined pos', function () {
      const a = [ 1, 2, 3 ];
      expect(array.peek(a)).to.be.equal(a[a.length-1]);
    });

  });


  describe('indexOf', function () {

    it('is a function', function () {
      assert(typeof array.indexOf === 'function', 'Expect function');
    });

    it('indexOf not be find', function () {
      const myArray = [5,4,3,2,1];
      const el = 0;
      const expected = -1;

      const result = array.indexOf(myArray, el);
      expect(result).to.be.eql(expected);
    });

    it('find indexOf', function () {
      const myArray = [5,4,3,2,1];
      const expected = 0;

      const result = array.indexOf(myArray, 5);
      expect(result).to.be.eql(expected);
    });

  });


  describe('hasElement', function () {

    it('is a function', function () {
      assert(typeof array.hasElement === 'function', 'Expect function');
    });

    it('the number of elements is greater than or equal to 0', function () {
      const myArray = [5,4];
      const expected = true;

      const result = array.hasElement(myArray, 5);
      expect(result).to.be.eql(expected);
    });
  });


  describe('getOne', function () {

    it('is a function', function () {
      assert(typeof array.getOne === 'function', 'Expect function');
    });

    it('if array length < 1', function () {
      const myArray = [];
      const el = 4;
      expect(function () {
        array.getOne(myArray, el);
      }).throw('Element not found');
    });

    it('if error \'More than one element found\'', function () {
      const myArray = [5,4,3,3,3,2,1];
      const el = 3;
      expect(function () {
        array.getOne(myArray, el);
      }).throw('More than one element found');
    });

    it('if  without el', function () {
      const myArray = [5,4,3,3,3,2,1];
      expect(function () {
        array.getOne(myArray);
      }).throw('More than one element found');
    });

    // it('find one element and print it typeOf', function () {
    //   const myArray = [5,4,3,2,1];
    //   const el = 1;
    //   const result = array.getOne(myArray, el);
    //   const expected = 4;
    //
    //   expect(result).to.be.eql(expected);
    // });

  });


  describe('findMatched', function () {

    it('is a function', function () {
      assert(typeof array.findMatched === 'function', 'Expect function');
    });

    it('if find matched', function () {
      const myArray = [
        {'a': 5, 'b':6, 'c':7},
        {'d': 8, 'e':9, 'f':0}
      ];
      const match = {'a':5, 'c':7};
      const result = array.findMatched(myArray, match);
      const expected = [ {'a': 5, 'b':6, 'c':7}];

      expect(result).to.be.eql(expected);
    });

    it('if find matched not found', function () {
      const myArray = [
        {'a': 5, 'b':6, 'c':7},
        {'d': 8, 'e':9, 'f':0}
      ];
      const match = {'l':8, 'm':0};
      const result = array.findMatched(myArray, match);
      const expected = [];

      expect(result).to.be.eql(expected);
    });

    it('if  matched = {}', function () {
      const myArray = [
        {'a': 5, 'b':6, 'c':7},
        {'d': 8, 'e':9, 'f':0}
      ];
      const match = {};
      const result = array.findMatched(myArray, match);
      const expected = [
        {'a': 5, 'b':6, 'c':7},
        {'d': 8, 'e':9, 'f':0}];

      expect(result).to.be.eql(expected);
    });

    it('if the matched is absent', function () {
      const myArray = [
        {'a': 5, 'b':6, 'c':7},
        {'d': 8, 'e':9, 'f':0}
      ];
      const result = array.findMatched(myArray);
      const expected = [
        {'a': 5, 'b':6, 'c':7},
        {'d': 8, 'e':9, 'f':0}];

      expect(result).to.be.eql(expected);
    });
  });


  describe('removeAt', function () {

    it('is a function', function () {
      assert(typeof array.removeAt === 'function', 'Expect function');
    });

    it('delete 1 element by index', function () {
      const myArray = [1,2,3,4];
      const index = 1;
      const result = array.removeAt(myArray, index);
      const expected = [1,3,4];

      expect(result).to.be.eql(expected);
    });

    it('if index < -1', function () {
      const myArray = [1,2,3,4];
      const index = -2;
      const result = array.removeAt(myArray, index);
      const expected = [1,2,3,4];

      expect(result).to.be.eql(expected);
    });
  });


  describe('removeElement', function () {

    it('is a function', function () {
      assert(typeof array.removeElement === 'function', 'Expect function');
    });

    it('delete element by value. If you have the same value in array, delete the first', function () {
      const myArray = [ 1, 9, 2, 9, 3, 9, 4];
      const el = 9;
      const expected = [ 1, 2, 9, 3, 9, 4];
      const result = array.removeElement(myArray, el);
      expect(result).to.be.eql(expected);
    });

    it('if value not found', function () {
      const myArray = [ 1, 2, 3, 4];
      const el = 9;
      const expected = [ 1, 2, 3, 4];
      const result = array.removeElement(myArray, el);
      expect(result).to.be.eql(expected);
    });

    it('delete element by value', function () {
      const myArray = [ 1, 2, 3, 4];
      const el = 3;
      const expected = [ 1, 2, 4];
      const result = array.removeElement(myArray, el);
      expect(result).to.be.eql(expected);
    });

  });


  describe('removeMatched', function () {

    it('is a function', function () {
      assert( typeof array.removeMatched === 'function', 'Expect function');
    });

    it('remove matched', function () {
      const myArray = ['5','6','5','7','5','8','5','9','5','5'];
      const match = '5';
      const result = array.removeMatched(myArray, match);
      const expected = 6;
      expect(result).to.be.eql(expected);
    });

    it('remove matched', function () {
      const myArray = [
        {'a': 5, 'b':6, 'c':7},
        {'a': 5, 'd': 8, 'e':9, 'f':0},
        {'a': 5, 'k': 2, 'c':7, 'm':4}
        ];
      const match = {'a': 5, 'c': 7};
      const result = array.removeMatched(myArray, match);
      const expected = 2;
      expect(result).to.be.eql(expected);
    });
  });
});
