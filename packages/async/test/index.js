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

    it('@asyncForEachParallelLimit with sync cb', async function () {
      const myArray = [ 1, 2, 3, 5, 8, 14];
      const limit = 2;
      const expected = [ 1, 2, 3, 5, 8, 14];
      let result = [];
      this.timeout(10000);

      await asyncForEachParallelLimit( myArray, limit,  async(element, index) => {
        console.log('element:', element, ', index', index);
        return( result[index] = element);
      });
      console.log('result: ', result);
      expect(result).to.eql(expected);
    });

    it('asyncForEachParallelLimit with Promise', async function () {
      const myArray = [1, 2, 3, 5, 8, 14];
      const limit = 3;
      const expected = [1, 2, 3, 5, 8, 14];
      let result = [];
      this.timeout(10000);

      const forEacher = (element, index) => {
        return new Promise((resolve, reject) => {
          return setTimeout(() => {
            return resolve( result [index] = element );
          }, 1000);
        });
      };

      await asyncForEachParallelLimit(myArray, limit, async(element, index) => {
        // for (index; index<limit; index++ ){
        console.log('element:', element, ', index', index);
        return forEacher(element, index);
        // }
      });

      console.log('result: ', result);
      expect(result).to.eql(expected);
    });

    it('if limit undefined', async function () {
      const myArray = [ 1, 2, 3, 5, 8, 14];
      const limit = false;
      const expected = [];
      let result = [];
      this.timeout(2000);

      const forEacher = (element, index) => {
        return new Promise((resolve, reject) => {
          return setTimeout(() => {
            return resolve( false );
          }, 1);
        });
      };

      await asyncForEachParallelLimit(myArray, limit, async(element, index) => {
        // for (index; index<limit; index++ ){
        console.log('element:', element, ', index', index);
        return forEacher(element, index);
        // }
      });

      console.log('result: ', result);
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

    it('@asyncForEachReverse with sync cb', async function () {
      const myArray = [2,0,1,9];
      const expected = [4,2,3,11];
      let result = [];

      await asyncForEachReverse(myArray, function (element, index) {
        console.log('element:', element, ', index', index);
        return ( result[index] = element+2);
      });
      console.log('result:', result);
      expect(result).to.eql(expected);
    });

    it('@asyncForEachReverse with Promise', async function () {
      const myArray = [2,0,1,9];
      const expected = [4,2,3,11];
      let result = [];

      const mapper = (element,index) => {
        return new Promise((resolve, reject) => {
          return setTimeout(() => {
            return resolve(result[index] = element+2);
          }, 1);
        });
      };

      await asyncForEachReverse(myArray, async (element, index, array) => {
        console.log('element:', element, ', index', index);
        return mapper(element, index);
      });

      console.log('result:', result);
      expect(result).to.eql(expected);
    });
  });


  describe('asyncMap with sync cb', function () {
    let asyncMap;

    before('before', function () {
      asyncMap = asyncFile.asyncMap;
    });

    it('should be a function', function () {
      expect(asyncMap).to.be.a('function');
    });

    it('@asyncMap ', async function () {
      const myArray     = [ 9, 8, 7 ];
      const expected = [ 9, 8, 7 ];
      let result = [];

      await asyncMap( myArray, async(element,index, array) =>
      {
        return(result[index] = element);
        // console.log('result', result);
      });
      console.log('res:', result );
      expect(result).to.eql(expected);
    });

  });


  describe('asyncMapReverse', function () {
    let asyncMapReverse;

    before(()=> {
      asyncMapReverse = asyncFile.asyncMapReversel;
    });

    it('is a function', function () {
      assert(typeof asyncMapReverse === 'function');
    });

    it('@asyncMapReverse with sync cb', async function () {
      const myArray = [2,0,1,9];
      const expected = [3,1,2,10];
      // let result = [];

      const result = await asyncMapReverse(myArray, async (element, index, array) => {
        console.log('element:', element, ', index', index);
        return element+1;
      });
      console.log('result:', result);
      expect(result).to.eql(expected);
    });

    it('@asyncMapReverse with Promise', async function () {
      const myArray = [2,0,1,9];
      const expected = [3,1,2,10];
      // let result = [];

      const mapper = (element) => {
        return new Promise((resolve, reject) => {
          return setTimeout(() => {
            return resolve(element + 1);
          }, 1);
        });
      };

      const result = await asyncMapReverse(myArray, async (element, index, array) => {
        console.log('element:', element, ', index', index);
        return mapper(element);
      });

      console.log('result:', result);
      expect(result).to.eql(expected);
    });
    this.timeout(1);
  });


  describe('runAsync', function () {
    let runAsync;

    before('before', function () {
      runAsync = asyncFile.runAsync;
    });

    it('is a function', function () {
      assert(typeof runAsync === 'function');
    });

    it('@runAsync', function (done) {
      const expected = 'hello';
      const args = 'hello';
      // const thisObj = {'OMG this is this': args};
      const fn = (ar)=>{
        console.log(ar);
        expect(ar).to.equal(expected);
        done();
      };
      // runAsync.call(thisObj, fn, args);
      runAsync( fn, args);

    });

  });
});
