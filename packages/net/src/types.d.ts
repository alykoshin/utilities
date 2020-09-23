export interface NodeJSError extends Error {
  code?: string
  stackTraceLimit: number
  captureStackTrace: { (targetObject: object, constructorOpt?: {():void}): void }
}

export interface GenericNodejsCallback { (error: Error|undefined, ...result: any[]): any }

