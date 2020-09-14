/**
* Source file:  "BatchRequest.json"
* Location:     "/home/alykoshin/projects/dev/082-mt-node-red/experiments/ws-client-server/lib/jsonrpc"
* Generated by: "_utils/build.sh"
* Date:         "2020-09-01T01:57:32+03:00" 
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
export type BatchRequest = Request[];

export interface Request {
  /**
   * A String specifying the version of the JSON-RPC protocol. MUST be exactly "2.0".
   */
  jsonrpc: string;
  /**
   * A String containing the name of the method to be invoked. Method names that begin with the word rpc followed by a period character (U+002E or ASCII 46) are reserved for rpc-internal methods and extensions and MUST NOT be used for anything else.
   */
  method: string;
  params?: StructuredValue1;
  /**
   * An identifier established by the Client that MUST contain a String, Number, or NULL value if included. If it is not included it is assumed to be a notification.
   * The Server MUST reply with the same value in the Response object if included. This member is used to correlate the context between the two objects.
   * [1] The use of Null as a value for the id member in a Request object is discouraged, because this specification uses a value of Null for Responses with an unknown id. Also, because JSON-RPC 1.0 uses an id value of Null for Notifications this could cause confusion in handling.
   * [2] Fractional parts may be problematic, since many decimal fractions cannot be represented exactly as binary fractions.
   */
  id?: string | number | null;
}
