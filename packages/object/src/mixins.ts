interface IPrototype { prototype: any; }


export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  // if (!Array.isArray(baseCtors)) baseCtors = [baseCtors];

  baseCtors.forEach((baseCtor) => {
    // Object.getOwnPropertyNames((baseCtor as any & IPrototype).prototype).forEach(name => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

