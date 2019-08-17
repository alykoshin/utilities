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
};
