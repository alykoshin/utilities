import Debug from 'debug'

//
// https://gist.github.com/darrenscerri/5c3b3dcbe4d370435cfa
//
const MiddlewareES5 = function() {};

MiddlewareES5.prototype.use = function(fn) {
  const self = this;

  this.go = (function(this:any,stack) {
    return function(next) {
      stack.call(self, function() {
        fn.call(self, next.bind(self));
      });
    }.bind(this);
  })(this.go);

};

MiddlewareES5.prototype.go = function(next) {
  next();
};

//

class MiniMiddlewareES6 {
  use(fn) {
    this.go = (stack => next => stack(fn.bind(this, next.bind(this))))(this.go);
  }
  go = next => next();
}

//

interface IMiddlewareFn_ {
  (ctx: any, next: IMiddlewareFn_): Promise<any>;
}

export interface IMiddlewareFn {
  (ctx: any, next: INextFn): any;
}

export interface INextFn {
  // (): Promise<any>;
  (): Promise<any>;
  // (ctx: any/*, next: INextFn*/): Promise<any>;
}

type TMiddlewareFn = (ctx: any, next: TMiddlewareFn) => Promise<any>;

type Ctx = any


export class Middleware {
  protected ctx: Ctx
  protected _debug: Debug.Debugger
  protected _count: number;

  constructor() {
    this._debug = Debug('middleware');
    this._count = 0;
  }

  use(currFn: IMiddlewareFn) {
    this._debug(`* adding middleware #${++this._count}:`, currFn);
    this._go = (
      (old_go: IMiddlewareFn) => {
        this._debug(`** storing former middleware function old_go:`, old_go);
        const new_go = async ( ctx, next: INextFn): Promise<any> => {
          this._debug(`** calling next middleware function: old_go:`, old_go, 'next:', next);
          console.log('next', next, 'old_go:', old_go);
          return old_go.call(this, this.ctx, currFn.bind(this, this.ctx, next.bind(this)));
        }
        return new_go;
      }
    )(this._go);
  }

  protected async _go (ctx: Ctx, next: INextFn): Promise<any> {
    this._debug(`calling "first" next`);
    return next();
  }

  public async go (ctx: Ctx, cb) {
    this._debug(`starting sequence`);
    this.ctx = ctx;
    const result = this._go(ctx,cb);
    this._debug(`finishing sequence`);
    return result;
  }

}
