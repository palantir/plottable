///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Modified Log Scale", () => {
    let scale: Plottable.Scales.ModifiedLog;
    let base = 10;
    let epsilon = 0.00001;
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
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => [0, base]);
      scale.padProportion(0);
      let unpaddedDomain = scale.domain();
      scale.padProportion(0.1);
      assert.operator(scale.domain()[0], "<", unpaddedDomain[0], "left side of domain has been padded");
      assert.operator(unpaddedDomain[1], "<", scale.domain()[1], "right side of domain has been padded");
    });

    it("autoDomain() expands single value correctly", () => {
      scale.padProportion(0);
      let singleValue = 15;
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => [singleValue, singleValue]);
      assert.deepEqual(scale.domain(), [singleValue / base, singleValue * base],
        "positive single-value extent was expanded to [value / base, value * base]");
      singleValue = -15;
      scale.autoDomain();
      assert.deepEqual(scale.domain(), [singleValue * base, singleValue / base],
        "negative single-value extent was expanded to [value * base, value / base]");
      singleValue = 0;
      scale.autoDomain();
      assert.deepEqual(scale.domain(), [-base, base],
        "zero single-value extent was expanded to [base, -base]");
    });

    it("domainMin()", () => {
      let scale = new Plottable.Scales.ModifiedLog(base);
      scale.padProportion(0);
      let requestedDomain = [-5, 5];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => requestedDomain);

      let minBelowBottom = -10;
      scale.domainMin(minBelowBottom);
      assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");

      let minInMiddle = 0;
      scale.domainMin(minInMiddle);
      assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]], "lower end was set even if requested value cuts off some data");

      scale.autoDomain();
      assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");

      let minEqualTop = scale.domain()[1];
      scale.domainMin(minEqualTop);
      assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop * base],
        "domain is set to [min, min * base] if the requested value is >= autoDomain()-ed max value");

      scale.domainMin(minInMiddle);
      let requestedDomain2 = [-10, 10];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => requestedDomain2);
      assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
    });

    it("domainMax()", () => {
      let scale = new Plottable.Scales.ModifiedLog(base);
      scale.padProportion(0);
      let requestedDomain = [-5, 5];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => requestedDomain);

      let maxAboveTop = 10;
      scale.domainMax(maxAboveTop);
      assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");

      let maxInMiddle = 0;
      scale.domainMax(maxInMiddle);
      assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle], "upper end was set even if requested value cuts off some data");

      scale.autoDomain();
      assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");

      let maxEqualBottom = scale.domain()[0];
      scale.domainMax(maxEqualBottom);
      assert.deepEqual(scale.domain(), [maxEqualBottom * base, maxEqualBottom],
        "domain is set to [max * base, max] if the requested value is <= autoDomain()-ed min value and negative");

      scale.domainMax(maxInMiddle);
      let requestedDomain2 = [-10, 10];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => requestedDomain2);
      assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
    });

    it("domainMin() and domainMax() together", () => {
      let scale = new Plottable.Scales.ModifiedLog(base);
      scale.padProportion(0);
      let requestedDomain = [-5, 5];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.ModifiedLog) => requestedDomain);

      let desiredMin = -10;
      let desiredMax = 10;
      scale.domainMin(desiredMin);
      scale.domainMax(desiredMax);
      assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");

      scale.autoDomain();
      let bigMin = 10;
      let smallMax = -10;
      scale.domainMin(bigMin);
      scale.domainMax(smallMax);
      assert.deepEqual(scale.domain(), [bigMin, smallMax], "setting both is allowed even if it reverse the domain");
    });

    it("gives reasonable values for ticks()", () => {
      let providedExtents = [0, base / 2];
      scale.addIncludedValuesProvider((scale: Plottable.Scale<number, number>) => providedExtents);
      let ticks = scale.ticks();
      assert.operator(ticks.length, ">", 0);

      providedExtents = [-base * 2, base * 2];
      scale.autoDomain();
      ticks = scale.ticks();
      let beforePivot = ticks.filter((x) => x <= -base);
      let afterPivot = ticks.filter((x) => base <= x);
      let betweenPivots = ticks.filter((x) => -base < x && x < base);
      assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
      assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
      assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
    });

    it("works on inverted domain", () => {
      scale.domain([200, -100]);
      let range = scale.range();
      assert.closeTo(scale.scale(-100), range[1], epsilon);
      assert.closeTo(scale.scale(200), range[0], epsilon);
      let a = [-100, -10, -3, 0, 1, 3.64, 50, 60, 200];
      let b = a.map((x) => scale.scale(x));
      // should be decreasing function; reverse is sorted
      assert.deepEqual(b.slice().reverse(), b.slice().sort((x, y) => x - y));

      let ticks = scale.ticks();
      assert.deepEqual(ticks, ticks.slice().sort((x, y) => x - y), "ticks should be sorted");
      assert.deepEqual(ticks, Plottable.Utils.Array.uniq(ticks), "ticks should not be repeated");
      let beforePivot = ticks.filter((x) => x <= -base);
      let afterPivot = ticks.filter((x) => base <= x);
      let betweenPivots = ticks.filter((x) => -base < x && x < base);
      assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
      assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
      assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
    });

    it("ticks() always has more than 2 ticks", () => {
      [null, [2, 9], [0, 1], [1, 2], [0.001, 0.01], [-0.1, 0.1], [-3, -2]].forEach((domain) => {
        scale.domain(domain);
        let ticks = scale.ticks();
        assert.operator(ticks.length, ">", 2);
      });
    });
  });
});
