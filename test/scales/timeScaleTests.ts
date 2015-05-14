///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  describe("Time Scale", () => {
    it("can't set reversed domain", () => {
      var scale = new Plottable.Scales.Time();
      assert.throws(() => scale.domain([new Date("1985-10-26"), new Date("1955-11-05")]), "chronological");
    });
  
    it("tickInterval produces correct number of ticks", () => {
      var scale = new Plottable.Scales.Time();
      // 100 year span
      scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
      var ticks = scale.tickInterval(Plottable.TimeInterval.year);
      assert.strictEqual(ticks.length, 101, "generated correct number of ticks");
      // 1 year span
      scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
      ticks = scale.tickInterval(Plottable.TimeInterval.month);
      assert.strictEqual(ticks.length, 12, "generated correct number of ticks");
      ticks = scale.tickInterval(Plottable.TimeInterval.month, 3);
      assert.strictEqual(ticks.length, 4, "generated correct number of ticks");
      // 1 month span
      scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
      ticks = scale.tickInterval(Plottable.TimeInterval.day);
      assert.strictEqual(ticks.length, 32, "generated correct number of ticks");
      // 1 day span
      scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
      ticks = scale.tickInterval(Plottable.TimeInterval.hour);
      assert.strictEqual(ticks.length, 24, "generated correct number of ticks");
      // 1 hour span
      scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
      ticks = scale.tickInterval(Plottable.TimeInterval.minute);
      assert.strictEqual(ticks.length, 61, "generated correct number of ticks");
      ticks = scale.tickInterval(Plottable.TimeInterval.minute, 10);
      assert.strictEqual(ticks.length, 7, "generated correct number of ticks");
      // 1 minute span
      scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
      ticks = scale.tickInterval(Plottable.TimeInterval.second);
      assert.strictEqual(ticks.length, 61, "generated correct number of ticks");
    });
  });
});
