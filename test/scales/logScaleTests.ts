import { assert } from "chai";

import * as Plottable from "../../src";

describe("Scales", () => {
  describe("Log Scale", () => {

    describe("Basic Usage", () => {
      let scale: Plottable.Scales.Log;
      const base = 10;
      const epsilon = 0.00001;

      beforeEach(() => {
        scale = new Plottable.Scales.Log(base);
      });

      it("has log() behavior", () => {
        [1e-45, 0.000232, 0.1, 1, 10, 100, 23103.4, 1e+45].forEach((x) => {
          assert.closeTo(scale.scale(x), Math.log(x) / Math.log(base), epsilon);
        });
      });

      it("ensures x = invert(scale(x))", () => {
        [1, base, 100, 0.001, base - 0.001].forEach((x) => {
          assert.closeTo(x, scale.invert(scale.scale(x)), epsilon);
          assert.closeTo(x, scale.scale(scale.invert(x)), epsilon);
        });
      });

      it("defaults to the [1, base] domain", () => {
        assert.deepEqual(scale.domain(), [1, base], "default domain is [1, base]");
      });

      it("can be padded", () => {
        scale.addIncludedValuesProvider(() => [base/10, 10*base]);
        scale.padProportion(0);
        const unpaddedDomain = scale.domain();
        scale.padProportion(0.1);
        assert.operator(scale.domain()[0], "<", unpaddedDomain[0], "left side of domain has been padded");
        assert.operator(unpaddedDomain[1], "<", scale.domain()[1], "right side of domain has been padded");
      });

      it("can have a reversed domain", () => {
        scale.domain([20, 10]);
        scale.range([400, 500]);
        assert.strictEqual(scale.scale(10), 500, "first value in flipped domain maps to first value in range");
        assert.strictEqual(scale.scale(20), 400, "last value in flipped domain maps to last value in range");

        assert.strictEqual(scale.invert(400), 20, "first value in range maps to first value in flipped domain");
        assert.strictEqual(scale.invert(500), 10, "last value in range maps to last value in flipped domain");
      });

    });

    describe("Scale bases", () => {
      it("uses 10 as the default base", () => {
        const scale = new Plottable.Scales.Log();
        scale.range([0, 1]);
        assert.strictEqual(scale.scale(10), 1, "10 is base");
        assert.strictEqual(scale.scale(100), 2, "10^2 will result in a double value compared to the base");
      });

      it("can scale values using base 2", () => {
        const scale = new Plottable.Scales.Log(2);
        scale.domain([1, 16]);
        scale.range([0, 1]);

        assert.strictEqual(scale.scale(2), 0.25, "scales base");
        assert.strictEqual(scale.scale(4), 0.5, "scales other values");
        assert.strictEqual(scale.scale(16), 1, "scales maximum value");
        assert.strictEqual(scale.scale(256), 2, "scales values outside the domain");

        assert.strictEqual(scale.invert(1), 16, "inverts maximum value");
      });
    });

    describe("Auto Domaining", () => {
      let scale: Plottable.Scales.Log;
      const base = 10;

      beforeEach(() => {
        scale = new Plottable.Scales.Log(base);
        scale.padProportion(0);
      });

      it("expands single value domains to [value / base, value * base].sort()", () => {
        const singleValue = 15;
        scale.addIncludedValuesProvider(() => [singleValue]);
        assert.deepEqual(scale.domain(), [singleValue / base, singleValue * base],
          "positive single-value extent was expanded to [value / base, value * base]");
      });

      it("doesn't lock up if a zero-width domain is set while there are value providers", () => {
        scale.padProportion(0.1);
        const provider = () => [1, 10];
        scale.addIncludedValuesProvider(provider);
        scale.autoDomain();
        const originalAutoDomain = scale.domain();

        scale.domain([0, 0]);
        scale.autoDomain();

        assert.deepEqual(scale.domain(), originalAutoDomain, "autodomained as expected");
      });

      it("can force the minimum of the domain with domainMin()", () => {
        const requestedDomain = [1, 5];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const minBelowBottom = 0.1;
        assert.strictEqual(scale.domainMin(minBelowBottom), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMin(), minBelowBottom, "can get the domainMin()");
        assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");

        const minInMiddle = (1 + 5) / 2;
        scale.domainMin(minInMiddle);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]],
          "lower end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
        assert.strictEqual(scale.domainMin(), scale.domain()[0], "returns autoDomain()-ed min value after autoDomain()-ing");

        const minEqualTop = scale.domain()[1];
        scale.domainMin(minEqualTop);
        assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop * base],
          "domain is set to [min, min * base] if the requested value is >= autoDomain()-ed max value");

        scale.domainMin(minInMiddle);
        const requestedDomain2 = [0.1, 10];
        scale.addIncludedValuesProvider(() => requestedDomain2);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
      });

      it("can force the maximum of the domain with domainMax()", () => {
        const requestedDomain = [1, 5];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const maxAboveTop = 10;
        assert.strictEqual(scale.domainMax(maxAboveTop), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMax(), maxAboveTop, "can get the domainMax()");
        assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");

        const maxInMiddle = (1 + 5) / 2;
        scale.domainMax(maxInMiddle);
        assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle],
          "upper end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
        assert.strictEqual(scale.domainMax(), scale.domain()[1], "returns autoDomain()-ed max value after autoDomain()-ing");

        const maxEqualBottom = scale.domain()[0];
        scale.domainMax(maxEqualBottom);
        assert.deepEqual(scale.domain(), [maxEqualBottom / base, maxEqualBottom],
          "domain is set to [max / base, max] if the requested value is <= autoDomain()-ed min value and negative");

        scale.domainMax(maxInMiddle);
        const requestedDomain2 = [1, 10];
        scale.addIncludedValuesProvider(() => requestedDomain2);
        assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
      });

      it("can force the domain by using domainMin() and domainMax() together", () => {
        const requestedDomain = [1, 5];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const desiredMin = 0.1;
        const desiredMax = 10;
        scale.domainMin(desiredMin);
        scale.domainMax(desiredMax);
        assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");

        scale.autoDomain();
        const bigMin = 10;
        const smallMax = 0.1;
        scale.domainMin(bigMin);
        scale.domainMax(smallMax);
        assert.deepEqual(scale.domain(), [bigMin, smallMax], "setting both is allowed even if it reverse the domain");
      });
    });

    describe("Ticks", () => {

      let scale: Plottable.Scales.Log;
      const base = 10;

      beforeEach(() => {
        scale = new Plottable.Scales.Log(base);
      });

      it("gives reasonable values for ticks()", () => {
        const includedValuesProvider = () => [base / 4, base / 2];
        scale.addIncludedValuesProvider(includedValuesProvider);

        const ticks = scale.ticks();
        assert.operator(ticks.length, ">", 0, "there should be some ticks generated");
      });

      it("always has more than 2 ticks", () => {
        [null, [2, 9], [1, 2], [0.001, 0.01]].forEach((domain) => {
          scale.domain(domain);
          const ticks = scale.ticks();
          assert.operator(ticks.length, ">=", 2, "there should be at least 2 ticks in domain " + domain);
        });
      });
    });
  });
});
