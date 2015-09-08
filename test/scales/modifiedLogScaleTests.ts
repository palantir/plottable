///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Modified Log Scale", () => {

    describe("Basic Usage", () => {
      let scale: Plottable.Scales.ModifiedLog;
      let base = 10;
      let delta = 0.00001;
      let epsilon = 0.00001;

      beforeEach(() => {
        scale = new Plottable.Scales.ModifiedLog(base);
      });

      it("is an increasing, continuous function that can go negative", () => {
        d3.range(-base * 2, base * 2, base / 20).forEach((x: number) => {
          // increasing
          assert.operator(scale.scale(x - delta), "<", scale.scale(x));
          assert.operator(scale.scale(x), "<", scale.scale(x + delta));
          // continuous
          assert.closeTo(scale.scale(x - delta), scale.scale(x), epsilon);
          assert.closeTo(scale.scale(x), scale.scale(x + delta), epsilon);
        });
        assert.closeTo(scale.scale(0), 0, epsilon);
      });

      it("has log() behavior at values > base", () => {
        [10, 100, 23103.4, 1e+45].forEach((x) => {
          assert.closeTo(scale.scale(x), Math.log(x) / Math.log(10), epsilon);
        });
      });

      it("ensures x = invert(scale(x))", () => {
        [0, 1, base, 100, 0.001, -1, -0.3, -base, base - 0.001].forEach((x) => {
          assert.closeTo(x, scale.invert(scale.scale(x)), epsilon);
          assert.closeTo(x, scale.scale(scale.invert(x)), epsilon);
        });
      });

      it("defaults to the [0, base] domain", () => {
        assert.deepEqual(scale.domain(), [0, base], "default domain is [0, base]");
      });

      it("can be padded", () => {
        scale.addIncludedValuesProvider(() => [0, base]);
        scale.padProportion(0);
        let unpaddedDomain = scale.domain();
        scale.padProportion(0.1);
        assert.operator(scale.domain()[0], "<", unpaddedDomain[0], "left side of domain has been padded");
        assert.operator(unpaddedDomain[1], "<", scale.domain()[1], "right side of domain has been padded");
      });

      it("works on inverted domain", () => {
        scale.domain([200, -100]);
        scale.range([10, 20]);
        let range = scale.range();
        assert.strictEqual(scale.scale(-100), range[1], "minimum value in domain maps to maximum value in range");
        assert.strictEqual(scale.scale(200), range[0], "maximum value in domain maps to minimum value in range");
        let a = [-100, -10, -3, 0, 1, 3.64, 50, 60, 200];
        let b = a.map((x) => scale.scale(x));
        assert.deepEqual(b, b.slice().sort().reverse(), "should be decreasing function; reverse is sorted");
      });

    });

    describe("Scale bases", () => {
      it("uses 10 as the default base", () => {
        let scale = new Plottable.Scales.ModifiedLog();
        scale.range([0, 1]);
        assert.strictEqual(scale.scale(10), 1, "10 is base");
        assert.strictEqual(scale.scale(100), 2, "10^2 will result in a double value compared to the base");
      });

      it("can scale values using base 2", () => {
        let scale = new Plottable.Scales.ModifiedLog(2);
        scale.domain([0, 16]);
        scale.range([0, 1]);

        assert.strictEqual(scale.scale(-2), -0.25, "scales negative values");
        assert.strictEqual(scale.scale(0), 0, "scales 0");
        assert.strictEqual(scale.scale(2), 0.25, "scales base");
        assert.strictEqual(scale.scale(4), 0.5, "scales other values");
        assert.strictEqual(scale.scale(16), 1, "scales maximum value");
        assert.strictEqual(scale.scale(256), 2, "scales values outside the domain");

        assert.strictEqual(scale.invert(1), 16, "inverts maximum value");
        assert.strictEqual(scale.invert(0), 0, "inverts zero");
      });
    });

    describe("Auto Domaining", () => {
      let scale: Plottable.Scales.ModifiedLog;
      let base = 10;

      beforeEach(() => {
        scale = new Plottable.Scales.ModifiedLog(base);
        scale.padProportion(0);
      });

      it("expands single value domains to [value / base, value * base].sort()", () => {
        let singleValue = 15;
        scale.addIncludedValuesProvider(() => [singleValue]);
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

      it("can force the minimum of the domain with domainMin()", () => {
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider(() => requestedDomain);

        let minBelowBottom = -10;
        assert.strictEqual(scale.domainMin(minBelowBottom), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMin(), minBelowBottom, "can get the domainMin()");
        assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");

        let minInMiddle = 0;
        scale.domainMin(minInMiddle);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]],
          "lower end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
        assert.strictEqual(scale.domainMin(), scale.domain()[0], "returns autoDomain()-ed min value after autoDomain()-ing");

        let minEqualTop = scale.domain()[1];
        scale.domainMin(minEqualTop);
        assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop * base],
          "domain is set to [min, min * base] if the requested value is >= autoDomain()-ed max value");

        scale.domainMin(minInMiddle);
        let requestedDomain2 = [-10, 10];
        scale.addIncludedValuesProvider(() => requestedDomain2);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
      });

      it("can force the maximum of the domain with domainMax()", () => {
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider(() => requestedDomain);

        let maxAboveTop = 10;
        assert.strictEqual(scale.domainMax(maxAboveTop), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMax(), maxAboveTop, "can get the domainMax()");
        assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");

        let maxInMiddle = 0;
        scale.domainMax(maxInMiddle);
        assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle],
          "upper end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
        assert.strictEqual(scale.domainMax(), scale.domain()[1], "returns autoDomain()-ed max value after autoDomain()-ing");

        let maxEqualBottom = scale.domain()[0];
        scale.domainMax(maxEqualBottom);
        assert.deepEqual(scale.domain(), [maxEqualBottom * base, maxEqualBottom],
          "domain is set to [max * base, max] if the requested value is <= autoDomain()-ed min value and negative");

        scale.domainMax(maxInMiddle);
        let requestedDomain2 = [-10, 10];
        scale.addIncludedValuesProvider(() => requestedDomain2);
        assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
      });

      it("can force the domain by using domainMin() and domainMax() together", () => {
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider(() => requestedDomain);

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
    });

    describe("Ticks", () => {

      let scale: Plottable.Scales.ModifiedLog;
      let base = 10;

      beforeEach(() => {
        scale = new Plottable.Scales.ModifiedLog(base);
      });

      it("gives reasonable values for ticks()", () => {
        let includedValuesProvider = () => [0, base / 2];
        scale.addIncludedValuesProvider(includedValuesProvider);

        let ticks = scale.ticks();
        assert.operator(ticks.length, ">", 0, "there should be some ticks generated");

        scale.removeIncludedValuesProvider(includedValuesProvider);
        includedValuesProvider = () => [-base * 2, base * 2];
        scale.addIncludedValuesProvider(includedValuesProvider);

        ticks = scale.ticks();
        let beforePivot = ticks.filter((x) => x <= -base);
        let afterPivot = ticks.filter((x) => base <= x);
        let betweenPivots = ticks.filter((x) => -base < x && x < base);
        assert.operator(beforePivot.length, ">", 0, "there should be ticks before -base");
        assert.operator(afterPivot.length, ">", 0, "there should be ticks after base");
        assert.operator(betweenPivots.length, ">", 0, "there should be ticks between -base and base");
      });

      it("works on inverted domain", () => {
        scale.domain([200, -100]);

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

      it("always has more than 2 ticks", () => {
        [null, [2, 9], [0, 1], [1, 2], [0.001, 0.01], [-0.1, 0.1], [-3, -2]].forEach((domain) => {
          scale.domain(domain);
          let ticks = scale.ticks();
          assert.operator(ticks.length, ">", 2, "there should be at least 2 ticks in domain " + domain);
        });
      });
    });
  });
});
