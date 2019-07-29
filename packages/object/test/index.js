/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
chai.use(require('chai-arrays'));

const _ = require('lodash');

const {replaceEol} = require('@utilities/string');


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



  describe('@isEqualPartial', function () {
    let isEqualPartial;

    before(() => {
      isEqualPartial = object.isEqualPartial;
    });

    const o1 = { a:1, b:{c:3}, d:{e:4} };
    const o2 = { a:1, b:{c:3}, d:{e:5} };
    const pick1 = [ 'a' ];
    const pick2 = [ 'a', 'b.c' ];
    const pick3 = [ 'a', 'b.c', 'd.e' ];

    const omit1_1 = [ 'd.e' ];
    const omit1_2 = [ 'd' ];

    const omit2_1 = [ 'a', ];
    const omit2_2 = [      'b' ];
    const omit2_3 = [ 'a', 'b' ];
    const omit2_4 = [ 'a', 'b.c' ];

    const omit3_1 = [ 'a',        'd.e' ];
    const omit3_2 = [      'b',   'd.e' ];
    const omit3_3 = [      'b.c', 'd.e' ];
    const omit3_4 = [ 'a', 'b.c', 'd.e' ];

    it('is a function', function () {
      assert(typeof isEqualPartial === 'function');
    });

    it('pick', function () {
      assert( isEqualPartial(o1,o2,{pick:pick1}));
      assert( isEqualPartial(o1,o2,{pick:pick2}));
      assert( !isEqualPartial(o1,o2,{pick:pick3}));
    });

   it('omit', function () {
      assert( isEqualPartial(o1,o2,{omit:omit1_1}));
      assert( isEqualPartial(o1,o2,{omit:omit1_2}));
      
      assert( !isEqualPartial(o1,o2,{omit:omit2_1}));
      assert( !isEqualPartial(o1,o2,{omit:omit2_2}));
      assert( !isEqualPartial(o1,o2,{omit:omit2_3}));
      assert( !isEqualPartial(o1,o2,{omit:omit2_4}));

     assert( isEqualPartial(o1,o2,{omit:omit3_1}));
     assert( isEqualPartial(o1,o2,{omit:omit3_2}));
     assert( isEqualPartial(o1,o2,{omit:omit3_3}));
     assert( isEqualPartial(o1,o2,{omit:omit3_4}));
   });

  });


  describe('@jsonToHtml', function () {
    let jsonToHtml;

    before(() => {
      jsonToHtml = object.jsonToHtml;
    });

    const o1 = { a:1 };

    it('is a function', function () {
      assert(typeof jsonToHtml === 'function');
    });

    it('default options', function () {
      const result = jsonToHtml(o1);
      const expected = '<code>{<br/>  "a": 1<br/>}</code>';
      expect( result ).to.equals(expected);
    });

   it('options.pretty=false', function () {
      const result = jsonToHtml(o1, { pretty: false });
      const expected = '<code>{"a":1}</code>';
      expect( result ).to.equals(expected);
    });

   it('options.br=false', function () {
      const result = replaceEol(
        jsonToHtml(o1, { br: false }),
        '\r\n',
      );
      const expected = '<code>{\r\n  "a": 1\r\n}</code>';
      expect( result ).to.equals(expected);
    });

   it('options.code=false', function () {
      const result = jsonToHtml(o1, { code: false });
      const expected = '{<br/>  "a": 1<br/>}';
      expect( result ).to.equals(expected);
    });

  });


  describe('@assignUniq', function () {
    let assignUniq;

    before(() => {
      assignUniq = object.assignUniq;
    });

    it('is a function', function () {
      assert(typeof assignUniq === 'function');
    });

    it('assigns unique', function () {
      const o1 = { prop1: 'value1' };
      const o2 = { prop2: 'value2' };
      const o3 = { prop3: 'value3' };
      const result = assignUniq(o1, o2, o3);
      const expected = _.assign({}, o1, o2, o3);
      expect( result ).to.eql(expected);
    });

   it('throws on non-unique', function () {
      const o1 = { prop1: 'value1' };
      const o2 = { prop1: 'value2' };
      expect(() => {
        assignUniq(o1, o2);
      }).to.throw('already has property');
    });

  });


});
