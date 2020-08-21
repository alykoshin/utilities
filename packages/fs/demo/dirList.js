const path = require('path');

const { _dirList } = require('../src/dirList');

const p = path.resolve(module.path, './');

console.log( _dirList( p ) );
console.log( _dirList(p, {}, { nameOnly: false }) );
console.log( _dirList(p, {}, { nameOnly: 'with-stats' }) );
console.log( _dirList(p, {}, { nameOnly: 'with-stats-resolve', addPath: 'resolve' }) );
