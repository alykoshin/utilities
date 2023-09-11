// import {describe, expect, test} from '@jest/globals';
import {Scope, Scopes, toReversed,} from "../../src/script-scopes";


describe('toReversed', () => {

  test('simple', () => {
    const arr = ['a', 'b', 'c'];
    const expected = ['c', 'b', 'a']

    const result = toReversed(arr)

    expect(result).toEqual(expected);
  });

});


describe('Scope', () => {

  test('get', () => {
    const s = new Scopes();
    s.push({a: 1, b: {c: 2}});
    const key = 'a';
    const expected = 1;

    const result = s.get(key)
    expect(result).toEqual(expected);
  });

  test('get deep', () => {
    const s = new Scopes();
    s.push({a: 1, b: {c: 2}});
    const key = 'b.c';
    const expected = 2;

    const result = s.get(key)
    expect(result).toEqual(expected);
  });

  test('get with scopes order', () => {
    const s = new Scopes();
    s.push({a: 1, b: {c: 2}});
    s.push({b: {c: 3}});
    const key = 'b.c';
    const expected = 3;

    const result = s.get(key)
    expect(result).toEqual(expected);
  });

  test('merged', () => {
    const s = new Scopes();
    s.push({a: 1, b: {c: 2}});
    s.push({b: {c: 3}});
    const expected = {a: 1, b: {c: 3}};

    const result = s.merged()

    // console.log('result:', result)
    // console.log('new Scope(expected):', new Scope(expected))

    expect(result._scope).toEqual(expected);
  });

});

