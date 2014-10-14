///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Tick generators", () => {
  describe("interval", () => {
    it("generate ticks within domain", () => {
      var start = 0.5, end = 10.01, interval = 1;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);
      var lastValue = 0;
      ticks.forEach(t => {
        assert.operator(t, ">=", start, "entry is not less then start");
        assert.operator(t, "<=", end, "entry is not greater then end");
        assert.operator(t, ">", lastValue, "entries are in ascending order");
        assert.isTrue(t % interval === 0 || t === start || t === end, "entry is generated using interval or it is either ends");
        lastValue = t;
      });

      assert.include(ticks, start, "generated ticks contains start");
      assert.include(ticks, end, "generated ticks contains end");
      assert.lengthOf(ticks, 12, "generated ticks contains all possible ticks within range");
    });

    it("reversed domain", () => {
      var start = -2.2, end = -12.5, interval = 2.5;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);
      var lastValue = 0;
      ticks.forEach(t => {
        assert.operator(t, "<=", start, "entry is not greater then start");
        assert.operator(t, ">=", end,   "entry is not less then end");
        assert.operator(t, "<", lastValue, "entries are in descending order");
        assert.isTrue(t % interval === 0 || t === start || t === end, "entry is generated using interval or it is either ends");
        lastValue = t;
      });

      assert.include(ticks, start, "generated ticks contains start");
      assert.include(ticks, end, "generated ticks contains end");
      assert.lengthOf(ticks, 6, "generated ticks contains all possible ticks within range");
    });

    it("passing big interval", () => {
      var start = 0.5, end = 10.01, interval = 11;
      var scale = new Plottable.Scale.Linear().domain([start, end]);
      var ticks = Plottable.TickGenerators.intervalTickGenerator(interval)(scale);

      assert.include(ticks, start, "generated ticks contains start");
      assert.include(ticks, end, "generated ticks contains end");
      assert.lengthOf(ticks, 2, "generated ticks contains all possible ticks within range");
    });

    it("passing non positive interval", () => {
      var scale = new Plottable.Scale.Linear().domain([0, 1]);
      assert.throws(() => Plottable.TickGenerators.intervalTickGenerator(0), Error);
      assert.throws(() => Plottable.TickGenerators.intervalTickGenerator(-2), Error);
    });
  });
});
