///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Tick generators", () => {
  describe("interval", () => {
    it("generate ticks within domain", () => {
      var start = 0.5, end = 4.01, interval = 1;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [0.5, 1, 2, 3, 4, 4.01], "generated ticks contains all possible ticks within range");
    });

    it("domain crossing 0", () => {
      var start = -1.5, end = 1, interval = 0.5;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
    });

    it("generate ticks with reversed domain", () => {
      var start = -2.2, end = -7.6, interval = 2.5;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
    });

    it("passing big interval", () => {
      var start = 0.5, end = 10.01, interval = 11;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks, [0.5, 10.01], "no middle ticks were added");
    });

    it("passing non positive interval", () => {
      var scale = new Plottable.Scale.Linear().domain([0, 1]);
      assert.throws(() => Plottable.Scale.TickGenerators.intervalTickGenerator(0), "interval must be positive number");
      assert.throws(() => Plottable.Scale.TickGenerators.intervalTickGenerator(-2), "interval must be positive number");
    });
  });

  describe("integer", () => {
    it("normal case", () => {
      var scale = new Plottable.Scale.Linear().domain([0, 4]);
      var ticks = Plottable.Scale.TickGenerators.integerTickGenerator()(scale);
      assert.deepEqual(ticks, [0, 1, 2, 3, 4], "only the integers are returned");
    });

    it("works across negative numbers", () => {
      var scale = new Plottable.Scale.Linear().domain([-2, 1]);
      var ticks = Plottable.Scale.TickGenerators.integerTickGenerator()(scale);
      assert.deepEqual(ticks, [-2, -1, 0, 1], "only the integers are returned");
    });
  });
});
