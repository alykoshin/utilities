/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));

const _ = require('lodash');

import {ChainableNode} from '../src/';


describe('ChainableNode', () => {

  before('before', () => {
  });

  it('is a function', () => {
    expect(ChainableNode).is.a('function');
  });

  it('creates object with _parent and undefined _args', () => {
    const parent = {};
    const child = new ChainableNode(parent);
    expect(child).to.be.an('object');
    expect(child._parent).to.eql(parent);
    expect(child._args).to.eql([]);
  });

  it('creates object with _parent and _args', () => {
    const parent = {};
    const fnArgs = [ { prop1: 'value1' }, ['arg1', 'arg2'] ];
    const child = new ChainableNode(parent, ...fnArgs);
    expect(child).to.be.an('object');
    expect(child._parent).to.eql(parent);
    expect(child._args).to.eql(fnArgs);
  });

  it('chainedExec() calls root\'s method (1 level - direct parent)', (/*done*/) => {
    const objArg = { prop: 'value' };
    const arrArg = [ 'value1', 'value2' ];
    const expected = 'expected';
    const parent = {
      testFn: (passedParams, passedArgs) => {
        expect(passedParams).to.eql(objArg);
        expect(passedArgs).to.eql(arrArg);
        return expected;
      }
    };
    const child = new ChainableNode(parent);
    const result = child.chainedExec('testFn', objArg, arrArg);
    expect(result).to.equals(expected);
  });

  it('chainedExec() calls root\'s method (2 levels - grandparent)', (/*done*/) => {
    //const grandparentParams = { grandparentParam: 'grandparentValue' };
    const parentObjArg      = { parentParam:      'parentValue'      };
    const childObjArg       = { childParam:       'childValue'       };
    const fnObjArg          = { fnParam:          'fnValue'          };
    const parentArrArg = [ 'parentArg1', 'parentArg2' ];
    const childArrArg  = [ 'childArg1',  'childArg2'  ];
    const fnArrArg     = [ 'fnArg1',     'fnArg2'     ];
    const fnStrArg     = 'fnArg3';
    const expected   = 'expected';
    const grandparent = {
      testFn: (passedObjArg, passedArrArg, passedStrArrArg) => {
        expect(passedObjArg).to.eql({ ...parentObjArg, ...childObjArg, ...fnObjArg });
        expect(passedArrArg).to.eql([ ...parentArrArg, ...childArrArg, ...fnArrArg ]);
        expect(passedStrArrArg).to.eql([ fnStrArg ]);
        return expected;
      }
    };
    const parent = new ChainableNode(grandparent, parentObjArg, parentArrArg);
    const child  = new ChainableNode(parent,      childObjArg,  childArrArg);
    const result = child.chainedExec(  'testFn',    fnObjArg, fnArrArg, fnStrArg);
    expect(result).to.equals(expected);
  });

});
