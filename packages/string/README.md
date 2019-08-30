[![npm version](https://badge.fury.io/js/@utilities/string.svg)](http://badge.fury.io/js/@utilities/string)
[![Build Status](https://travis-ci.org/alykoshin/@utilities/string.svg)](https://travis-ci.org/alykoshin/@utilities/string)
[![Coverage Status](https://coveralls.io/repos/alykoshin/@utilities/string/badge.svg?branch=master&service=github)](https://coveralls.io/github/alykoshin/@utilities/string?branch=master)
[![Code Climate](https://codeclimate.com/github/alykoshin/@utilities/string/badges/gpa.svg)](https://codeclimate.com/github/alykoshin/@utilities/string)
[![Inch CI](https://inch-ci.org/github/alykoshin/@utilities/string.svg?branch=master)](https://inch-ci.org/github/alykoshin/@utilities/string)

[![Dependency Status](https://david-dm.org/alykoshin/@utilities/string/status.svg)](https://david-dm.org/alykoshin/@utilities/string#info=dependencies)
[![devDependency Status](https://david-dm.org/alykoshin/@utilities/string/dev-status.svg)](https://david-dm.org/alykoshin/@utilities/string#info=devDependencies)

[![Known Vulnerabilities](https://snyk.io/test/github/alykoshin/@utilities/string/badge.svg)](https://snyk.io/test/github/alykoshin/@utilities/string)


# @utilities/string

Set of misc utilities for strings


If you have different needs regarding the functionality, please add a [feature request](https://github.com/alykoshin/@utilities/string/issues).


## Installation

```sh
npm install --save @utilities/string
```

## Usage

#### Function lpad()
Returns: a string filled with characters to the specified length.
 
Arguments: 
* s - string;
* size - string length;
* c - character that is used to fill the string to size.

Example:
```
const lpad = ('12345', 10, '0') => {
  c = c || ' ';
  if (c.length > 1)  console.warn('lpad expects one padding character');
  while (s.length < size) s = c + s;
  return s;
};
```
Will print:
```
'0000012345'
```

#### Function repeat() 
Returns: <[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)>  a string filled with characters to the specified length.  

Arguments:
* c - character that is used to fill the string to size;
* len - string length.


Example:
```
const repeat = (9, 10) => {
  return lpad('', len, c);
};

```
Will print:
```
'9999912345'
```

#### Function lpadZeros()

## Credits
[Alexander](https://github.com/alykoshin/)


# Links to package pages:

[github.com](https://github.com/alykoshin/@utilities/string) &nbsp; [npmjs.com](https://www.npmjs.com/package/@utilities/string) &nbsp; [travis-ci.org](https://travis-ci.org/alykoshin/@utilities/string) &nbsp; [coveralls.io](https://coveralls.io/github/alykoshin/@utilities/string) &nbsp; [inch-ci.org](https://inch-ci.org/github/alykoshin/@utilities/string)


## License

MIT
