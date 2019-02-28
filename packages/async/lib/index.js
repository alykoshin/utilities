//const Fiber = Npm.require('fibers'); // Meteor
const Fiber = require('fibers');


const asyncForEach = async (array, callback) => {
  //console.log('asyncForEach: enter');
  for (let index = 0; index < array.length; index++) {
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

const runAsync = (fn, ...args) => {
  return setTimeout(() => fn(...args) , 0);
};

const asyncSetInterval = async (ms) => new Promise(resolve => setIngerval(resolve, ms));

const asyncSetTimeout = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const setTimeoutAsPromised = asyncSetTimeout;

const wrapIntoFiber = (fn, ...args) => Fiber( async () => await fn(...args) ).run();


module.exports = {
  asyncForEach,
  asyncMap,

  runAsync,

  asyncSetInterval,
  asyncSetTimeout,
  setTimeoutAsPromised,

  wrapIntoFiber
};

