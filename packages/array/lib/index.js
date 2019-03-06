'use strict';


function peek(array, offset) {
  if (typeof offset !== 'number') offset = 0;

  return array[ array.length - 1 - offset ];
}


module.exports = {
  peek,
};
