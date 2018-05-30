
import { MapCache, memoize as lodashMemoize } from "lodash";

import { Dataset } from "../core/dataset";
import { AttributeToProjector, Projector } from "../core/interfaces";

interface IIndexMapRecord {
    [key: number]: any;
}

/**
 * An index that stores values by numeric key.
 *
 * Internally this uses prototype-less objects as key lookups are marginally
 * faster than `{}`s.
 */
class IndexMap<T> {
    private map: IIndexMapRecord = Object.create(null);
    private exists: IIndexMapRecord = Object.create(null);

    public delete(key: number): boolean {
        delete this.map[key];
        delete this.exists[key];
        return true;
    }

    public get(key: number): T {
        return this.map[key];
    }

    public has(key: number): boolean {
        return !!this.exists[key];
    }

    public set(key: number, value: T) {
        this.map[key] = value;
        this.exists[key] = true;
        return this;
    }
}

/**
 * A lodash-style `MapCache` that utilizes a [number, number] key to create a
 * fast-lookup 2D index. This is much faster than stringifying the key.
 */
class DatasetIndexCache implements MapCache {
    public static resolver = (d: any, i: number, dataset: Dataset) => [dataset.updateId(), i];

    private map: IndexMap<IndexMap<any>> = new IndexMap<IndexMap<any>>();

    public get(key: any): any {
        return this.map.get(key[0]).get(key[1]);
    }

    public has(key: any): boolean {
        return this.map.has(key[0]) && this.map.get(key[0]).has(key[1]);
    }

    public set(key: any, value: any) {
        this.map.has(key[0]) || this.map.set(key[0], new IndexMap<any>());
        this.map.get(key[0]).set(key[1], value);
        return this;
    }

    public delete(key: any): boolean {
        // NOTE: this can potentially leave dangling `IndexMap`s if we delete
        // all the keys from the index instead of using `clear`. The overhead is
        // minimal, so this is fine.
        this.map.has(key[0]) && this.map.get(key[0]).delete(key[1]);
        return true;
    }

    public clear(): void {
        this.map = new IndexMap<IndexMap<any>>();
    }
}

export function memoizeProjector(projector: Projector): Projector {
    const memo = lodashMemoize(projector, DatasetIndexCache.resolver);
    (memo as any).cache = new DatasetIndexCache();
    return memo;
}

export function memoizeProjectors(attrToProjector: AttributeToProjector) {
    Object.keys(attrToProjector).forEach((key) => {
        attrToProjector[key] = memoizeProjector(attrToProjector[key]);
    });
    return attrToProjector;
}
