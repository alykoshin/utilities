const fs = require('fs');
const path = require('path');

const debug = require('debug')('@utilities/fs');


const ADD_PATH_VALUES = ['joinBase', 'joinSub', 'resolve'];

const _dirList = (baseDir, filter={}, options={}) => {
  const { addPath='', nameOnly=true, recursive=false, _subDir='' } = options;
  if (recursive && ADD_PATH_VALUES.indexOf(addPath)<0) throw new Error(`When recursive=true, addPath must be set to one of following: [${ADD_PATH_VALUES.join(',')}], found: "${addPath}" instead`);

  debug(`_dirList: baseDir: "${baseDir}", _subDir: "${_subDir}", recursive: ${recursive}`);

  const fullList = fs
    .readdirSync(path.join(baseDir, _subDir), { withFileTypes: true });

  let filesInThisDir = fullList
    .filter(dirent => (
      (filter.isFile && dirent.isFile()) ||
      ((filter.isDir || filter.isDirectory) && dirent.isDirectory())
    ))
    .map(dirent => {
      //dirent._name    = dirent.name;
      dirent.pathname = dirent.name;
      if      (addPath==='joinBase') dirent.pathname = path.join(    baseDir, _subDir, dirent.name );
      else if (addPath==='joinSub')  dirent.pathname = path.join(             _subDir, dirent.name );
      else if (addPath==='resolve')  dirent.pathname = path.resolve( baseDir, _subDir, dirent.name );
      else if (addPath) throw new Error(`addPath must be empty or set to one of following: [${ADD_PATH_VALUES.join(',')}], found: "${addPath}" instead`);
      return nameOnly ? dirent.pathname : dirent;
    });
  console.log('filesInThisDir', filesInThisDir);

  return recursive
    ? fullList
      .filter(dirent => dirent.isDirectory())
      .reduce((accumulator_allFiles, currentValue_dirent) => {
        const subdir = currentValue_dirent.name;
        return accumulator_allFiles.concat(
          _dirList(baseDir, filter, {...options, _subDir: path.join(_subDir, subdir)})
        );
      }, filesInThisDir)
    : filesInThisDir;
};

const dirListFilenames = (dir, options) => {
  return _dirList(dir, { isFile:true }, options);
};

const dirListDirnames = (dir, options) => {
  return _dirList(dir, { isDir:true }, options);
};

// const _listLocalFiles = (localDir) => {
//   let list = dirList(localDir, { resolvePath});
//   list = list
//     .filter(dirent => dirent.isFile())
//     .map(dirent => path.join( localDir, dirent.name ));
//   debug('_listLocalFiles:', list);
//   return list;
// };



module.exports = {
  dirListFilenames,
  dirListDirnames,
};
