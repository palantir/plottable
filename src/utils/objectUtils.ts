/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

/**
 * Polyfill for Object.assign
 */
export function assign<T extends Record<any, any>>(...objs: Partial<T>[]): T {
    const result: Partial<T> = {};
    for(const obj of objs) {
        const keys = Object.keys(obj);
        for (const key of keys) {
            result[key as keyof T] = obj[key];
        }
    }
    return result as T;
}
