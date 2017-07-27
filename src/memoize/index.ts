/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as isPlainObject from "is-plain-object";

import { Dataset } from "../core/dataset";
import { Scale } from "../scales/scale";

/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

abstract class Signature {
  public isDifferent(other: Signature): boolean {
    // debugger;
    if (other instanceof this.constructor) {
      return this.isSignatureDifferent(other as this);
    } else {
      return true;
    }
  }

  protected abstract isSignatureDifferent(other: this): boolean;
}

class ArraySignature extends Signature {
  constructor(private array: Signature[]) {
    super();
  }

  isSignatureDifferent(other: ArraySignature) {
    if (other.array.length !== this.array.length) {
      return true;
    } else {
      for (let i = 0; i < this.array.length; i++) {
        if (this.array[i].isDifferent(other.array[i])) {
          return true;
        }
      }
      return false;
    }
  }
}

class ReferenceSignature extends Signature {
  constructor(private ref: any) {
    super();
  }

  isSignatureDifferent(other: ReferenceSignature) {
    return this.ref !== other.ref;
  }
}

interface ISignatureRecord {
  [key: string]: Signature;
}

class ObjectSignature extends Signature {
  constructor(private obj: ISignatureRecord) {
    super();
  }

  isSignatureDifferent(other: ObjectSignature) {
    const myKeys = Object.keys(this.obj);
    const otherKeys = Object.keys(other.obj);

    if (myKeys.length !== otherKeys.length) {
      return true;
    }

    for (const key of myKeys) {
      if (!other.obj.hasOwnProperty(key)) {
        return true;
      }
      if (this.obj[key].isDifferent(other.obj[key])) {
        return true;
      }
    }
    return false;
  }
}

function signRef(a: any) {
  return new ReferenceSignature(a);
}

function signArray(a: any[]) {
  return new ArraySignature(a.map((element) => sign(element)));
}

function signObj(obj: { [key: string]: any }) {
  const signatureRecord: ISignatureRecord = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      signatureRecord[key] = sign(obj[key]);
    }
  }
  return new ObjectSignature(signatureRecord);
}

function signScale(scale: Scale<any, any>) {
  const scaleObj = {
    domain: scale.domain(),
    range: scale.range(),
    updateId: scale.updateId(),
    ref: signRef(scale),
  };
  return signObj(scaleObj);
}

function signDataset(dataset: Dataset) {
  const datasetObj = {
    ref: signRef(dataset),
    // only sign updateId since only data() and metadata() exist as properties
    // and both update updateId
    updateId: dataset.updateId(),
  };
  return signObj(datasetObj);
}

function sign<T>(a: T): Signature {
  if (a instanceof Signature) {
    return a;
  } else if (a instanceof Scale) {
    return signScale(a);
  } else if (a instanceof Dataset) {
    return signDataset(a);
  } else if (isPlainObject(a)) {
    return signObj(a);
  } else if(Array.isArray(a)) {
    return signArray(a);
  } else {
    return signRef(a);
  }
}

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