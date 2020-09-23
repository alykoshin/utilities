import Debug from 'debug'

import { Middleware, INextFn } from "../src/middlewares";


// if (require.main === module) {
  Debug.enable('middleware');

  async function run() {
    const promisedTimeout = async (t: number) => new Promise(resolve => setTimeout(resolve, t))

    const testFn = async function testFn(n: string, ctx: object) {
      console.log(`  ${n}`);
      ctx[n] = true;
      return await promisedTimeout(500);
    }

    const mw = new Middleware();

// class Tst {
//   constructor() {
    mw.use(async function mw1(this: any, ctx, next) {
      console.log('1.1', this.constructor?.name);
      await testFn('1.1.1', ctx);
      await next();
      await testFn('1.1.2', ctx);
      console.log('1.2', this.constructor?.name);
    });
    mw.use(async function mw2(this: any, ctx, next) {
      console.log('2.1', this.constructor?.name);
      await testFn('2.1.1', ctx);
      await next();
      await testFn('2.1.2', ctx);
      console.log('2.2', this.constructor?.name);
    });
    mw.use(async function mw3(this: any, ctx, next) {
      console.log('3.1', this.constructor?.name);
      await testFn('3.1.1', ctx);
      await next();
      await testFn('3.1.2', ctx);
      console.log('3.2', this.constructor?.name);
    });
    // }
// }
// const tst = new Tst();
    const ctx = {property0: 0};
    const res = await mw.go(ctx, (next: INextFn) => {
      console.log('entered the last (internal) mw', ctx);
      // next();
    });

    console.log('res:', res)
    console.log('ctx:', ctx)


// export class Middleware_ {
//   protected stack: MiddlewareFn[]
//                         s
//   public use(fn: MiddlewareFn) {
//     this.stack.push(fn);
//   }
//
//   protected _last() {
//
//   }
//
//   public go() {
//     let i = 0;
//     do {
//       const next = (i < this.stack.length)
//         ? this.stack
//         : this._last
//       if (i < this.stack.length) {
//         const current = this.stack[i];
//
//       }
//     } while ()
//   }
//
// }
  }
  run();

// }
