import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import { memoize } from "../../src/memoize/memoize";
import { Dataset } from "../../src/core/dataset";
import { IAccessorScaleBinding } from "../../src/plots/commons";
import { Plot } from "../../src/plots/plot";
import { memThunk } from "../../src/memoize/memThunk";

describe("memThunk", () => {
    it("calls compute fn with the result of the input thunks", () => {
        const a = new Plottable.Scales.Linear().domain([0, 10]).range([0, 100]);
        const b = 2;
        const spy = sinon.spy((a: Plottable.Scales.Linear, b: number) => a.scale(b));

        const thunkFn = memThunk(
            () => a,
            () => b,
            spy,
        );

        const firstCall = thunkFn();
        assert.strictEqual(firstCall, 20);
        assert.isTrue(spy.calledWithExactly(a, b));

        // thunk should memoize
        spy.reset();
        const secondCall = thunkFn();
        assert.strictEqual(secondCall, 20);
        assert.isFalse(spy.called);

        // when input thunks change, result changes and memoize is re-called
        a.range([0, 1000]);
        const changedCall = thunkFn();
        assert.strictEqual(changedCall, 200);
        assert.strictEqual(spy.callCount, 1);
    });
});
