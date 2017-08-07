/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 * @fileoverview Implements a function memoizer using the Signature API.
 */

import { signArray, Signature } from "./signature";

export interface IMemoizedFunctionMethods {
    /**
     * Lock the memoization to always return the cached
     * property during the duration of fn. This lets you
     * bypass the performance hit of signing when you
     * know the fn will not mutate the inputs.
     *
     * Be sure to force the memoization to the value
     * you want before calling this!
     *
     * @param fn
     */
    doLocked<T>(fn: () => T): T;

    /**
     * Turn on perf logging. Useful for debugging.
     */
    logPerformance(): this;
}

export type MemoizedFunction<F extends Function> = F & IMemoizedFunctionMethods;

/**
 * Return a memoized version of the input function. The memoized function
 * reduces unnecessary invocations of the input by keeping a cache of the
 * return value of compute:
 *
 * <pre>
 * function compute(a, b) { return a + b }
 * const memoizedCompute = memoize(compute);
 *
 * compute(3, 7) == 10
 * compute(3, 7) == 10 // cache hit
 * </pre>
 *
 * Cache invalidation is complicated by mutable classes (Scales and Datasets).
 * The Signature API is built to solve this issue by constructing an immutable
 * snapshot of Scales/Datasets on memoized function invocation, which is itself
 * a performance hit. Thus we introduce a "doLocked" method that momentarily
 * bypasses sign/comparison logic and simply returns the cached value.
 *
 * See the Signature API for more information.
 *
 * @param {F} compute
 * @returns {MemoizedFunction<F extends Function>}
 */
export function memoize<F extends Function>(compute: F): MemoizedFunction<F> {
    let lastSignature: Signature = undefined;
    let lastValue: any;
    let locked = false;
    let logPerformance = false;

    const memoizeFn = function(...args: any[]) {
        if (locked) {
            return lastValue;
        }
        const inputSignature = signArray(args);
        if (lastSignature === undefined
            || lastSignature.isDifferent(inputSignature)) {
            if (logPerformance) {
                console.log("cache miss! computing");
            }
            lastSignature = inputSignature;
            lastValue = compute.apply(this, args);
        } else {
            if (logPerformance) {
                console.log("cache hit!");
            }
        }
        return lastValue;
    } as any as MemoizedFunction<F>;
    memoizeFn.doLocked = function<T>(cb: () => T) {
        if (locked) {
            throw new Error("Locking an already locked memoize function!");
        }
        locked = true;
        const retVal = cb.apply(this);
        locked = false;
        return retVal;
    };

    memoizeFn.logPerformance = function(log = true) {
        logPerformance = log;
        return this;
    };
    return memoizeFn;
}
