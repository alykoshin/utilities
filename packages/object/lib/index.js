const { get, set, reduce } = require('lodash');

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
 *  renameKeysDeep ???
 *
 **/
function remap(o, map) {
  return reduce(map, function(result, mapValue, mapKey) {
    const fromKey = mapKey;
    const toKey   = mapValue;
    const value = get(o, fromKey);
    if (typeof value !== 'undefined') set(result, toKey, value );
    return result;
  }, {});
}


module.exports = {
  remap,
};
