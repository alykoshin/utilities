const {asyncForEach,setTimeoutAsPromised} = require('@utilities/async');


export class EBINARY_ONLY {
  constructor() {
    return new Error(`Not a binary tree`);
  }
}

export class ENODE_NOT_FOUND {
  constructor() {
    return new Error(`Node not found`);
  }
}

export class EINVALID_NODE {
  constructor() {
    return new Error(`Only instances of TreeNode class may be added as child node`);
  }
}

export class EPARENT_ALREADY_SET {
  constructor() {
    return new Error(`Parent already set, must be removed before`);
  }
}

export class EPARENT_NOT_SET {
  constructor() {
    return new Error(`Parent is not set`);
  }
}

export class ENOT_APPLICABLE extends Error {
  constructor() {
    super(`Not applicable`);
  }
}


export class TreeNode {
  _children: TreeNode[]
  _parent: TreeNode
  _data: any

  constructor (data?:any) {
    this._children = [];
    this._parent   = null;
    this._data     = data;
  }

  _addChild(newChildNode) {
    if (! (newChildNode instanceof  TreeNode)) throw new EINVALID_NODE();
    this._children.push(newChildNode);
    return this;
  }

  _indexOfChild(nodeToFind) {
    return this._children.indexOf(nodeToFind);
  }

  _hasDirectChild(nodeToFind) {
    return this._indexOfChild(nodeToFind) >= 0;
  }

  async _hasDeepChild(nodeToFind) {
    let result = false;
    await this.traversePreOrder(async node => {
      if (node === nodeToFind) result = true;
    });
    return result;
  }

  _findDirectChild(callback) {
    return this._children.find(callback);
  }

  async _findDeepChild(callback) {
    let result = false;
    await this.traversePreOrder(async node => {
      if (callback(node)) result = node;
    });
    return result;
  }

  _removeChild(existingChildNode) {
    const idx = this._indexOfChild(existingChildNode);
    if (idx < 0) throw new ENODE_NOT_FOUND();
    this._children.splice(idx, 1);
    return this;
  }

  _setParent (newParentNode) {
    if (this._parent) throw new EPARENT_ALREADY_SET();
    this._parent = newParentNode;
    return this;
  }

  _unsetParent (newParentNode) {
    if (!this._parent) throw new EPARENT_NOT_SET();
    this._parent = null;
    return this;
  }

  hasParent () {
    return !!this._parent;
  }

  isRoot () {
    return !this._parent;
  }

  addChild(...nodes) {
    let lastChild;
    nodes.forEach(n => {
      lastChild = this._addChild(n);
      n._setParent(this);
    });
    return lastChild;
  }

  removeChild(existingChildNode) {
    if (! (existingChildNode instanceof  TreeNode)) throw new EINVALID_NODE();
    this._removeChild(existingChildNode);
    existingChildNode._unsetParent(this);
    return this;
  }

  addToParent(newParentNode) {
    if (! (newParentNode instanceof  TreeNode)) throw new EINVALID_NODE();
    this._setParent(newParentNode);
    this._parent._addChild(newParentNode);
    return this;
  }

  removeFromParent(existingChildNode) {
    if (! (existingChildNode instanceof  TreeNode)) throw new EINVALID_NODE();
    this._unsetParent(existingChildNode);
    this._parent._removeChild(existingChildNode);
    return this;
  }

  //

  async traversePreOrder(fn) {
    await fn(this);
    return await asyncForEach(this._children, async child => child.traversePreOrder(fn));
  }

  async traverseInOrder(fn) {
    if (this._children.length > 2) throw new EBINARY_ONLY();
    if (this._children.length > 0) await this._children[0].traversePreOrder(fn);
    await fn(this);
    if (this._children.length > 1) await this._children[1].traversePreOrder(fn);
  }

  async traversePostOrder(fn) {
    // console.log('traversePostOrder 1', this._data.name, this._children.length)
    await asyncForEach(this._children, async child => child.traversePostOrder.call(child, fn));
    // console.log('traversePostOrder 2', this._data.name)
    await fn(this);
    // console.log('traversePostOrder 3', this._data.name)
  }

  async _traverseLevelOrderSelf(fn) {
    return await fn(this);
  }

  async _traverseLevelOrderChilds(fn) {
    await asyncForEach(this._children, async child => child._traverseLevelOrderSelf(fn));
    await asyncForEach(this._children, async child => child._traverseLevelOrderChilds(fn));
  }

  async traverseLevelOrder(fn) {
    await this._traverseLevelOrderSelf(fn);
    await this._traverseLevelOrderChilds(fn);
  }

}


//module.exports = TreeNode;

