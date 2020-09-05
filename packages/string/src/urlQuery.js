/**
 * This is replacement for npm module query-string
 */

/**
 * Based upon
 * Parse query string in JavaScript [duplicate]
 * https://stackoverflow.com/a/13896633/2774010
 *
 * Accepts query strings with and without starting '?'
 *
 * @param str
 * @returns {{}}
 */
const parse = (str) => {
  if(typeof str != "string" || str.length == 0) return {};
  if (str[0] === '?') str = str.substring(1);
  var s = str.split("&");
  var s_length = s.length;
  var bit, query = {}, first, second;
  for(var i = 0; i < s_length; i++)
  {
    bit = s[i].split("=");
    first = decodeURIComponent(bit[0]);
    if(first.length == 0) continue;
    second = decodeURIComponent(bit[1]);
    if(typeof query[first] == "undefined") query[first] = second;
    else if(query[first] instanceof Array) query[first].push(second);
    else query[first] = [query[first], second];
  }
  return query;
};

/**
 * Query-string encoding of a Javascript Object
 * https://stackoverflow.com/a/1714899/2774010
 *
 * @param {Object} obj
 * @param {string} prefix
 * @returns {string}
 */
const stringify = (obj, prefix) => {
  var str = [],
      p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
      str.push((v !== null && typeof v === "object") ?
               stringify(v, k) :
               encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
};


/**
 * Get query parameter by name
 *
 * Based upon https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
 *
 * @param {string} parameterName
 * @returns {string|null}
 */
function _findGetParameter(parameterName) {
  if (typeof location === 'undefined') throw new Error('This function may be run in browser only');
  let result = null,
      tmp = [];
  const items = location.search.substr(1).split("&");
  for (let index = 0; index < items.length; index++) {
    tmp = items[index].split("=");
    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  }
  return result;
}

/**
 *
  */

/**
 * alternative way to get query parameter value by name
 *
 * @param {string} name
 * @returns {string|undefined}
 */
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

module.exports = {
  parse,
  stringify,

  _findGetParameter,
  getParameterByName,
};
