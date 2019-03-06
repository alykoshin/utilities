/**
 * This is replacement for npm module query-string
 */

/**
 *
 * Based on
 * Parse query string in JavaScript [duplicate]
 * https://stackoverflow.com/a/13896633/2774010
 *
 * Accepts query strings with and without starting '?'
 *
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
 *
 * Query-string encoding of a Javascript Object
 * https://stackoverflow.com/a/1714899/2774010
 *
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


module.exports = {
  parse,
  stringify,
};
