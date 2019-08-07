const fs = require('fs');
const path = require('path');
const debug = require('debug')('@utilities/fs');


const _dirList = (dir, filter={}, {addPath='',nameOnly=true}={}) => {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(dirent => (
      (filter.isFile && dirent.isFile()) ||
      ((filter.isDir || filter.isDirectory) && dirent.isDirectory())
    ))
    .map(dirent => {
      if (addPath==='join') dirent.name = path.join( dir, dirent.name );
      else if (addPath==='resolve') dirent.name = path.resolve( dir, dirent.name );
      return nameOnly ? dirent.name : dirent;
    })
    ;
}

const dirListFilenames = (dir, options) => {
  return _dirList(dir, { isFile:true }, options);
}

const dirListDirnames = (dir, options) => {
  return dirList(dir, { isFile:true }, options);
}

const _listLocalFiles = (localDir) => {
  let list = dirList(localDir, { resolvePath});
  list = list
    .filter(dirent => dirent.isFile())
    .map(dirent => path.join( localDir, dirent.name ))
  ;
  debug('_listLocalFiles:', list);
  return list;
}



module.exports = {
  dirListFilenames,
  dirListDirnames,
}
