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
  constructor(scope: ScopeObject<T> = {}) {
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
  new = (map?: ScopeObject<T>): Scopes<T> => {
    const scope = map ? new Scope<T>(map) : new Scope<T>();
    this._scopes.push(scope);
    // it's not obvious what to expect here as a result
    // the new Scope or all the Scopes
    // maybe it's better to return `void`
    // though typechecking will prevent errors
    return this;
  };
  push = (scopeOrMap: Scope<T> | ScopeObject<T>): Scopes<T> => {
    scopeOrMap instanceof Scope
      ? this._scopes.push(scopeOrMap)
      : this.new(scopeOrMap);
    // it's not obvious what to expect here as a result
    // the added Scope or all the Scopes
    // maybe it's better to return `void`
    // though typechecking will prevent errors
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
