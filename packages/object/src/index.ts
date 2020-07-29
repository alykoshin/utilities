const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const mkdirp = require('mkdirp');

const debug = require('debug')('@utilities/object');

const {hasElement} = require('@utilities/array');
const {replaceEolWithBr} = require('@utilities/string');
const {loadTextSync, saveTextSync, dirListFilenames, dirListDirnames } = require('@utilities/fs');

export * from './chainableNode';

export const isObject = (value) => {
  const type = typeof value;
  return !Array.isArray(value) &&
    value != null &&
    (type === 'object' || type === 'function');

};

export const sanitize = (object) => {
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

export function remap1_({ source, target, sourceKey, targetKey, transform }) {

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
export function remap(o, map, options) {
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

  const value = typeof sourceKey !== 'undefined'
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


export function rename(o, map, options) {
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

export const matchKey = (key) => {
  //const re = /^\$(\d*)$/;
  const re =  /^\$(?:(\d*)|(\[\d+\]))$/;
  return key.match(re);
};

export const matchKeyToIdx = (key) => {
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

  const partialKey = matchKeyToIdx(currKey/*, indexes*/);
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

  const partialKey = matchKeyToIdx(currKey/*, indexes*/);
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


//const remap_new = (o, map) => {
//  //_.forOwn(map, (toKey, frKey, object) => {
//  //  // convert dot-separated string into array
//  //  // expecting no dots inside property names
//  //  const path = frKey.split('.');
//  //  const topKey = path.shift();
//  //  const
//  //  //path.forEach(subKey => {
//  //  //  o[subKey]
//  //  //})
//  //});
//  return _.reduce(map, function(result, mapValue, mapKey) {
//    const fromKey = mapKey;
//    const toKey   = mapValue;
//    const {value, indexes} = getExtended(o, fromKey, indexes, undefined);
//    if (typeof value !== 'undefined') setExtended(result, toKey, value, indexes);
//    return result;
//  }, {});
//};

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


interface IsEqualPartialOptions {
  pick?
  omit?
}

export const isEqualPartial = (o1, o2, options: IsEqualPartialOptions = {}) => {
  const { pick, omit } = options;
  if (pick && omit) throw new Error('Only one of pick,omit values allowed');
  let partials = [o1,o2];
  if (pick) partials = partials.map(p => _.pick(p,pick));
  if (omit) partials = partials.map(p => _.omit(p, omit));
  console.log('isEqualPartial: partials:',partials);
  return _.isEqual(...partials);
};


interface JsonParseOptions {
  validateJson?: boolean
}

export const jsonParse = (s, options: JsonParseOptions={}) => {
  const { validateJson = true } = options;
  try {
    return JSON.parse(s);
  } catch (e) {
    if (validateJson) throw e;
    return {};
  }
};


export interface JsonStringifyOptions {
  pretty?: boolean
}

export const jsonStringify = (o, options: JsonStringifyOptions={}) => {
  const { pretty=true } = options;
  return JSON.stringify(o, null, pretty ? 2 : 0);
};

export interface LoadJsonSyncOptions extends JsonParseOptions {
  mustExist?: boolean
}

export const loadJsonSync = (pathname, options: LoadJsonSyncOptions={}) => {
  const { mustExist=true } = options;
  const s = loadTextSync(pathname, {mustExist});
  return jsonParse(s, options);
};


export interface LoadJsonDirSyncOptions {
  recursive?: boolean
  prefix?:    string
  delimiter?: string
  extname?:   string
}

export const loadJsonDirSync = (dir, options: LoadJsonDirSyncOptions={}) => {
  const {recursive = true, prefix = '', delimiter = '.', extname=''/*'.json'*/ } = options;
  let result = [];

  const files = dirListFilenames(dir, {recursive, addPath:'joinSub'})
    .filter(filename => !extname || path.extname(filename) === extname);
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


export interface SaveJsonSyncOptions extends JsonStringifyOptions {
  sizeThreshold?: number
}

export const saveJsonSync = (pathname, o, options: SaveJsonSyncOptions={}) => {

  if (typeof o !== 'object') throw new Error('saveJsonSync: second argument must be object to save');
  const allowedTypes = [ 'string', 'number', 'boolean', 'object' ];
  if (!hasElement(allowedTypes, typeof o)) throw new Error(`saveJsonSync: typeof second argument must be one of following: [${allowedTypes.join(', ')}]`);

  const s = jsonStringify(o, options);
  const { sizeThreshold } = options;
  if (typeof sizeThreshold === 'number' && s.length > sizeThreshold) console.warn(`File size is greater than sizeThreshold=${sizeThreshold}, file size=${s.length}`);
  return saveTextSync(pathname, s, options);
};


export interface JsonToHtmlOptions extends JsonStringifyOptions {
  br?: boolean
  code?: boolean
}

export const jsonToHtml = (json, options: JsonToHtmlOptions={}) => {
  let s = jsonStringify(json, options);
  if (options.br   !== false) s = replaceEolWithBr(s);
  if (options.code !== false) s = `<code>${s}</code>`;
  return s;
};


export const _assignUniqOne = (toObject, name, value) => {
  if (toObject[ name ]) throw new Error(`toObject already has property named "${name}"`);
  toObject[ name ] = value;
};

export const assignUniq = (toObject, ...fromObjects) => {
  //
  fromObjects.forEach(from => {
    for (let name in from) if (from.hasOwnProperty(name)) {
      _assignUniqOne(toObject, name, from[ name ]);
    }
  });
  return toObject;
  //
};


export interface GetMethodsOptions {
  depth?: number
  excludeConstructor?: boolean
}

export const getMethods = (obj, options: GetMethodsOptions={}) => {
  const {depth=-1,excludeConstructor=false} = options;
  //
  // Based on https://stackoverflow.com/a/31055217/2774010
  //
  let props = [];
  let i = 0;
  let o = obj;
  do {
    props = props.concat(Object.getOwnPropertyNames(o));
    //console.log('getMethods: i:', i, 'props', props, ', depth:', depth);
  } while (
    (o = Object.getPrototypeOf(o)) &&
    (depth < 0 || i++ < depth)
    );

  //console.log('getMethods: props:', props);

  const result = props
    //.sort()
    .filter((e, i, arr) => {
      //
      // this changes the order of methods, so'll sort later though less effective:
      //return (e !== arr[i+1] && typeof obj[e] === 'function');
      //
      return (typeof obj[e] === 'function');
    })
    .filter((e,i,arr) => {
      return !(excludeConstructor && e==='constructor');
    })
  ;
  return _.uniq(result);

  //console.log('result', result);

  //const keys          = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));
  //const actualMethods = keys.filter(k => typeof obj[ k ] === 'function');
};


export const getOwnMethods   = (obj) => getMethods(obj, { depth: 0 });


export const getClassMethods = (obj) => getMethods(obj, { depth: 1 });


export * from './basicObjects';

export * from './timers';
export * from './watchdogs';


export default {
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

  getMethods,
  getOwnMethods,
  getClassMethods,

};
