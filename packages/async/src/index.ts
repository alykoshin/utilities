import * as isNodejs from './isNodejs';
import * as deferred from'./deferred';


const asyncForEach = async function (this: any, array, callback, exitConditionFn) {
  /* must be function instead of => to in order `this` value tp be passed */
  let res;
  for (let index = 0; index < array.length; index++) {
    //console.log('asyncForEach: index:', index);
    res = await callback.call(this, array[ index ], index, array);
    if (exitConditionFn && exitConditionFn(res)) break;
  }
  return res;
  //console.log('asyncForEach: exit');
};

//
// https://stackoverflow.com/a/51020535/2774010
//
const asyncForEachParallelLimit = async function (this: any, array, limit, callback) {
  /* must be function instead of => to in order `this` value tp be passed */

  async function doWork(this: any, iterator) {
    for (let [index, item] of iterator) {
      const result = await callback.call(this, item, index, array);

      if (result === false) { // if worker return false, remove everything in the iterator
        for (let [index, item] of iterator);
        console.log(index + '(result===false): ' + item);
      }
  //   console.log(index + ': ' + item + ': ' +array);
    }
  }

  const iterator = array.entries();
  const workers = new Array(limit).fill(iterator).map(doWork.bind(this));

//      ^--- starts `limit` workers sharing the same iterator

  return Promise
    .all(workers)
    //.then((res) => { console.log('done'); return res; })
    ;
};


const asyncForEachReverse = async function (this: any, array, callback) {
  //console.log('asyncForEach: enter');
  for (let index = array.length-1; index >= 0 ; index--) {
    //console.log('asyncForEach: index:', index);
    await callback.call(this, array[index], index, array);
  }
  //console.log('asyncForEach: exit');
};


const asyncMap = async function(this: any, array, callback) {
  //console.log('asyncMap');
  const res = [];
  for (let index = 0; index < array.length; index++) {
    //console.log('asyncMap: index:', index);
    res[index] = await callback.call(this, array[index], index, array);
  }
  return res;
};


const asyncMapReverse = async function(this: any, array, callback) {
  //console.log('asyncMap');
  const res = [];
  for (let index = array.length-1; index >= 0 ; index--) {
    //console.log('asyncMap: index:', index);
    res[index] = await callback.call(this, array[index], index, array);
  }
  return res;
};


const runAsync = function (this: any, fn, ...args) {
   return setTimeout(() => fn.call(this, ...args) , 0);
};

const asyncSetInterval = async function (this: any, ms) {
  return new Promise(resolve => setInterval(resolve.bind(this), ms));
};

const asyncSetTimeout = async function (this: any, ms) {
  return new Promise(resolve => setTimeout(resolve.bind(this), ms));
};
const setTimeoutAsPromised = asyncSetTimeout;




/*
// Fibers cannot be loaded at browser side
// ...and also causes problems with building

let wrapIntoFiber;

if (isNodejs()) {
//const Fiber = Npm.require('fibers'); // Meteor
  try {
    const Fibers = require('fibers');
  } catch(e) {
    console.error('"fibers" package is required by wrapIntoFiber() funciton, but either not installed or invalid. In order to use this function please try to install this package with "npm i fibers" command.');
  }
  wrapIntoFiber = (fn, ...args) => Fibers( async () => await fn(...args) ).run();
} else {
  wrapIntoFiber = () => { throw new Error('Fibers cannot be used at browser'); };
}
*/


function processNextTick(this: any, fn /* arguments */) {
  const args = [].slice.call(arguments, 1);
  const self = this;
  process.nextTick(function() {
    fn.apply(self, args);
  });
}


function setTimeout0(this: any, fn /* arguments */) {
  const args = [].slice.call(arguments, 1);
  const self = this;
  setTimeout(() => {
    fn.apply(self, args);
  }, 0);
}


module.exports = {
  asyncForEach,
  asyncForEachParallelLimit,

  asyncForEachReverse,
  asyncMap,
  asyncMapReverse,

  runAsync,

  asyncSetInterval,
  asyncSetTimeout,
  setTimeoutAsPromised,

/*
  wrapIntoFiber,
*/

  processNextTick,
  setTimeout0,

  ...isNodejs,

  ...deferred,
};






