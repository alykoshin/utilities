/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));


describe('@utilities/string', function () {
  let array;

  before('before', function () {
    array = require('../lib/');
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

});
