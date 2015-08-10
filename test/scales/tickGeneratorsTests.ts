///<reference path="../testReference.ts" />

describe("Tick generators", () => {
  describe("interval", () => {
    it("generate ticks within domain", () => {
      let start = 0.5, end = 4.01, interval = 1;
      let scale = new Plottable.Scales.Linear();
      scale.domain([start, end]);
      let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [0.5, 1, 2, 3, 4, 4.01], "generated ticks contains all possible ticks within range");
    });

    it("domain crossing 0", () => {
      let start = -1.5, end = 1, interval = 0.5;
      let scale = new Plottable.Scales.Linear();
      scale.domain([start, end]);
      let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
    });

    it("generate ticks with reversed domain", () => {
      let start = -2.2, end = -7.6, interval = 2.5;
      let scale = new Plottable.Scales.Linear();
      scale.domain([start, end]);
      let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
    });

    it("passing big interval", () => {
      let start = 0.5, end = 10.01, interval = 11;
      let scale = new Plottable.Scales.Linear();
      scale.domain([start, end]);
      let ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [0.5, 10.01], "no middle ticks were added");
    });

    it("passing non positive interval", () => {
      assert.throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(0), "interval must be positive number");
      assert.throws(() => Plottable.Scales.TickGenerators.intervalTickGenerator(-2), "interval must be positive number");
    });
  });

  describe("integer", () => {
    it("normal case", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([0, 4]);
      let ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
      assert.deepEqual(ticks, [0, 1, 2, 3, 4], "only the integers are returned");
    });

    it("works across negative numbers", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([-2, 1]);
      let ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
      assert.deepEqual(ticks, [-2, -1, 0, 1], "only the integers are returned");
    });

    it("includes endticks", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([-2.7, 1.5]);
      let ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
      assert.deepEqual(ticks, [-2.5, -2, -1, 0, 1, 1.5], "end ticks are included");
    });

    it("all float ticks", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([1.1, 1.5]);
      let ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
      assert.deepEqual(ticks, [1.1, 1.5], "only the end ticks are returned");
    });
  });
});
