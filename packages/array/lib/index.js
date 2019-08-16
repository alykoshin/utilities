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

//ТЕСТ НЕ ПРОХОДИТ ВЕРНУТЬСЯ!!!??
const getOne = (array, options={}) => {
  if (array.length < 1) throw new Error('Element not found');
  console.log('options.throw', options.throw);
  console.log('array', array);

  if ( options.throw !== false &&
    array.length > 1) throw new Error('More than one element found');
  return array[0];
};

const findMatched = (array, match) => {
  array = sanitize(array);
  // console.log('match', match);
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
  // console.log('array', array);
  // console.log('elementsToDelete.length', elementsToDelete.length);
  // console.log('elementsToDelete', elementsToDelete);
  elementsToDelete.forEach( el => _.pull(array, el) );
  // console.log('array', array);

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
