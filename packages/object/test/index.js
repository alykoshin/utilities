/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));

const _ = require('lodash');


describe('@utilities/object', () => {
  let object;

  before('before', () => {
    object = require('../lib/');
  });


  describe('remap', () => {

    it('is a function', () => {
      assert(typeof object.remap === 'function', 'Expect function');
    });

    it('simple check', () => {
      const source = { origin: { lat:1, lng:2 } };
      const mapping = {
        'lat': 'origin.lat',
        'lng': (o,targetKey) => _.get(o, 'origin.lng'),
      };
      // const options = { defaultCopy: true }; // not implemented yet
      const expected = { lat: 1, lng: 2 };

      const result = object.remap(source, mapping);

      //console.log(result);
      expect(result).to.be.eql(expected);
    });

    it('simple check, inverted option', () => {
      const source = { origin: { lat:1, lng:2 } };
      const mapping = {
        'origin.lat': 'lat',
        'origin.lng': 'lng',
      };
// const options = { defaultCopy: true }; // not implemented yet
      const expected = { lat: 1, lng: 2 };

      const result = object.remap(source, mapping, { inverted: true });

      //console.log(result);
      expect(result).to.be.eql(expected);
    });

  });


  describe('rename', () => {

    it('is a function', () => {
      assert(typeof object.rename === 'function', 'Expect function');
    });

    describe('simple check', () => {
      let source, mapping, expected, result;

      beforeEach(() => {
        source = {
          a: 1,
          b: { c: 2 },
          d: { e: 3, f: 4 },
          g: 5,
        };
        mapping = {
          'aa':    'a',
          'bb.cc': 'b.c',
          'dd.ee': 'd.e',
          'gg':    (o,key) => 'g',
        };
        expected = {
          'aa': 1,
          'b':  {}, // parent property will not be deleted
          'bb': { 'cc': 2 },
          'dd': { 'ee': 3 },
          'd':  { 'f':  4 },
          'gg': 5,
        };
      });

      it ('returns object with renamed props', () => {
        const result = object.rename(source, mapping);
        expect(result).to.be.eql(expected);
      });

      it ('returns object with renamed props (inverted)', () => {
        // invertion does not work for the function
        mapping['gg'] = 'g';
        const result = object.rename(source, _.invert(mapping), { inverted: true });
        expect(result).to.be.eql(expected);
      });

      it ('mutates source object', () => {
        const result = object.rename(source, mapping);
        expect(source).to.be.eql(result);
      });

    });

  });


});
