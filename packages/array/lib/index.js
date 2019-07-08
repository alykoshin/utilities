'use strict';

const _ = require('lodash');


const sanitizeArray = (array) => Array.isArray(array) ? array : [];


function peek(array, offset) {
  if (typeof offset !== 'number') offset = 0;

  return array[ array.length - 1 - offset ];
}


const arrayOne = (array, options={}) => {
  if (array.length < 1) throw new Error('Element not found');
  if ( options.strict !== false &&
    array.length > 1) throw new Error('More than one element found');
  return array[0];
};


const findMatched = (array, match) => {
  if (typeof array === 'undefined') array = [];
  array = Array.isArray(array) ? array : [array];
  return array.filter(_.matches(match));
};


const removeAt = (array, index) => {
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};


const removeElement = (array, element) => {
  const index = array.indexOf(element);
  return removeAt(array, index);
};


const removeMatched = (array, filter) => {
  const elementsToDelete = findMatched(array, filter);
  elementsToDelete.forEach( el => _.pull(array, el) );
  return elementsToDelete.length;
};




module.exports = {
  sanitizeArray,

  peek,

  arrayOne,
  findMatched,

  removeAt,
  removeElement,
  removeMatched,
};
