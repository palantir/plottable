import { assert } from "chai";

import * as Plottable from "../../src";

function normalizeNegativeZeros(nums: number[]) {
  // -0 + +0 -> +0
  return nums.map((n) => n + 0);
}

describe("Scales", () => {
  describe("Tick generators", () => {
    describe("intervalTickGenerator() generates ticks with a given interval", () => {
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("generates ticks within domain", () => {
        const start = 0.5;
        const end = 4.01;
        const interval = 1;
        scale.domain([start, end]);
        const ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);

        assert.strictEqual(ticks.length, 6, "ticks are generated");
        ticks.forEach((tick) => {
          assert.operator(start, "<=", tick, "tick " + tick + " should be greater than the lower bound of the domain");
          assert.operator(tick, "<=", end, "tick " + tick + " should be less than the upper bound of the domain");
        });
      });

      it("generates ticks for a domain crossing 0", () => {
        const start = -1.5;
        const end = 1;
        const interval = 0.5;
        scale.domain([start, end]);
        const ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
        assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
      });

      it("generates ticks with reversed domain", () => {
        const start = -2.2;
        const end = -7.6;
        const interval = 2.5;
        scale.domain([start, end]);
        const ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
        assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
      });

      it("returns the ends of the domain if interval is NaN or bigger than the domain", () => {
        const start = 0.5;
        const end = 10.01;
        const interval = 11;
        scale.domain([start, end]);
        let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
        assert.deepEqual(ticks, [start, end], "no middle ticks were added when interval is 11");

        ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(Infinity)(scale);
        assert.deepEqual(ticks, [start, end], "no middle ticks were added when interval is Infinity");

        ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(NaN)(scale);
        assert.deepEqual(ticks, [start, end], "no middle ticks were added when interval is NaN");
      });

      it("works for Scales.ModifiedLog", () => {
        const logScale = new Plottable.Scales.ModifiedLog(2);
        const interval = 40;
        logScale.domain([0, 100]);
        const logTicks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(logScale);
        assert.deepEqual(logTicks, [0, 40, 80, 100], "generates ticks for Scales.ModifiedLog");
      });

      it("rejects non-positive values", () => {
        // HACKHACK #2614: chai-assert.d.ts has the wrong signature
        (<any> assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(0), Error, "interval must be positive number",
          "interval cannot be 0");
        (<any> assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(-2), Error, "interval must be positive number",
          "interval cannot be negative");
      });

      // HACKHACK #2743: skipping failing test
      // intervalTickGenerator() does not detect invalid scale
      it.skip("rejects non-QuantitativeScale<number> Scales", () => {
        const interval = 1;
        const categoryScale: any = new Plottable.Scales.Category();
        // HACKHACK #2614: chai-assert.d.ts has the wrong signature
        (<any> assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(categoryScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Category is not a valid parameter for TickGenerators");

        const timeScale: any = new Plottable.Scales.Time();
        (<any> assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(timeScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Time is not a valid parameter for TickGenerators");
      });

    });

    describe("integerTickGenerator() generates integer ticks ", () => {
      let scale: Plottable.Scales.Linear;
      let integerTickGenerator: Plottable.Scales.TickGenerators.ITickGenerator<number>;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
        integerTickGenerator = Plottable.Scales.TickGenerators.integerTickGenerator();
      });

      it("generates integer ticks", () => {
        scale.domain([0, 4]);
        assert.deepEqual(integerTickGenerator(scale), [0, 1, 2, 3, 4], "only the integers are returned");
      });

      it("works across negative numbers", () => {
        scale.domain([-2, 1]);
        assert.deepEqual(normalizeNegativeZeros(integerTickGenerator(scale)), [-2, -1, 0, 1], "only the integers are returned");
      });

      it("includes end ticks", () => {
        scale.domain([-2.7, 1.5]);
        assert.deepEqual(normalizeNegativeZeros(integerTickGenerator(scale)), [-2.5, -2, -1, 0, 1, 1.5], "end ticks are included");
      });

      it("does not include integer ticks when there are none in the domain", () => {
        scale.domain([1.1, 1.5]);
        assert.deepEqual(integerTickGenerator(scale), [1.1, 1.5],
          "only the end ticks are returned when there is no integer in the interval");
      });

      // HACKHACK #2743: skipping failing test
      // integerTickGenerator() returns an array of powers instead of actual value
      it.skip("works for Scales.ModifiedLog", () => {
        const logScale = new Plottable.Scales.ModifiedLog(2);
        logScale.domain([-2, 4.5]);
        const logTicks = integerTickGenerator(logScale);
        assert.deepEqual(logTicks, [-2, -1, 0, 1, 2, 4, 4.5], "generates interger ticks for Scales.ModifiedLog");
      });

      // HACKHACK #2743: skipping failing test
      // integerTickGenerator() does not detect invalids scale
      it.skip("rejects non-QuantitativeScale<number> Scales", () => {
        const categoryScale: any = new Plottable.Scales.Category();
        // HACKHACK #2614: chai-assert.d.ts has the wrong signature
        (<any> assert).throws(() => integerTickGenerator(categoryScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Category is not a valid parameter for TickGenerators");

        const timeScale: any = new Plottable.Scales.Time();
        (<any> assert).throws(() => integerTickGenerator(timeScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Time is not a valid parameter for TickGenerators");
      });
    });
  });
});
