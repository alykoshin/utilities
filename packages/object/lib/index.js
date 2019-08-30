'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const mkdirp = require('mkdirp');

const debug = require('debug')('@utilities/object');

const {replaceEolWithBr} = require('@utilities/string');
const {loadTextSync, saveTextSync, dirListFilenames, dirListDirnames } = require('@utilities/fs');



const isObject = (value) => {
  const type = typeof value;
  return !Array.isArray(value) &&
    value != null &&
    (type === 'object' || type === 'function');

};

const sanitize = (object) => {
  //if (typeof object === 'undefined' || object === null ) object = {}
  if ( ! isObject(object) ) object = {};
  return object;
};

/**
 *
 * @param source
 * @param target
 * @param sourceKey
 * @param targetKey
 * @param transform
 * @returns {*}
 * @private
 */

function remap1_({ source, target, sourceKey, targetKey, transform }) {

  const sourceValue = _.get(source, sourceKey);
  const targetValue = _.get(target, targetKey);

  const finalValue = transform
                     ? transform({ source, target, sourceKey, sourceValue, targetKey, targetValue, transform })
                     : sourceValue;

  //console.log(
  //  'sourceKey:',   sourceKey,   ', targetKey:',   targetKey,
  //  'sourceValue:', sourceValue, ', targetValue:', targetValue,
  //  'finalValue:',  finalValue,
  //);

  if (typeof finalValue === 'undefined') {
    _.unset(target, targetKey);

  } else {
    _.set(target, targetKey, finalValue);
  }

  return target;
}


/**
 *
 * @param o
 * @param map
 * @param options
 * @returns {*}
 *
 * Allows to pick keys and map their names from one object to another
 * according to the mapping { 'fromKeyDeep': 'toKeyDeep', ... }
 *
 * `remap(source, mapping, options)`
 * - returns new object
 * - does not mutates object
 *
 * Parameters:
 * ----------
 * - `source`  - source object to remap
 * - `mapping` - object defining property names to be remapped (renamed)
 * - `options`:
 * -- `inverted` - use mapping in reverse form: { toKey: fromKey }
 * -- ~~`defaultCopy`~~ - not implemented, may be used to copy other properties,
 * remapping the properties defined in `mapping` parameter
 *
 * Example:
 * -------
 * const source = { origin: { lat:1, lng:2 } };
 * const mapping = {
 *   // targetKey: sourceKey,
 *   'lat': 'origin.lat',
 *   'lng': 'origin.lng',
 * };
 * // const options = { defaultCopy: true }; // not implemented yet
 *
 * result = remap(source, mapping)
 *
 * // { lat: 1, lng: 2 }
 *
 **/


/**
 *
 */
function remap(o, map, options) {
  options = options || {};
  if (options.inverted === true) map = _.invert(map);
  //console.log('remap: o:', o);

  const result = _.reduce(map, function(result, mapValue, mapKey) {

    const transform = typeof mapValue === 'function'
                      ? ({ source, target, sourceKey, sourceValue, targetKey, targetValue, transform }) => sourceKey(source, targetKey)
                      : null;

    return remap1_({ source:o, target:result, sourceKey:mapValue, targetKey:mapKey, transform });
  }, {});

  //console.log('remap: result:', result);
  return result;
}


/*
function remap_(o, map, options) {
  options = options || {};
  if (options.inverted === true) map = _.invert(map);
  return _.reduce(map, function(result, mapValue, mapKey) {
    const targetKey = mapKey;
    const sourceKey = mapValue;

    const value = typeof sourceKey === 'function'
                  ? sourceKey(o, targetKey)
                  : _.get(o, sourceKey);

    if (typeof value === 'undefined') {
      _.unset(result, targetKey);

    } else {
      _.set(result, targetKey, value );
    }

    return result;
  }, {});
}
*/


function _rename1(o, map, mapKey, options) {
  let mapValue = _.get(map, mapKey);

  const targetKey = mapKey;
  let   sourceKey = mapValue;
  //console.log('1 targetKey:', targetKey, ', sourceKey:', sourceKey, ', typeof sourceKey:', typeof sourceKey);

  if (typeof sourceKey === 'function') sourceKey = sourceKey(o, targetKey);

  const value = sourceKey !== 'undefined'
                ? _.get(o, sourceKey)
                : undefined;

  //console.log('2 targetKey:', targetKey, ', sourceKey:', sourceKey, ', typeof sourceKey:', typeof sourceKey, ', value:', value);

  if (typeof value !== 'undefined') {
    _.set(o, targetKey, value);
  }

  if (typeof sourceKey !== 'undefined') {
    _.unset(o, sourceKey);
  }

  return o;
}


function rename(o, map, options) {
  options = options || {};
  if (options.inverted === true) map = _.invert(map);
  //console.log('map:', map)
  for (let mapKey in map) {
    // console.log('mapKey:', mapKey);
    //if (_.has(o, mapKey))
    _rename1(o, map, mapKey, options);
  }
  return o;
}


// function renameIn(o, map,  options) {
//   options = options || {};
//   if (options.inverted === true) map = _.invert(map);
//
//   //for (let mapKey in map)
//   _rename1(o, map, mapKey, options); /*mapKey*/
//   return o;
// }


// We need to remap object containing multilevel arrays
// Below some approaches to this task

const matchKey = (key) => {
  //const re = /^\$(\d*)$/;
  const re =  /^\$(?:(\d*)|(\[\d+\]))$/;
  return key.match(re);
};

const matchKeyToIdx = (key) => {
  const match = matchKey(key);
  if (match) {
    if (typeof match[ 2 ] !== 'undefined') {
      const i = match[ 2 ] ? match[ 2 ] : 0;
      return i ;
    } else if (typeof match[ 1 ] !== 'undefined') {
      const i = match[ 1 ] ? match[ 1 ] : 0;
      return i;
    } else {
      throw new Error('Invalid key definition: "'+key+'"');
    }
  }
  return key;
};

/*const matchKeyToIdx = (key,indexes) => {
  const match = matchKey(key);
  if (match) {
    if (typeof match[ 2 ] !== 'undefined') {
      const i = match[ 2 ] ? match[ 2 ] : 0;
      console.log('i:', i);
      return indexes[i];
    } else if (typeof match[ 3] !== 'undefined') {
      const i = match[ 3] ? match[ 3 ] : 0;
      return i;
    } else {
      throw new Error('Invalid key definition: "'+key+'"');
    }
  }
  return key;
};*/
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

/*
const test_map_1 = {
  'start_time':  [ 'start', uberToGoogleTime ],
  'start_time2':  { to: 'start', map: uberToGoogleTime },
  'end_time':    [ uberToGoogleTime, 'end' ],
  'day_of_week': { 'day':   uberToGoogleDayOfWeek },
  'day':         [ 'days', (obj) => [ obj.day ] ],
};

const test_map_2 = {
  'start':  [ 'start_time',     uberToGoogleTime ],
  'end':    [ uberToGoogleTime, 'end_time' ],
  'day':    [ 'day_of_week',    uberToGoogleDayOfWeek ],
  'days':   [ 'day',            (obj) => [ obj.day ] ],
};

const test_map_3 = {
  'start':  { from: 'start_time', map: uberToGoogleTime },
  'end':    [ uberToGoogleTime, 'end_time' ],
  'day':    [ 'day_of_week',    uberToGoogleDayOfWeek ],
  'days':   [ 'day',            (obj) => [ obj.day ] ],
};

const test_map_4 = [
  { to: 'start', from: 'start_time', map: uberToGoogleTime },
  { to: 'end',   map:  uberToGoogleTime, from: 'end_time' },
  //'day':    [ 'day_of_week',    uberToGoogleDayOfWeek ],
  //'days':   [ 'day',            (obj) => [ obj.day ] ],
];
*/

//const test_map_4 = [
//  { to: 'start', from: 'start_time', map: uberToGoogleTime },
//  { to: 'end',   map:  uberToGoogleTime, from: 'end_time' },
//  //'day':    [ 'day_of_week',    uberToGoogleDayOfWeek ],
//  //'days':   [ 'day',            (obj) => [ obj.day ] ],
//];


const isEqualPartial = (o1, o2, {pick,omit} = {}) => {
  if (pick && omit) throw new Error('Only one of pick,omit values allowed');
  let partials = [o1,o2];
  if (pick) partials = partials.map(p => _.pick(p,pick));
  if (omit) partials = partials.map(p => _.omit(p, omit));
  //console.log('isEqualPartial: partials:',partials);
  return _.isEqual(...partials);
};


const jsonParse = (s, options={}) => {
  const { validateJson = true } = options;
  try {
    return JSON.parse(s);
  } catch (e) {
    if (validateJson) throw e;
    return {};
  }
};


const jsonStringify = (o, options={}) => {
  const { pretty=true } = options;
  return JSON.stringify(o, null, pretty ? 2 : 0);
};


const loadJsonSync = (pathname, options={}) => {
  const { mustExist=true } = options;
  const s = loadTextSync(pathname, {mustExist});
  return jsonParse(s, options);
};


const loadJsonDirSync = (dir, options={}) => {
  const {recursive = true, prefix = '', delimiter = '.'} = options;
  let result = [];

  const files = dirListFilenames(dir, {recursive, addPath:'joinSub'});
  debug(`files: ${JSON.stringify(files)}`);

  return files.map(filename => {
    const pathname = path.join(dir, filename);
    debug(`Loading data from "${pathname}"`);

    const data = loadJsonSync(pathname, {mustExist:true});
    debug(`Loaded data from "${pathname}"`);

    const extname  = path.extname(filename);
    const basename = path.basename(filename, extname);
    const dirname  = path.dirname(filename);
    const name = path.join(dirname,basename).split(path.sep).join(delimiter);

    return {
      //  name: addfix(basename, {prefix, delimiter}),
      name,
      data,
      _file: {
        pathname,
        baseDir: dir,
        subDir: dirname,
        basename,
        extname,
      }
    };
  });
/*
[
  {
    name: 'ubereats_with_breakfast',
    data: { sections: [Array] },
    _file: {
      pathname: 'data/in/menu/ubereats_with_breakfast.json',
      baseDir: './data/in/menu',
      subDir: '.',
      basename: 'ubereats_with_breakfast',
      extname: '.json'
    }
  },
  {
    name: 'test.test2.northbridge',
    data: { sections: [Array] },
    _file: {
      pathname: 'data/in/menu/test/test2/northbridge.json',
      baseDir: './data/in/menu',
      subDir: 'test/test2',
      basename: 'northbridge',
      extname: '.json'
    }
  }
]
*/
};



const saveJsonSync = (pathname, o, options={}) => {
  if (typeof o !== 'object') throw new Error('saveJsonSync: second argument must be object to save');
  const s = jsonStringify(o, options);
  const { sizeThreshold } = options;
  if (typeof sizeThreshold === 'number' && s.length > sizeThreshold) console.warn(`File size is greater than sizeThreshold=${sizeThreshold}, file size=${s.length}`);
  return saveTextSync(pathname, s, options);
};


const jsonToHtml = (json, options={}) => {
  let s = jsonStringify(json, options);
  if (options.br   !== false) s = replaceEolWithBr(s);
  if (options.code !== false) s = `<code>${s}</code>`;
  return s;
};


const _assignUniqOne = (toObject, name, value) => {
  if (toObject[ name ]) throw new Error(`toObject already has property named "${name}"`);
  toObject[ name ] = value;
};

const assignUniq = (toObject, ...fromObjects) => {
  //
  fromObjects.forEach(from => {
    for (let name in from) if (from.hasOwnProperty(name)) {
      _assignUniqOne(toObject, name, from[ name ]);
    }
  });
  return toObject;
  //
};





module.exports = {
  sanitize,
  sanitizeObject: sanitize,

  matchKey,
  matchKeyToIdx,

  remap,

  rename,
  // renameIn,

  isEqualPartial,

  assignUniq,

  jsonParse,
  jsonStringify,

  loadJsonSync,
  loadJsonDirSync,
  saveJsonSync,

  jsonToHtml,
};
