/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 * @fileoverview Implements a convenient thunk function to handle the common case
 * of creating a memoized function that takes its inputs from mutable class properties.
 */

import { memoize, MemoizedFunction } from "./index";
export type Thunk<R> = () => R;

export function memThunk<I1, O>(
    arg1: Thunk<I1>,
    compute: (this: void, arg1: I1) => O,
): MemoizedFunction<Thunk<O>>;
export function memThunk<I1, I2, O>(
    arg1: Thunk<I1>,
    arg2: Thunk<I2>,
    compute: (this: void, arg1: I1, arg2: I2) => O,
): MemoizedFunction<Thunk<O>>;
export function memThunk<I1, I2, I3, O>(
    arg1: Thunk<I1>,
    arg2: Thunk<I2>,
    arg3: Thunk<I3>,
    compute: (this: void, arg1: I1, arg2: I2, arg3: I3) => O,
): MemoizedFunction<Thunk<O>>;
export function memThunk<I1, I2, I3, I4, O>(
    arg1: Thunk<I1>,
    arg2: Thunk<I2>,
    arg3: Thunk<I3>,
    arg4: Thunk<I4>,
    compute: (this: void, arg1: I1, arg2: I2, arg3: I3, arg4: I4) => O,
): MemoizedFunction<Thunk<O>>;

/**
 * First pass argument thunks that will be evaluated whenever the memThunk
 * is accessed. This should be fast and simple.
 *
 * Then pass a pure function that, when given the argument thunks' values,
 * will output some computed value. It should not use `this` in the body.
 *
 * We memoize and return this pure function.
 *
 * This way, memThunk lets you implement a performant, always-up-to-date "computed"
 * value getter.
 */
export function memThunk<O>(...argsAndCompute: Function[]): Thunk<O> {
    const inputs = argsAndCompute.slice(0, -1);
    const compute = argsAndCompute[argsAndCompute.length - 1];
    const memoizedCompute = memoize(compute);
    const memoizedThunk = function () {
        const inputEval = inputs.map((inputFn) => inputFn.apply(this));
        return memoizedCompute.apply(undefined, inputEval);
    };
    return memoizedThunk;
}
