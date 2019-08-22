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


  describe('sanitize', () => {

    it('is a function', () => {
      assert(typeof object.sanitize === 'function', 'Expect function');
    });

    it('returns same object for objects', () => {
      const o = { key: 'value' };
      const result = object.sanitize(o);
      expect(result).to.be.eql(o);
    });

    it('returns same object for objects - 2', () => {
      function Foo() {
        this.a = 1;
      }
      const o = new Foo();
      const result = object.sanitize(o);
      expect(result).to.be.eql(o);
    });

    it('returns same object for objects - 3', () => {
      class Foo {
        constructor() {
          this.a = 1
        }
      }
      class Foo2 extends Foo {
        //constructor() {
        //  this.a = 1
        //}
      }
      const o = new Foo2();
      const result = object.sanitize(o);
      expect(result).to.be.eql(o);
    });

    it('returns empty object for non-objects', () => {


      const values = [
        undefined,
        null,
        'string',
        123,
        [1,2,3],
      ];
      const expected = {};
      values.forEach(v => {
        const result = object.sanitize(v);
        expect(result).to.be.eql(expected);
      });
    });

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
      let source, mapping, expected;

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



  describe('matchKey', () => {
    let matchKey;

    before(() => {
      matchKey = object.matchKey;
    });

    it('is a function',  () => {
      assert(typeof object.matchKey === 'function');
    });

    it(' try matchKey', () => {
      const myKey =  '$[512]';
      const result = object.matchKey(myKey);
      const expected = [ '$[512]', undefined, '[512]' ];

      expect(result).to.eql(expected);
    });

    it(' try2 matchKey', () => {
      const myKey =  '$512';
      const result = object.matchKey(myKey);
      const expected = [ '$512', '512', undefined];

      expect(result).to.eql(expected);
    });

  });


  describe('matchKeyToIdx', function () {
    let matchKeyToIdx;

    before(()=> {
      matchKeyToIdx= object.matchKeyToIdx;
    });

    it('is a function', function () {
      assert(typeof matchKeyToIdx === 'function');
    });

    it('this is Group [1] matchKeyToIdx', function () {
      const myKey = '$512';
      const result = object.matchKeyToIdx(myKey);
      const expected = '512';

      expect(result).to.eql(expected);
    });

    it('this is Group [2] matchKeyToIdx', function () {
      const myKey = '$[512]';
      const result = object.matchKeyToIdx(myKey);
      const expected = '[512]';

      expect(result).to.eql(expected);
    });

    it('invalid key matchKeyToIdx', function () {
      const myKey = 123;
      expect(function () {
        object.matchKeyToIdx(myKey);
      }).throw();
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

    it('is an error in isEqualPartial',function () {
      const s = { pick: pick1, omit: omit1_1};
      expect(function () {
        object.isEqualPartial(o1, o2, s);
      }).throw();
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


  describe('saveJsonSync', function () {
    let saveJsonSync;

    before(()=>{
      saveJsonSync = object.saveJsonSync;
    });

    it('is a function', () => {
      assert(typeof saveJsonSync === 'function');
    });

    it('"o" must be object to save', function () {
     const o = 'string';
     const pathname = '';
     const options =  false;

     expect(function () {
       object.saveJsonSync(pathname, o, options);
     }).throw();
    });

  });


  describe('@loadJsonSync', function () {
    let loadJsonSync;

    before(() => {
      loadJsonSync = object.loadJsonSync;
    });

    it('is a function', function () {
      assert(typeof loadJsonSync === 'function');
    });

  });

  describe('@jsonParse', function () {
    let jsonParse;
    // let jsonParseObj;

    before(() => {
      jsonParse = object.jsonParse;
      // jsonParseObj = object.jsonParse.option(false);
    });

    it('is a function', function () {
      assert(typeof jsonParse === 'function');
    });

    it('return JSON.parse(s)', function () {
      const s = '123';
      const result = jsonParse(s);
      const expected = 123;
      expect( result ).to.equals(expected);
    });

    it('error jsonParse', function () {
      const s = '';
      const options = true;
      expect(function () {
        object.jsonParse(s, options);
      }).throw();
    });

    it('return {}, jsonParse', function () {
      const s = 'a';
      const ret = expect(function () {
        object.jsonParse(s, false);
      }).throw();
      // console.log('return {}: ', ret);
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
      const o1 = { prop1: 'value1'};
      const o2 = { prop1: 'value2' };
      expect(() => {
        assignUniq(o1, o2);
      }).to.throw('already has property');
    });

  });

  describe('loadJsonDirSync', function () {
    let loadJsonDirSync;

    before(() => {
      loadJsonDirSync = object.loadJsonDirSync;
      // jsonParseObj = object.jsonParse.option(false);
    });

    it('is a function', function () {
      assert(typeof object.loadJsonDirSync === 'function', 'Expect function');
    });

    // it('stringify loadJsonDirSync', function () {
    //   const dir = '';
    //   const options = '123';
    //   const  result = object.loadJsonDirSync(dir, options);
    //   const expected = 123;
    //   expect( result ).to.equals(expected);
    // });

  });



});
