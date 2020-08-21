const _ = require('lodash');


const newError = (message, errorInfo={}, extMessage) => {
  //const info = Object.assing({}, errorInfo);

  if (extMessage) message += '\r\n' + extMessage;
  let e = new Error(message);
  e = _.extend(e, errorInfo);
  return e;
};

//const newSystemError = (message, errorInfo={}, extMessage) => {
//  return newError(message, errorInfo, extMessage);
//}

const newNoSuchFileError = (errorInfo={}, extMessage) => {
  if (typeof errorInfo === 'string') errorInfo = { path: errorInfo };
  // imitate corresponding SystemError
  const defaultErrorInfo = {
    errno:   -2,
    syscall: 'open',
    code:    'ENOENT',
    //path: path,
  };
  errorInfo = _.defaults(errorInfo, defaultErrorInfo);
  const msg = 'no such file or directory';

  const message = `${errorInfo.code}: ${msg}, ${errorInfo.syscall} '${errorInfo.path}'`;

  return newError(message, errorInfo, extMessage);
};

module.exports = {
  newError,
  newNoSuchFileError,
};
