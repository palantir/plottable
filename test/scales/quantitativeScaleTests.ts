///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  describe("Quantitative Scales", () => {
    it("domain can't include NaN or Infinity", () => {
      var scale = new Plottable.Scales.Linear();
      scale.domain([0, 1]);
      scale.domain([5, Infinity]);
      assert.deepEqual(scale.domain(), [0, 1], "Infinity containing domain was ignored");
      scale.domain([5, -Infinity]);
      assert.deepEqual(scale.domain(), [0, 1], "-Infinity containing domain was ignored");
      scale.domain([NaN, 7]);
      assert.deepEqual(scale.domain(), [0, 1], "NaN containing domain was ignored");
      scale.domain([-1, 5]);
      assert.deepEqual(scale.domain(), [-1, 5], "Regular domains still accepted");
    });

    it("custom tick generator", () => {
      var scale = new Plottable.Scales.Linear();
      scale.domain([0, 10]);
      var ticks = scale.ticks();
      assert.closeTo(ticks.length, 10, 1, "ticks were generated correctly with default generator");
      scale.tickGenerator((scale) => scale.getDefaultTicks().filter(tick => tick % 3 === 0));
      ticks = scale.ticks();
      assert.deepEqual(ticks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
    });
  });

  describe("Linear", () => {
    it("autorange defaults to [0, 1]", () => {
      var scale = new Plottable.Scales.Linear();
      scale.autoDomain();
      assert.deepEqual(scale.domain(), [0, 1]);
    });

    it("autoMin()", () => {
      var scale = new Plottable.Scales.Linear();
      assert.strictEqual(scale.autoMin(), -Infinity, "autoMin() defaults to -Infinity");
      var desiredDomain = [-10, 10];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [desiredDomain]);
      scale.autoMin(0);
      assert.strictEqual(scale.domain()[0], 0, "lower end of domain was set to autoMin() value");
      assert.strictEqual(scale.domain()[1], desiredDomain[1], "upper end of domain was set to desired value");
    });

    it("autoMax()", () => {
      var scale = new Plottable.Scales.Linear();
      assert.strictEqual(scale.autoMax(), Infinity, "autoMax() defaults to +Infinity");
      var desiredDomain = [-10, 10];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [desiredDomain]);
      scale.autoMax(0);
      assert.strictEqual(scale.domain()[0], desiredDomain[0], "lower end of domain was set to desired value");
      assert.strictEqual(scale.domain()[1], 0, "upper end of domain was set to autoMax() value");
    });
  });
});
