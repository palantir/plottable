/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 * @fileoverview Implements the Signature API to help in comparing when two
 * Plottable objects have "changed".
 *
 * Memoization in Plottable is complicated by mutable scales and datasets. We cannot simply
 * reference compare two e.g. scales since it may have internally mutated. To resolve this,
 * we write a recursive Signature interface that holds an immutable snapshot of whatever
 * state the scale/data was in at the time. Then on memoized function invocation we sign the
 * new inputs and compare the signatures to decide if we should recompute.
 */

import * as isPlainObject from "is-plain-object";

import { Dataset } from "../core/dataset";
import { Scale } from "../scales/scale";

/**
 * Generic signature factory - pass any value and get a signature for it.
 *
 * Datasets and Scales are handled specially - see their respective signing methods.
 *
 * If the input is already a signature, simply return it.
 *
 * @param a
 * @returns {Signature}
 */
export function sign<T>(a: T): Signature {
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

export function signScale(scale: Scale<any, any>) {
    const scaleObj = {
        // required in case the domain has changed without the updateId changing
        domain: scale.domain(),

        // required in case the range has changed without the updateId changing
        range: scale.range(),

        // generic catch-all for scale updates (existing code doesn't fully catch all
        // updates, but it's good for something)
        updateId: scale.updateId(),

        // keep a ref to the scale in case the ref changes
        ref: signRef(scale),
    };
    return signObj(scaleObj);
}

export function signDataset(dataset: Dataset) {
    const datasetObj = {
        ref: signRef(dataset),
        // only sign updateId since only data() and metadata() exist as properties
        // and both update updateId
        updateId: dataset.updateId(),
    };
    return signObj(datasetObj);
}

export function signRef(a: any) {
    return new ReferenceSignature(a);
}

export function signArray(a: any[]) {
    return new ArraySignature(a.map((element) => sign(element)));
}

export function signObj(obj: { [key: string]: any }) {
    const signatureRecord: ISignatureRecord = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            signatureRecord[key] = sign(obj[key]);
        }
    }
    return new ObjectSignature(signatureRecord);
}

/**
 * Base signature. Subclasses should implement isSignatureDifferent. All classes
 * should be immutable.
 *
 * Users should only call `isDifferent`, not `isSignatureDifferent`.
 */
export abstract class Signature {
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

/**
 * A signature for an array.
 */
export class ArraySignature extends Signature {
    constructor(private array: Signature[]) {
        super();
    }

    /**
     * An array of signatures is different if any of the elements isDifferent.
     */
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

export class ReferenceSignature extends Signature {
    constructor(private ref: any) {
        super();
    }

    isSignatureDifferent(other: ReferenceSignature) {
        return this.ref !== other.ref;
    }
}

export interface ISignatureRecord {
    [key: string]: Signature;
}

/**
 * A signature for a plain js object.
 */
export class ObjectSignature extends Signature {
    constructor(private obj: ISignatureRecord) {
        super();
    }

    /**
     * An object signature is different if any of the elements isDifferent.
     */
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

