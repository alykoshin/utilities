const isNodejs = require('./isNodejs');


const asyncForEach = async (array, callback) => {
  //console.log('asyncForEach: enter');
  for (let index = 0; index < array.length; index++) {
    //console.log('asyncForEach: index:', index);
    await callback(array[index], index, array)
  }
  //console.log('asyncForEach: exit');
};


const asyncForEachReverse = async (array, callback) => {
  //console.log('asyncForEach: enter');
  for (let index = array.length-1; index >= 0 ; index--) {
    //console.log('asyncForEach: index:', index);
    await callback(array[index], index, array)
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
  asyncForEachReverse,
  asyncMap,
  asyncMapReverse,

  runAsync,

  asyncSetInterval,
  asyncSetTimeout,
  setTimeoutAsPromised,

  wrapIntoFiber
};






