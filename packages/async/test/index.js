/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));

var asyncFile = require('../../async/lib/index');

describe('@utilities/async', function () {

  before('before', function () {

  });

  beforeEach('beforeEach', function () {

  });

  afterEach('afterEach', function () {

  });

  after('after', function () {

  });


  describe('asyncForEach', function () {
    let asyncForEach;

    before('before', function () {
      asyncForEach = require('../lib/').asyncForEach;
    });

    it('should be a function', function () {
      expect(asyncForEach).to.be.a('function');
    });

    it('simple check', async function () {
      const data     = [ 1, 2, 3 ];
      const expected = 6;
      let result = 0;
      await asyncForEach(data, async(element) => result += element );
      expect(result).to.eql(expected);
    });

  });


  describe('asyncForEachParallelLimit', function () {
    let asyncForEachParallelLimit;

    before('before', function () {
      asyncForEachParallelLimit = asyncFile.asyncForEachParallelLimit;
    });

    it('should be a function', function () {
      expect( asyncForEachParallelLimit).to.be.a('function');
    });

    it('@asyncForEachParallelLimit', async function () {
      const myArray = [ 1, 2, 3, 5, 8 , 14];
      const limit = 2;
      const expected = [1, 2];
      let result = [];

      await asyncForEachParallelLimit( myArray, limit,  async(item, index) =>
      { for(index; index < limit; index ++){
        result[index] = item;}
      });
      expect(result).to.eql(expected);
    });

    it('if limit undefind', async function () {
      const myArray = [ 1, 2, 3, 5, 8 , 14];
      const limit = false;
      const expected = [];
      let result = [];

      await asyncForEachParallelLimit( myArray, limit,  async(item, index) =>
      { for(index; index < limit; index ++){
        result[index] = item;}
      });
      expect(result).to.eql(expected);
    });

  });


  describe('asyncForEachReverse', function () {
    let asyncForEachReverse;

    before(()=> {
      asyncForEachReverse =  asyncFile.asyncForEachReverse;
    });

    it('is a function', function () {
      assert(typeof asyncForEachReverse === 'function');
    });

    it('@asyncForEachReverse', async function () {
      const myArray = [2,0,1,9];
      const expected = [2,0,1,9];
      let result = [];

      await asyncForEachReverse( myArray, async( element, index, array) =>{
        for ( index = array.length-1; index >= 0 ; index-- ){
          console.log('index:', index);
          result[index]= array[index]; //element
          console.log('result:', result);
        }
      });
      console.log('res:', result);
      expect(result).to.eql(expected);
    });
  });


  describe('asyncMap', function () {
    let asyncMap;

    before('before', function () {
      asyncMap = asyncFile.asyncMap;
    });

    it('should be a function', function () {
      expect(asyncMap).to.be.a('function');
    });

    it('@asyncMap', async function () {
      const myArray     = [ 9, 8, 7 ];
      const expected = '987';
      let result = [];
      await asyncMap( myArray, async(element,index, array) =>
      {
        result += array[index];
        // console.log('result', result);
      });
      // console.log('res:', result );
      expect(result).to.eql(expected);
    });

  });

// также проблема, не могу присвойть элемент
  describe('asyncMapReverse', function () {
    let asyncMapReverse;

    before(()=> {
      asyncMapReverse = asyncFile.asyncMapReverse
    });

    it('is a function', function () {
      assert(typeof asyncMapReverse === 'function');
    });

    it('@asyncMapReverse', async function () {
      const myArray = [2,0,1,9];
      const expected = [2,0,1,9];
      let result = [];

      await asyncMapReverse(myArray, async (element, index, array) => {
        for(index; index< array.length; index++) {
          console.log('index', index);
          console.log('result:', result);
          result[index]= array[index];
        }
      });
      console.log('result:', result);
      expect(result).to.eql(expected);
    });

  });


});
