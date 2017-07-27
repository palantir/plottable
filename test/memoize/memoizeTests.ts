import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import { Dataset } from "../../src/core/dataset";
import { memoize } from "../../src/memoize/memoize";
import { IAccessorScaleBinding } from "../../src/plots/commons";
import { Plot } from "../../src/plots/plot";

describe("memoize()", () => {
    it("caches repeated calls", () => {
        const spy = sinon.spy((a: number, b: number, c: number) => {
            return a + b + c;
        });
        const memFn = memoize(spy);

        const firstCall = memFn(1, 2, 3);
        assert.strictEqual(firstCall, 6);
        assert.strictEqual(spy.callCount, 1);

        // same call is cached
        spy.reset();
        const secondCall = memFn(1, 2, 3);
        assert.strictEqual(secondCall, 6);
        assert.isFalse(spy.called);

        // different args is not cached
        spy.reset();
        const thirdCall = memFn(1, 2, 4);
        assert.strictEqual(thirdCall, 7);
        assert.strictEqual(spy.callCount, 1);

        // but calling again with new args is cached again
        spy.reset();
        const fourthCall = memFn(1, 2, 4);
        assert.strictEqual(fourthCall, 7);
        assert.isFalse(spy.called);
    });

    it("memoizes datasets and scale bindings", () => {
        const spy = sinon.spy((binding: IAccessorScaleBinding<any, number>, dataset: Dataset) => {
            const accessor = Plot._scaledAccessor(binding);
            return dataset.data().map((datum, index) => accessor(datum, index, dataset));
        });
        const memFn = memoize(spy);

        const binding: IAccessorScaleBinding<any, number> = {
            accessor: (datum) => datum.x,
            scale: new Plottable.Scales.Linear().domain([0, 10]).range([0, 100]),
        };
        const dataset = new Plottable.Dataset([{x: 2}, {x: 4}, {x: 6}, {x: 8}]);
        const firstCall = memFn(binding, dataset);
        assert.deepEqual(firstCall, [20, 40, 60, 80]);
        assert.strictEqual(spy.callCount, 1);

        // caching with same state works
        spy.reset();
        memFn(binding, dataset);
        assert.isFalse(spy.called);

        // cache invalidated when scale changes
        spy.reset();
        binding.scale.range([0, 1000]);
        const scaleChangeCall = memFn(binding, dataset);
        assert.deepEqual(scaleChangeCall, [200, 400, 600, 800]);
        assert.strictEqual(spy.callCount, 1);

        // cache invalidated when dataset changes
        spy.reset();
        dataset.data([{x: 1}, {x: 3}, {x: 5}, {x: 7}]);
        const dataChangeCall = memFn(binding, dataset);
        assert.deepEqual(dataChangeCall, [100, 300, 500, 700]);
        assert.strictEqual(spy.callCount, 1);

        // cache holds when nothing changes, returns same reference
        spy.reset();
        const noChangeCall = memFn(binding, dataset);
        assert.strictEqual(dataChangeCall, noChangeCall);
        assert.isFalse(spy.called);
    });

    it("always returns cache with doLocked", () => {
        const spy = sinon.spy((a: any) => a);
        const memFn = memoize(spy);

        const firstCall = memFn(10);
        assert.strictEqual(firstCall, 10);
        assert.strictEqual(spy.callCount, 1);

        memFn.doLocked(() => {
            // in locked mode, we return the cached value, regardless of input!
            spy.reset();
            const insideCall = memFn(20);
            assert.strictEqual(insideCall, 10);
            assert.isFalse(spy.called);
        });

        // outside of locked mode, things return to normal
        spy.reset();
        const outsideCall = memFn(20);
        assert.strictEqual(outsideCall, 20);
        assert.strictEqual(spy.callCount, 1);
    });
});
