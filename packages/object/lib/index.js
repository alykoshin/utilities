const _ = require('lodash');

/**
 * Allows to pick keys and map their names from one object to another
 * according to the mapping { 'fromKeyDeep': 'toKeyDeep', ... }
 *
 * Example
 * const source = { origin: { lat:1, lng:2 } };
 * const mapping = { 'origin.lat': 'lat', 'origin.lng': 'lng' };
 * // const options = { defaultCopy: true }; // not implemented yet
 *
 * result = remap(source, mapping)
 *
 * // { lat: 1, lng: 2 }
 *
 */

/**
 *
 * `remap(source, mapping, options)`
 * - returns new object
 * - does not mutates object
 *
 * Parameres:
 * - `source` - source object to remap
 * - `mapping` - object defining property names to be remapped (renamed)
 * - `options`:
 * -- `inverted` - use mapping in reverse form: { toKey: fromKey }
 * -- ~~`defaultCopy`~~ - not implemented, may be used to copy other properties,
 * remapping the properties defined in `mapping` parameter
 *
 **/
function remap(o, map, options) {
  options = options || {};
  if (options.inverted === true) map = _.invert(map);
  return _.reduce(map, function(result, mapValue, mapKey) {
    const fromKey = mapKey;
    const toKey   = mapValue;
    const value = _.get(o, fromKey);
    if (typeof value !== 'undefined') _.set(result, toKey, value );
    return result;
  }, {});
}

// We need to remap object containing multilevel arrays
// Below some approaches to this task

const matchKey = (key) => {
  //const re = /^\$(\d*)$/;
  const re = /^\$(:?(\d*)|(\[\d+\]))$/;
  return key.match(re);
};

const matchKeyToIdx = (key, indexes) => {
  const match = matchKey(key);
  if (match) {
    if (typeof match[ 2 ] !== 'undefined') {
      const i = match[ 2 ] ? match[ 2 ] : 0;
      return indexes[ i ];
    } else if (typeof match[ 3 ] !== 'undefined') {
      const i = match[ 3 ] ? match[ 3 ] : 0;
      return i;
    } else {
      throw new Error('Invalid key definition: "'+key+'"');
    }
  }
  return key;
};

//

const getPartial = (o, keys, value, indexes) => {
  //console.log('setPartial:enter: o:', o, ', value:', value, ', keys:', keys);
  const currKey = keys[0];
  const nextKeys = keys.slice(1);

  const partialKey = matchKeyToIdx(currKey, indexes);
  //if (typeof partialKey === 'number') { // array
  //  o = o || [];
  //} else {
  //  o = o || {};
  //}

  if (keys.length === 0) {
    return o[ partialKey ];
  } else {
    getPartial(o, nextKeys, value, indexes);
  }
  //console.log('partialOut:', partialOut);
  return undefined;
};

const getExtended = (o, path, defaultValue, indexes) => {
  return {
    value:   getPartial(o, path, defaultValue, indexes),
    indexes: [],
  };
};

//

const setPartial = (o, keys, value, indexes) => {
  //console.log('setPartial:enter: o:', o, ', value:', value, ', keys:', keys);
  const currKey = keys[0];
  const nextKeys = keys.slice(1);

  const partialKey = matchKeyToIdx(currKey, indexes);
  if (typeof partialKey === 'number') { // array
    o = o || [];
  } else {
    o = o || {};
  }

  if (keys.length > 1) {
    o[ partialKey ] = setPartial(o[partialKey], nextKeys, value, indexes);
  } else {
    o[ partialKey ] = value;
  }
  //console.log('partialOut:', partialOut);
  return o;
};

const setExtended = (obj, path, value, indexes) => {
  const keys = path.split('.');
  setPartial(obj, keys, value, indexes);
  return obj;
};

//const debug = (a) => console.log('setExtended',JSON.stringify(a));
//debug(setExtended({ a: {b:1}}, 'a.b', 'test_value', [] ));
//debug(setExtended({ a: {b:1}}, 'a.c', 'test_value', [] ));
//debug(setExtended({ a: {b:1}}, 'b.c', 'test_value', [] ));
//debug(setExtended({ a: {b:1}}, 'b.$.c', 'test_value', [0] ));
//debug(setExtended({ a: {b:1}, b: [{a:1},1,2,3]}, 'b.$0.c.$1', 'test_value', [0,0] ));


const remap_new = (o, map) => {
  //_.forOwn(map, (toKey, frKey, object) => {
  //  // convert dot-separated string into array
  //  // expecting no dots inside property names
  //  const path = frKey.split('.');
  //  const topKey = path.shift();
  //  const
  //  //path.forEach(subKey => {
  //  //  o[subKey]
  //  //})
  //});
  return _.reduce(map, function(result, mapValue, mapKey) {
    const fromKey = mapKey;
    const toKey   = mapValue;
    const {value, indexes} = getExtended(o, fromKey, indexes);
    if (typeof value !== 'undefined') setExtended(result, toKey, value, indexes);
    return result;
  }, {});
};

//console.log(remap({ a: {b:1}}, { 'a.b': 'c.d' } ));



module.exports = {
  remap,
};
