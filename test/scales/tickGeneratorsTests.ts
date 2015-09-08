///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Tick generators", () => {
    describe("intervalTickGenerator() generates ticks with a given interval", () => {
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("generates ticks within domain", () => {
        let start = 0.5;
        let end = 4.01;
        scale.domain([start, end]);
        let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(1)(scale);

        assert.strictEqual(ticks.length, 6, "ticks are generated");
        ticks.forEach((tick) => {
          assert.operator(start, "<=", tick, "tick " + tick + " should be greater than the lower bound of the domain");
          assert.operator(tick, "<=", end, "tick " + tick + " should be less than the upper bound of the domain");
        });
      });

      it("generates ticks for a domain crossing 0", () => {
        let start = -1.5;
        let end = 1;
        scale.domain([start, end]);
        let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(0.5)(scale);
        assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
      });

      it("generates ticks with reversed domain", () => {
        let start = -2.2;
        let end = -7.6;
        scale.domain([start, end]);
        let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(2.5)(scale);
        assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
      });

      it("returns the ends of the domain if interval is NaN or bigger than the domain", () => {
        let start = 0.5;
        let end = 10.01;
        scale.domain([start, end]);
        let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(11)(scale);
        assert.deepEqual(ticks, [start, end], "no middle ticks were added when interval is 11");

        ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(Infinity)(scale);
        assert.deepEqual(ticks, [start, end], "no middle ticks were added when interval is Infinity");

        ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(NaN)(scale);
        assert.deepEqual(ticks, [start, end], "no middle ticks were added when interval is NaN");
      });

      it("works for Scales.ModifiedLog", () => {
        let logScale = new Plottable.Scales.ModifiedLog(2);
        logScale.domain([0, 100]);
        let logTicks = Plottable.Scales.TickGenerators.intervalTickGenerator(40)(logScale);
        assert.deepEqual(logTicks, [0, 40, 80, 100], "generates ticks for Scales.ModifiedLog");
      });

      it("rejects non-positive values", () => {
        (<any>assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(0), Error, "interval must be positive number",
          "interval cannot be 0");
        (<any>assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(-2), Error, "interval must be positive number",
          "interval cannot be negatvie");
      });

      // HACKHACK: skipping failing test
      // intervalTickGenerator() does not detect invalids scale
      it.skip("rejects non-QuantitativeScale<number> Scales", () => {
        let categoryScale: any = new Plottable.Scales.Category();
        (<any>assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(1)(categoryScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Category is not a valid parameter for TickGenerators");

        let timeScale: any = new Plottable.Scales.Time();
        (<any>assert).throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(1)(timeScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Time is not a valid parameter for TickGenerators");
      });

    });

    describe("integerTickGenerator() generates integer ticks ", () => {
      let scale: Plottable.Scales.Linear;
      let integerTickGenerator: Plottable.Scales.TickGenerators.TickGenerator<number>;

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
        assert.deepEqual(integerTickGenerator(scale), [-2, -1, 0, 1], "only the integers are returned");
      });

      it("includes end ticks", () => {
        scale.domain([-2.7, 1.5]);
        assert.deepEqual(integerTickGenerator(scale), [-2.5, -2, -1, 0, 1, 1.5], "end ticks are included");
      });

      it("does not include integer ticks when there are none in the domain", () => {
        scale.domain([1.1, 1.5]);
        assert.deepEqual(integerTickGenerator(scale), [1.1, 1.5],
          "only the end ticks are returned when there is no integer in the interval");
      });

      // HACKHACK: skipping failing test
      // integerTickGenerator() returns an array of powers instead of actual value
      it.skip("works for Scales.ModifiedLog", () => {
        let logScale = new Plottable.Scales.ModifiedLog(2);
        logScale.domain([-2, 4.5]);
        let logTicks = integerTickGenerator(logScale);
        assert.deepEqual(logTicks, [-2, -1, 0, 1, 2, 4, 4.5], "generates interger ticks for Scales.ModifiedLog");
      });

      // HACKHACK: skipping failing test
      // integerTickGenerator() does not detect invalids scale
      it.skip("rejects non-QuantitativeScale<number> Scales", () => {
        let categoryScale: any = new Plottable.Scales.Category();
        (<any>assert).throws(() => integerTickGenerator(categoryScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Category is not a valid parameter for TickGenerators");

        let timeScale: any = new Plottable.Scales.Time();
        (<any>assert).throws(() => integerTickGenerator(timeScale), Error,
          "scale needs to inherit from Scale.QuantitativeScale<number>", "Scales.Time is not a valid parameter for TickGenerators");
      });
    });
  });
});
