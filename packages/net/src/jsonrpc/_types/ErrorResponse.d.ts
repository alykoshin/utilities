/**
* Source file:  "ErrorResponse.json"
* Location:     "/home/alykoshin/projects/dev/npm/@utilities/packages/net"
* Generated by: "./src/jsonrpc/_utils/build.sh"
* Date:         "2020-09-14T21:13:21+03:00" 
*/

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * JSON can represent four primitive types (Strings, Numbers, Booleans, and Null) and two structured types (Objects and Arrays). The term "Primitive" in this specification references any of those four primitive JSON types.
 */
export type PrimitiveValue = string | number | boolean | null;
/**
 * JSON can represent four primitive types (Strings, Numbers, Booleans, and Null) and two structured types (Objects and Arrays). The term "Structured" references either of the structured JSON types.
 */
export type StructuredValue =
  | {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]: PrimitiveValue | StructuredValue;
    }
  | (PrimitiveValue | StructuredValue)[];

export interface ErrorResponse {
  /**
   * A String specifying the version of the JSON-RPC protocol. MUST be exactly "2.0".
   */
  jsonrpc: string;
  error: ErrorObject;
  /**
   * This member is REQUIRED.
   * It MUST be the same as the value of the id member in the Request Object.
   * If there was an error in detecting the id in the Request object (e.g. Parse error/Invalid Request), it MUST be Null.
   */
  id: string | number | null;
}
/**
 * This member is REQUIRED on error.
 * This member MUST NOT exist if there was no error triggered during invocation.
 * The value for this member MUST be an Object as defined in section 5.1.
 * When a rpc call encounters an error, the Response Object MUST contain the error member with a value that is a Object with the following members:
 */
export interface ErrorObject {
  /**
   * A Number that indicates the error type that occurred.
   * This MUST be an integer.
   */
  code: number;
  /**
   * A String providing a short description of the error.
   * The message SHOULD be limited to a concise single sentence.
   */
  message: string;
  /**
   * A Primitive or Structured value that contains additional information about the error.
   * This may be omitted.
   * The value of this member is defined by the Server (e.g. detailed error information, nested errors etc.).
   */
  data?: PrimitiveValue | StructuredValue;
}
