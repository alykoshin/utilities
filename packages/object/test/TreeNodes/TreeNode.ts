/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things
//chai.use(require('chai-arrays'));

const _ = require('lodash');

import {TreeNode} from '../../src/TreeNodes/TreeNode';


describe('TreeNode', function () {
  this.timeout(10*1000);

  before('before', function () {
  });

  after('after', async function () {
  });

  describe('constructor', function () {

    before(() => {
    });

    it('is a function', () => {
      expect(TreeNode).to.be.a('function');
    });

    it('creates object', () => {
      expect(new TreeNode()).to.be.an('object');
    });

  });

  describe('traversal', function () {
    let a, b, c, d, e, f, g;

    before(() => {
      a = new TreeNode('a');
      b = new TreeNode('b');
      c = new TreeNode('c');
      d = new TreeNode('d');
      e = new TreeNode('e');
      f = new TreeNode('f');
      g = new TreeNode('g');
      a.addChild(b,c,d);
      c.addChild(e,f);
      d.addChild(g);
    });

    it('traversePreOrder', async () => {
      const expected = ['a','b','c','e','f','d','g'];
      const actual   = [];
      await a.traversePreOrder(node => actual.push(node._data));
      expect(actual).to.be.eql(expected);
    });

    it('traversePostOrder', async () => {
      const expected = ['b','e','f','c','g','d','a'];
      const actual   = [];
      await a.traversePostOrder(node => actual.push(node._data));
      expect(actual).to.be.eql(expected);
    });

    it('traverseLevelOrder', async () => {
      const expected = ['a','b','c','d','e','f','g'];
      const actual   = [];
      await a.traverseLevelOrder(node => actual.push(node._data));
      expect(actual).to.be.eql(expected);
    });

  });


});
