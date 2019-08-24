'use strict';

const _ = require('lodash');



const sanitize = (array) => {
  if (typeof array === 'undefined') array = [];
  if (!Array.isArray(array)) array = [array];
  return array;
};


const peek = (array, offset) => {
  if (typeof offset !== 'number') offset = 0;

  return array[ array.length - 1 - offset ];
};


const indexOf = (array, el) => {
  return array.indexOf(el);
};


const hasElement = (array, el) => indexOf(array, el) >= 0;


const getOne = (array, options={}) => {
  if (array.length < 1) throw new Error('Element not found');
  if ( options.throw !== true &&
    array.length > 1) throw new Error('More than one element found');
  return array[0];
};


const findMatched = (array, match) => {
  array = sanitize(array);
  // return _.filter(array,_.matches(match));
  return array.filter(_.matches(match));
};


const removeAt = (array, index) => {
  array = sanitize(array);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};


const removeElement = (array, element) => {
  array = sanitize(array);
  const index = array.indexOf(element);
  return removeAt(array, index);
};


const removeMatched = (array, filter) => {
  const elementsToDelete = findMatched(array, filter);
  elementsToDelete.forEach( el => _.pull(array, el) );
  return elementsToDelete.length;
};


const compareArraysNonOrdered = (arr1, arr2, {filter,compare}) => {
  if (typeof compare !== 'function') throw new Error('Expecting compare function');
  if (filter) {
    arr1 = arr1.filter(_.matches(filter));
    arr2 = arr2.filter(_.matches(filter));
  }
  const len1 = arr1.length;
  const len2 = arr2.length;
  //logger.debug('len1:', len1, ', len2:', len2);
  if (len1 !== len2) return false;

  //logger.debug('compareArraysNonOrdered:', arr1.length, arr2.length);
  //logger.debug('compareArraysNonOrdered:', JSON.stringify(arr1), JSON.stringify(arr2));

  const intersect = _.intersectionWith(
    arr1,
    arr2,
    compare
  );
  //logger.debug('intersect:', intersect);
  //logger.debug('intersect.length:', intersect.length);
  return intersect.length === len1;
};


module.exports = {
  sanitize,
  sanitizeArray: sanitize,

  peek,

  indexOf,
  hasElement,
  getOne,
  arrayOne: getOne,
  findMatched,

  removeAt,
  removeElement,
  removeMatched,

  compareArraysNonOrdered,
};
