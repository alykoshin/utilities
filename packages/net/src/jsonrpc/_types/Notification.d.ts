/**
* Source file:  "Notification.json"
* Location:     "/home/alykoshin/projects/dev/npm/@utilities/packages/net"
* Generated by: "./src/jsonrpc/_utils/build.sh"
* Date:         "2020-09-14T21:13:22+03:00" 
*/

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A Structured value that holds the parameter values to be used during the invocation of the method. This member MAY be omitted.
 */
export type StructuredValue1 =
  | {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]: PrimitiveValue | StructuredValue;
    }
  | (PrimitiveValue | StructuredValue)[];
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

export interface Notification {
  /**
   * A String specifying the version of the JSON-RPC protocol. MUST be exactly "2.0".
   */
  jsonrpc: string;
  /**
   * A String containing the name of the method to be invoked. Method names that begin with the word rpc followed by a period character (U+002E or ASCII 46) are reserved for rpc-internal methods and extensions and MUST NOT be used for anything else.
   */
  method: string;
  params?: StructuredValue1;
}
