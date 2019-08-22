/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));


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
      asyncForEachParallelLimit = require('../lib/').asyncForEachParallelLimit;
    });

    it('should be a function', function () {
      expect( asyncForEachParallelLimit).to.be.a('function');
    });

    // it('@asyncForEachParallelLimit', async function () {
    //   const myArray = [ 1, 2, 3, 5, 8 , 14];
    //   const limit = 2;
    //   const expected = [1, 2];
    //
    //   let result = await asyncForEachParallelLimit( myArray, limit, async(element) => element);
    //
    //   expect(result).to.eql(expected);
    // });
  });


  describe('asyncMap', function () {
    let asyncMap;

    before('before', function () {
      asyncMap = require('../lib/').asyncMap;
    });

    it('should be a function', function () {
      expect(asyncMap).to.be.a('function');
    });

    it('simple check', async function () {
      const data     = [ 1, 2, 3 ];
      const expected = [ 2, 3, 4 ];
      let result = await asyncMap(data, async(element) => element+1 );
      expect(result).to.eql(expected);
    });

  });


});
