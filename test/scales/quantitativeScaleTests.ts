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

    it("min()", () => {
      var scale = new Plottable.Scales.Linear();
      var desiredDomain = [-5, 5];
      scale.addExtentsProvider(() => [desiredDomain]);
      var minValue = -10;
      scale.min(minValue);
      assert.deepEqual(scale.domain(), [minValue, desiredDomain[1]], "lower value in domain was set to minValue");
    });

    it("max()", () => {
      var scale = new Plottable.Scales.Linear();
      var desiredDomain = [-5, 5];
      scale.addExtentsProvider(() => [desiredDomain]);
      var maxValue = 10;
      scale.max(maxValue);
      assert.deepEqual(scale.domain(), [desiredDomain[0], maxValue], "upper value in domain was set to maxValue");
    });
  });
});
