/**
* Source file:  "Message.json"
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

export type Message = Request | Notification | SuccessResponse | ErrorResponse;
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
/**
 * This member is REQUIRED on success.
 * This member MUST NOT exist if there was an error invoking the method.
 * The value of this member is determined by the method invoked on the Server.
 */
export type SuccessResult = PrimitiveValue | StructuredValue;

export interface Request {
  /**
   * A String specifying the version of the JSON-RPC protocol. MUST be exactly "2.0".
   */
  jsonrpc?: string;
  /**
   * A String containing the name of the method to be invoked. Method names that begin with the word rpc followed by a period character (U+002E or ASCII 46) are reserved for rpc-internal methods and extensions and MUST NOT be used for anything else.
   */
  method?: string;
  params?: StructuredValue1;
  /**
   * An identifier established by the Client that MUST contain a String, Number, or NULL value if included. If it is not included it is assumed to be a notification.
   * The Server MUST reply with the same value in the Response object if included. This member is used to correlate the context between the two objects.
   * [1] The use of Null as a value for the id member in a Request object is discouraged, because this specification uses a value of Null for Responses with an unknown id. Also, because JSON-RPC 1.0 uses an id value of Null for Notifications this could cause confusion in handling.
   * [2] Fractional parts may be problematic, since many decimal fractions cannot be represented exactly as binary fractions.
   */
  id?: string | number | null;
  [k: string]: unknown;
}
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
export interface SuccessResponse {
  /**
   * A String specifying the version of the JSON-RPC protocol. MUST be exactly "2.0".
   */
  jsonrpc: string;
  result: SuccessResult;
  /**
   * This member is REQUIRED.
   * It MUST be the same as the value of the id member in the Request Object.
   * If there was an error in detecting the id in the Request object (e.g. Parse error/Invalid Request), it MUST be Null.
   */
  id: string | number | null;
}
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
