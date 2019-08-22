const isNodejs = require('./isNodejs');


const asyncForEach = async (array, callback) => {
  //console.log('asyncForEach: enter');
  for (let index = 0; index < array.length; index++) {
    //console.log('asyncForEach: index:', index);
    await callback(array[index], index, array)
  }
  //console.log('asyncForEach: exit');
};


//
// https://stackoverflow.com/a/51020535/2774010
//
const asyncForEachParallelLimit = async (array, limit, callback) => {

  async function doWork(iterator) {
    for (let [index, item] of iterator) {
      const result = await callback(item, index, array);
      if (result === false) { // if worker returne false, remove everything in the iterator
        for (let [index, item] of iterator);
        console.log(index + '(result===false): ' + item);
      }
     console.log(index + ': ' + item + ': ' +array);
    }
  }

  const iterator = array.entries();
  const workers = new Array(limit).fill(iterator).map(doWork);
//      ^--- starts `limit` workers sharing the same iterator

  return Promise
    .all(workers)
    //.then((res) => { console.log('done'); return res; })
    ;
};


const asyncForEachReverse = async (array, callback) => {
  //console.log('asyncForEach: enter');
  for (let index = array.length-1; index >= 0 ; index--) {
    //console.log('asyncForEach: index:', index);
    await callback(array[index], index, array);
  }
  //console.log('asyncForEach: exit');
};


const asyncMap = async(array, callback) => {
  //console.log('asyncMap');
  const res = [];
  for (let index = 0; index < array.length; index++) {
    //console.log('asyncMap: index:', index);
    res[index] = await callback(array[index], index, array);
  }
  return res;
};


const asyncMapReverse = async(array, callback) => {
  //console.log('asyncMap');
  const res = [];
  for (let index = array.length-1; index >= 0 ; index--) {
    //console.log('asyncMap: index:', index);
    res[index] = await callback(array[index], index, array);
  }
  return res;
};


const runAsync = (fn, ...args) => {
  return setTimeout(() => fn(...args) , 0);
};

const asyncSetInterval = async (ms) => new Promise(resolve => setInterval(resolve, ms));

const asyncSetTimeout = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const setTimeoutAsPromised = asyncSetTimeout;




// Fibers cannot be loaded at browser side

let wrapIntoFiber;

if (isNodejs()) {
//const Fiber = Npm.require('fibers'); // Meteor
  const Fibers = require('fibers');
  wrapIntoFiber = (fn, ...args) => Fibers( async () => await fn(...args) ).run();
} else {
  wrapIntoFiber = () => { throw new Error('Fibers cannot be used at browser'); }
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

  wrapIntoFiber
};






