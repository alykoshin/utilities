import { TreeNode } from './TreeNode';


export class NamedTreeNode extends TreeNode {

  constructor (data) {
    super(data);
  }

  async _hasDeepChildName(nodeNameToFind) {
    let result = false;
    await this.traversePreOrder(async node => {
      if (node._data.name === nodeNameToFind) result = true;
    });
    return result;
  }

  async _findDeepChildName(name) {
    return await this._findDeepChild(async node =>
      node._data.name === name
    );
  }

}

