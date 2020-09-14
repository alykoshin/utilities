// The error codes from and including -32768 to -32000 are reserved for pre-defined errors. Any code within this range, but not defined explicitly below is reserved for future use. The error codes are nearly the same as those suggested for XML-RPC at the following url: http://xmlrpc-epi.sourceforge.net/specs/rfc.fault_codes.php
//
//   code	message	meaning
//
// const CODES = {
//   [PARSE_ERROR]:      -32700,
//   [INVALID_REQUEST]:  -32600,
//   [METHOD_NOT_FOUND]: -32601,
//   [INVALID_PARAMS]:   -32602,
//   [INTERNAL_ERROR]:   -32603,
// }

// -32700 - Parse error - Invalid JSON was received by the server.
//   An error occurred on the server while parsing the JSON text.
export const PARSE_ERROR_CODE      = -32700;

// -32600 - Invalid Request - The JSON sent is not a valid Request object.
export const INVALID_REQUEST_CODE  = -32600;

// -32601 - Method not found - The method does not exist / is not available.
export const METHOD_NOT_FOUND_CODE = -32601;
export const METHOD_NOT_AVAILABLE_CODE = -32601;

// -32602 - Invalid params - Invalid method parameter(s).
export const INVALID_PARAMS_CODE   = -32602;

// -32603 - Internal error - Internal JSON-RPC error.
export const INTERNAL_ERROR_CODE   = -32603;

// -32000 to -32099 - Server error - Reserved for implementation-defined server-errors.
export const SERVER_ERROR_CODE_00  = -32000;
export const SERVER_ERROR_CODE_99  = -32099;
//   The remainder of the space is available for application defined errors.

export enum ERROR {
  PARSE_ERROR      = -32700,
  INVALID_REQUEST  = -32600,
  METHOD_NOT_FOUND = -32601,
  // METHOD_NOT_AVAILABLE_CODE = -32601,
  INVALID_PARAMS   = -32602,
  INTERNAL_ERROR   = -32603,
}

export const ERROR_CODES = {
  [PARSE_ERROR_CODE]:      'Parse error',
  [INVALID_REQUEST_CODE]:  'Invalid Request',
  [METHOD_NOT_FOUND_CODE]: 'The method does not exist / is not available',
  // [METHOD_NOT_AVAILABLE_CODE]: 'The method does not exist / is not available',
  [INVALID_PARAMS_CODE]:   'Invalid params',
  [INTERNAL_ERROR_CODE]:   'Internal error',
}
