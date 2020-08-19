const fs = require('fs');
const path = require('path');

const debug = require('debug')('@utilities/fs');


const ADD_PATH_VALUES = ['joinBase', 'joinSub', 'resolve'];

/**
 *
 * @param {string} baseDir
 * @param {object} [filter]={}
 * @param {boolean} [filter.isFile]=false
 * @param {boolean} [filter.isDir]=false
 * @param {boolean} [filter.isDirectory]=false
 * @param {object} [options]={}
 * @param {''|'joinBase'|'joinSub'|'resolve'} [options.addPath] = ''
 * @param {boolean|string} [options.nameOnly] = false
 * @param {boolean} [options.recursive] = false
 * @param {string} [options._subDir] = ''
 * @returns {*}
 * @private
 */
const _dirList = (baseDir, filter={}, options={}) => {
  const { addPath='', nameOnly=true, recursive=false, _subDir='' } = options;
  if (recursive && ADD_PATH_VALUES.indexOf(addPath)<0) throw new Error(`When recursive=true, addPath must be set to one of following: [${ADD_PATH_VALUES.join(',')}], found: "${addPath}" instead`);

  debug(`_dirList: baseDir: "${baseDir}", _subDir: "${_subDir}", recursive: ${recursive}`);

  const entriesInThisDir = fs
    .readdirSync(path.join(baseDir, _subDir), { withFileTypes: true });

  let filesInThisDir = entriesInThisDir
    .filter(dirent => {
      // if filter fields are set
      if (typeof filter.isFile !== 'undefined' || typeof filter.isDir !== 'undefined' || typeof filter.isDirectory !== 'undefined') {
        return (
          // if isFile
          (filter.isFile && dirent.isFile()) ||
          // if isDir or isDirectory
          ((filter.isDir || filter.isDirectory) && dirent.isDirectory())
        )

      } else {
        // filter fields are not set, return everything
        return true;
      }

    })
    .map(dirent => {
      //dirent._name    = dirent.name;
      if      (addPath==='joinBase') dirent.pathname = path.join(    baseDir, _subDir, dirent.name );
      else if (addPath==='joinSub')  dirent.pathname = path.join(             _subDir, dirent.name );
      else if (addPath==='resolve')  dirent.pathname = path.resolve( baseDir, _subDir, dirent.name );
      else if (addPath) throw new Error(`addPath must be empty or set to one of following: [${ADD_PATH_VALUES.join(',')}], found: "${addPath}" instead`);
      else dirent.pathname = dirent.name;
      //
      const _dirent = _.pick(dirent, ['name', 'pathname']);
      //return nameOnly ? dirent.pathname : dirent;
      if (typeof nameOnly === 'string'){

        const stats = fs.statSync( path.resolve( baseDir, _subDir, dirent.name ));

        if (nameOnly === 'with-stats') {

          //try {

          //const fileSizeInBytes = stats[ "size" ];
          //return {
          //  name: d.name,
          //  size: fileSizeInBytes,
          //}
          return {
            ..._dirent,
            ...stats,
            //isBlockDevice:     dirent.isBlockDevice(),
            //isCharacterDevice: dirent.isCharacterDevice(),
            //isDirectory:       dirent.isDirectory(),
            //isFIFO:            dirent.isFIFO(),
            //isFile:            dirent.isFile(),
            //isSocket:          dirent.isSocket(),
            //isSymbolicLink:    dirent.isSymbolicLink(),
            //name:              dirent.name,
          };
          //} catch(e) {
          //  console.log('ERROR: listFiles():', e);
          //  return reject(e);
          //}

          //return {
          //  dirent,
          //  stats,
          //}

        } else if (nameOnly === 'with-stats-resolve') {

          return {
            ..._dirent,
            ...stats,
            //isBlockDevice:     dirent.isBlockDevice(),
            //isCharacterDevice: dirent.isCharacterDevice(),
            //isDirectory:       dirent.isDirectory(),
            //isFIFO:            dirent.isFIFO(),
            //isFile:            dirent.isFile(),
            //isSocket:          dirent.isSocket(),
            //isSymbolicLink:    dirent.isSymbolicLink(),
            isBlockDevice:     stats.isBlockDevice(),
            isCharacterDevice: stats.isCharacterDevice(),
            isDirectory:       stats.isDirectory(),
            isFIFO:            stats.isFIFO(),
            isFile:            stats.isFile(),
            isSocket:          stats.isSocket(),
            isSymbolicLink:    stats.isSymbolicLink(),
            //name:              dirent.name,
          };
        };

      } else {
        return nameOnly ? dirent.pathname : dirent;
      }
    });
  // console.log('filesInThisDir', filesInThisDir);

  return recursive
         ? entriesInThisDir
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
  _dirList,
  dirListFilenames,
  dirListDirnames,
};
