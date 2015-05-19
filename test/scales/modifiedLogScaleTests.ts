///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  describe("Modified Log Scale", () => {
    var scale: Plottable.Scales.ModifiedLog;
    var base = 10;
    var epsilon = 0.00001;
    beforeEach(() => {
      scale = new Plottable.Scales.ModifiedLog(base);
    });

    it("is an increasing, continuous function that can go negative", () => {
      d3.range(-base * 2, base * 2, base / 20).forEach((x: number) => {
        // increasing
        assert.operator(scale.scale(x - epsilon), "<", scale.scale(x));
        assert.operator(scale.scale(x), "<", scale.scale(x + epsilon));
        // continuous
        assert.closeTo(scale.scale(x - epsilon), scale.scale(x), epsilon);
        assert.closeTo(scale.scale(x), scale.scale(x + epsilon), epsilon);
      });
      assert.closeTo(scale.scale(0), 0, epsilon);
    });

    it("Has log() behavior at values > base", () => {
      [10, 100, 23103.4, 5].forEach((x) => {
        assert.closeTo(scale.scale(x), Math.log(x) / Math.log(10), 0.1);
      });
    });

    it("x = invert(scale(x))", () => {
      [0, 1, base, 100, 0.001, -1, -0.3, -base, base - 0.001].forEach((x) => {
        assert.closeTo(x, scale.invert(scale.scale(x)), epsilon);
        assert.closeTo(x, scale.scale(scale.invert(x)), epsilon);
      });
    });

    it("domain defaults to [0, base]", () => {
      scale = new Plottable.Scales.ModifiedLog(base);
      assert.deepEqual(scale.domain(), [0, base], "default domain is [0, base]");
    });

    it("can be padded", () => {
      scale.addExtentsProvider((scale: Plottable.Scales.ModifiedLog) => [[0, base]]);
      scale.padProportion(0);
      var unpaddedDomain = scale.domain();
      scale.padProportion(0.1);
      assert.operator(scale.domain()[0], "<", unpaddedDomain[0], "left side of domain has been padded");
      assert.operator(unpaddedDomain[1], "<", scale.domain()[1], "right side of domain has been padded");
    });

    it("autoDomain() expands single value to [value / base, value * base]", () => {
      var scale = new Plottable.Scales.ModifiedLog();
      scale.padProportion(0);
      var singleValue = 15;
      scale.addExtentsProvider((scale: Plottable.Scales.ModifiedLog) => [[singleValue, singleValue]]);
      scale.autoDomain();
      assert.deepEqual(scale.domain(), [singleValue / base, singleValue * base], "single-value extent was expanded");
    });

    it("gives reasonable values for ticks()", () => {
      var providedExtents = [[0, base / 2]];
      scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => providedExtents);
      scale.autoDomain();
      var ticks = scale.ticks();
      assert.operator(ticks.length, ">", 0);

      providedExtents = [[-base * 2, base * 2]];
      scale.autoDomain();
      ticks = scale.ticks();
      var beforePivot = ticks.filter((x) => x <= -base);
      var afterPivot = ticks.filter((x) => base <= x);
      var betweenPivots = ticks.filter((x) => -base < x && x < base);
      assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
      assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
      assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
    });

    it("works on inverted domain", () => {
      scale.domain([200, -100]);
      var range = scale.range();
      assert.closeTo(scale.scale(-100), range[1], epsilon);
      assert.closeTo(scale.scale(200), range[0], epsilon);
      var a = [-100, -10, -3, 0, 1, 3.64, 50, 60, 200];
      var b = a.map((x) => scale.scale(x));
      // should be decreasing function; reverse is sorted
      assert.deepEqual(b.slice().reverse(), b.slice().sort((x, y) => x - y));

      var ticks = scale.ticks();
      assert.deepEqual(ticks, ticks.slice().sort((x, y) => x - y), "ticks should be sorted");
      assert.deepEqual(ticks, Plottable.Utils.Methods.uniq(ticks), "ticks should not be repeated");
      var beforePivot = ticks.filter((x) => x <= -base);
      var afterPivot = ticks.filter((x) => base <= x);
      var betweenPivots = ticks.filter((x) => -base < x && x < base);
      assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
      assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
      assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
    });

    it("ticks() is always non-empty", () => {
      var desiredExtents: number[][] = [];
      scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => desiredExtents);
      [[2, 9], [0, 1], [1, 2], [0.001, 0.01], [-0.1, 0.1], [-3, -2]].forEach((extent) => {
        desiredExtents = [extent];
        scale.autoDomain();
        var ticks = scale.ticks();
        assert.operator(ticks.length, ">", 0);
      });
    });
  });
});
