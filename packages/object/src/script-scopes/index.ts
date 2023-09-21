import { get, set, defaultsDeep } from "lodash";

export function toReversed<T>(arr: T[]): T[] {
  const res = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    res.push(arr[i]);
  }
  return res;
}

export interface ScopeObject<T> {
  [key: string]: T;
}

abstract class GenericScope<T> {
  abstract get: (name: string, dflt?: T) => T;
}

export class Scope<T> extends GenericScope<T> {
  _scope: ScopeObject<T>;
  constructor(scope: ScopeObject<T>) {
    super();
    this._scope = scope;
  }
  get = (name: string, dflt?: T) => get(this._scope, name, dflt);
  set = (name: string, value: any) => set(this._scope, name, value);
  keys = () => Object.keys(this._scope);
}

export class Scopes<T> extends GenericScope<T> {
  _scopes: Scope<T>[] = [];
  constructor(scopes?: (Scope<T> | ScopeObject<T>)[]) {
    super();
    this._scopes = scopes
      ? scopes.map((sc) => (sc instanceof Scope ? sc : new Scope(sc)))
      : [];
  }
  copy(): Scopes<T> {
    return new Scopes(this._scopes);
  }
  push = (scope: Scope<T> | ScopeObject<T>): Scopes<T> => {
    scope instanceof Scope
      ? this._scopes.push(scope)
      : this._scopes.push(new Scope(scope));
    return this;
  };
  pop = (): Scope<T> => {
    const scope = this._scopes.pop();
    if (!scope) {
      throw new Error("scopes are empty");
    }
    return scope;
  };
  merged = (): Scope<T> => {
    const mergedScopes = defaultsDeep(
      {},
      ...toReversed(this._scopes.map((scope) => scope._scope))
    );
    return new Scope<T>(mergedScopes);
  };
  get = (name: string, dflt?: T): T => {
    // for (let scope of this._scopes) {
    for (let i = this._scopes.length - 1; i >= 0; i--) {
      const scope = this._scopes[i];
      const value = scope.get(name, dflt);
      if (typeof value !== "undefined") {
        return value;
      }
    }
  };
  current = (): Scope<T> => this._scopes[this._scopes.length - 1];
  global = (): Scope<T> => this._scopes[0];
}
