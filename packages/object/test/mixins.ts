/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));

const _ = require('lodash');
const path = require('path');
const mkdirp = require('mkdirp');

const baseTestDir = path.join(process.cwd(), 'test-data');



describe('@utilities/object', () => {
  let object;

  before('before', () => {
    object = require('../src/');
  });


  describe('mixins', () => {


    describe('applyMixins', () => {


      it('is a function', () => {
        assert(typeof object.applyMixins === 'function', 'Expect function');
      });

      describe('copy methods', () => {
        // const derived = { key1: 'value1', key2: 'value2' };
        // const base = { key2: 'value2', key3: 'value3' };
        // const expected = { key1: 'value1', key2: 'value2', key3: 'value3' };
        class A {
          aa () { return 'aa'; }
          ab () { return 'ab'; }
        }
        class B {
          ab () { return 'ab'; }
          bb () { return 'bb'; }
        }
        class X {
          xx () { return 'xx'; }
        }

        before('before', function () {
          object.applyMixins(X, [A,B]);
        })

        it('class has methods', function() {
          expect(X)
            // .itself
            .to
            .respondTo('aa').and
            .respondTo('ab').and
            .respondTo('bb').and
            .respondTo('xx')
        });

        it('instance has methods', function() {
          const x = new X();
          expect(x)
            .to.be.an('object').that
            .respondTo('aa').and
            .respondTo('ab').and
            .respondTo('bb').and
            .respondTo('xx')
        });

      });

    });

  });


});
