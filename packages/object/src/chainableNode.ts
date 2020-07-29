const debug = require('debug')('ChainableNode');

const {sanitizeArray} = require('@utilities/array');

//

export class ChainableNode {
  _parent: ChainableNode
  _args

  constructor(parentNode, ...args) {
    this._parent = parentNode;
    this._args = args;
  }

  isRoot() {
    return !(this._parent instanceof ChainableNode);
  }

  //_deconstructArgs(...args) {
  //  const [ params={}, ...moreArgs ] = args;
  //  return [ params, moreArgs ];
  //}
  //
  //_constructArgs([ params={}, moreArgs=[] ]) {
  //  return [ params, ...moreArgs ];
  //}

  _mergeArgs(...fnArgs) {
    debug('_mergeArgs: enter: this._args:', this._args, '; fnArgs:', fnArgs);

    const isObject    = (o) => typeof o === 'object' && !Array.isArray(o);
    const isArrayable = (o) => Array.isArray(o) || ['number','string','boolean'].indexOf(typeof o)>=0 || o === null;

    const len = Math.max(this._args.length, fnArgs.length);
    const mergedArgs = [];
    for (let i=0; i<len; i++) {
      let thisArg = this._args[i];
      let fnArg   = fnArgs[i];
      const isMergeableObject = (
        (isObject(thisArg) && ( isObject(fnArg  ) || typeof fnArg   === 'undefined') ) ||
        (isObject(fnArg  ) && ( isObject(thisArg) || typeof thisArg === 'undefined') )
      );
      const isMergableArray = (
        (isArrayable(thisArg) && ( isArrayable(fnArg  ) || typeof fnArg   === 'undefined') ) ||
        (isArrayable(fnArg  ) && ( isArrayable(thisArg) || typeof thisArg === 'undefined') )
      );
      const bothUndefined = (
        typeof fnArg   === 'undefined' && typeof thisArg   === 'undefined'
      );
      //debug('_mergeArgs: isMergeableObject:', isMergeableObject, '; isMergableArray:', isMergableArray);
      if (isMergeableObject) {
        thisArg = thisArg || {};
        fnArg   = fnArg   || {};
        mergedArgs.push({ ...thisArg, ...fnArg });

      } else if (isMergableArray) {
        thisArg = sanitizeArray(thisArg);
        fnArg   = sanitizeArray(fnArg);
        mergedArgs.push([ ...thisArg, ...fnArg ]);
      } else if (bothUndefined) {
        mergedArgs.push(undefined);
      } else {
        console.error('ChainableNode._mergeArgs: thisArg:', thisArg, 'fnArg:',   fnArg);
        throw new Error('ChainableNode._mergeArgs: Unable to merge args; corresponding args must be either object||undefined or array||undefined types');
      }
    }
    debug('_mergeArgs: exit: mergedArgs:', mergedArgs);
    return mergedArgs;
    //const [ thisParams={}, ...thisRestArgs ] = this._args;
    //const [ fnParams={},   ...fnRestArgs   ] = fnArgs;
    //return [ { ...thisParams, ...fnParams }, ...thisRestArgs, ...fnRestArgs ];
  }

  chainedExec(fnName, ...fnArgs) {
    const mergedArgs = this._mergeArgs(...fnArgs);
    return this.isRoot()
           ? this._parent[fnName].call(this._parent, ...mergedArgs)
           : this._parent.chainedExec.call(this._parent, fnName, ...mergedArgs)
      ;
  }

}

//

// module.exports = ChainableNode;
