///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Tick generatros", () => {
  describe("interval", () => {
    it("generate ticks within domain", () => {
      var start = 0.5, end = 10.01, interval = 1;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.isTrue(ticks.map(t => t >= start && t <= end).reduce((a, b) => a && b, true), "generated ticks are within domain");
    });

    it("generates multiplication of interval", () => {
      var start = 5, end = 34, interval = 4;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.isTrue(ticks.map(t => t % interval === 0).reduce((a, b) => a && b, true), "generated ticks are mulitplication of interval");
    });

    it("generated ticks contains both ends if they meet constraint", () => {
      var start = 4, end = 32, interval = 4;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.include(ticks, start, "generated ticks contains start, because it is interval multiplication");
      assert.include(ticks, end, "generated ticks contains end, because it is interval multiplication");
    });

    it("generated ticks are unique and in ascending order", () => {
      var start = 4, end = 16, interval = 4;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);
      assert.deepEqual(ticks.map(x => x / interval), [1, 2, 3, 4], "generated ticks are unique and in ascending order");
      start = 0.5;
      end = 2.5;
      interval = 0.5;
      ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale.domain([start, end]));
      assert.deepEqual(ticks.map(x => x / interval), [1, 2, 3, 4, 5], "generated ticks are unique and in ascending order");
    });
  });
});
