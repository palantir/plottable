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

    memoizeFn.logPerformance = function() {
        logPerformance = true;
        return this;
    };
    return memoizeFn;
}
