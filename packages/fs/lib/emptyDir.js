const fs = require('fs');
const path = require('path');


//const emptyDir = (dir, callback) => {
//  return fs.readdir(directory, (err, files) => {
//    if (err) callback(err);
//
//    for (const file of files) {
//      fs.unlink(path.join(directory, file), err => {
//        if (err) throw err;
//      });
//    }
//  });
//};


const emptyDirSync = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    fs.unlinkSync(path.join(dir, file));
  }
};


module.exports = {
  emptyDirSync,
};
