//
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
//
// function Deferred() {
//   // update 062115 for typeof
//   if (typeof(Promise) != 'undefined' && Promise.defer) {
//     //need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
//     return Promise.defer();
//   } else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
//     //need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
//     return PromiseUtils.defer();
//   } else {
//     /* A method to resolve the associated Promise with the value passed.
//      * If the promise is already settled it does nothing.
//      *
//      * @param {anything} value : This value is used to resolve the promise
//      * If the value is a Promise then the associated promise assumes the state
//      * of Promise passed as value.
//      */
//     this.resolve = null;
//
//     /* A method to reject the assocaited Promise with the value passed.
//      * If the promise is already settled it does nothing.
//      *
//      * @param {anything} reason: The reason for the rejection of the Promise.
//      * Generally its an Error object. If however a Promise is passed, then the Promise
//      * itself will be the reason for rejection no matter the state of the Promise.
//      */
//     this.reject = null;
//
//     /* A newly created Promise object.
//      * Initially in pending state.
//      */
//     this.promise = new Promise(function(resolve, reject) {
//       this.resolve = resolve;
//       this.reject = reject;
//     }.bind(this));
//     Object.freeze(this);
//   }
// }


// type DeferredCallback<T,E> = (error: E, result?: T) => void

export class Deferred<T,E> {
  public readonly promise: Promise<T>
  protected _resolve: (value?: T | PromiseLike<T>) => void
  protected _reject: (reason?: E) => void
  // protected readonly _callback: DeferredCallback<T,E>

  constructor () {
  // constructor (callback: DeferredCallback<T,E>) {
  //   this._callback = callback;
    this._resolve = null;
    this._reject = null;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    Object.freeze(this);
  }

  resolve(value?: T | PromiseLike<T>) {
    this._resolve(value);
    // if (this._callback) return this._callback(null, value);
  }

  reject(reason?: E) {
    this._reject(reason);
    // if (this._callback) return this._callback(reason);
  }

  callback(error: E, value?: T) {
    if (error) {
      this._reject(error);
    } else {
      this.resolve(value);
    }
    // if (this._callback) return this._callback(error, value);
  }

}
