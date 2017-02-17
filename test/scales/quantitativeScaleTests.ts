import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Scales", () => {
  describe("QuantitativeScale", () => {
    describe("computing extents", () => {
      // HACKHACK #2336: QuantitativeScales don't take min/max of stringy values correctly
      it.skip("gives the minimum and maxiumum when the domain is stringy", () => {
        const values = ["11", "3", "2", "1"];
        const scale = new Plottable.QuantitativeScale();
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, ["1", "11"], "the extent is the miminum and the maximum values");
      });

      it("gives the minimum and maxiumum when the domain is numeric", () => {
        const values = [11, 3, 2, 1];
        const scale = new Plottable.QuantitativeScale();
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, [1, 11], "the extent is the miminum and the maximum values");
      });

      it("ignores NaN, null, and undefined values when computing the extent", () => {
        const values = [NaN, null, undefined, 1, 11];
        const scale = new Plottable.QuantitativeScale();
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, [1, 11], "the extent is the minimum and the maximum values");
      });

      it("ignores infinite values when computing the extent", () => {
        const values = [Infinity, -Infinity, 1, 11];
        const scale = new Plottable.QuantitativeScale();
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, [1, 11], "the extent is the minimum and the maximum values");
      });
    });

    describe("padding", () => {
      it("rejects negative values for padding", () => {
        const scale = new Plottable.QuantitativeScale();
        assert.throws(() => scale.padProportion(-0.05), Error, "must be non-negative");
      });
    });

    describe("tick generation", () => {
      it("can set and get a TickGenerator", () => {
        const scale = new Plottable.QuantitativeScale();
        const tickGenerator = (): any[] => [];
        assert.strictEqual(scale.tickGenerator(tickGenerator), scale, "setting the TickGenerator returns the QuantitativeScale");
        assert.strictEqual(scale.tickGenerator(), tickGenerator, "getter mode returns the set TickGenerator");
      });

      it("uses its TickGenerator to create ticks", () => {
        const scale = new Plottable.QuantitativeScale<number>();
        const expectedTicks = [1, 2, 99];
        const tickGenerator = (passedScale: Plottable.QuantitativeScale<any>) => {
          assert.strictEqual(passedScale, scale, "TickGenerator was passed the QuantitativeScale it was attached to");
          return expectedTicks;
        };
        scale.tickGenerator(tickGenerator);
        const generatedTicks = scale.ticks();
        assert.deepEqual(generatedTicks, expectedTicks, "returned ticks generated by the TickGenerator");
      });
    });
  });
});
