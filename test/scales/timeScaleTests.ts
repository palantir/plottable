import { assert } from "chai";

import * as Plottable from "../../src";

describe("Scales", () => {
  describe("TimeScale tests", () => {

    describe("Basic Usage", () => {
      let scale: Plottable.Scales.Time;

      beforeEach(() => {
        scale = new Plottable.Scales.Time();
      });

      it("calculates the correct extent", () => {
        const date1 = new Date(2015, 2, 25, 19, 0, 0);
        const date2 = new Date(2015, 2, 24, 19, 0, 0);
        const date3 = new Date(2015, 2, 25, 19, 0, 0);
        const date4 = new Date(2015, 2, 26, 19, 0, 0);
        const values = [date1, date2, date3, date4];

        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, [date2, date4], "The extent is the miminum and the maximum value in the domain");
      });

      it.skip("ignores invalid values when calculating the extent", () => {
        const expectedExtent = [new Date("2015-06-05"), new Date("2015-06-04")];
        const arrayWithBadValues: any = [
          null,
          NaN,
          undefined,
          Infinity,
          -Infinity,
          "a string",
          0,
          expectedExtent[0],
          expectedExtent[1],
        ];
        const extent = scale.extentOfValues(arrayWithBadValues);
        assert.strictEqual(extent[0].getTime(), expectedExtent[0].getTime(), "returned correct min");
        assert.strictEqual(extent[1].getTime(), expectedExtent[1].getTime(), "returned correct max");
      });

      it("can be padded", () => {
        scale.padProportion(0);
        const unpaddedDomain = scale.domain();
        scale.addIncludedValuesProvider(() => unpaddedDomain);
        scale.padProportion(0.1);
        assert.operator(scale.domain()[0].getTime(), "<", unpaddedDomain[0].getTime(), "left side of domain was padded");
        assert.operator(scale.domain()[1].getTime(), ">", unpaddedDomain[1].getTime(), "right side of domain was padded");
      });

      it("has a consistent default domain", () => {
        const scale2 = new Plottable.Scales.Time();
        assert.strictEqual(scale.domain()[0].getTime(), scale2.domain()[0].getTime(),
          "both scales have the same default left side of domain");
        assert.strictEqual(scale.domain()[1].getTime(), scale2.domain()[1].getTime(),
          "both scales have the same default right side of domain");
      });

      it("respects padding exceptions", () => {
        const minValue = new Date(2000, 5, 4);
        const maxValue = new Date(2000, 5, 6);
        scale.addIncludedValuesProvider(() => [minValue, maxValue]);
        assert.operator(scale.domain()[0].getTime(), "<", minValue.getTime(), "left side of domain is normally padded");
        assert.operator(scale.domain()[1].getTime(), ">", maxValue.getTime(), "right side of domain is normally padded");
        scale.addPaddingExceptionsProvider(() => [minValue]);
        assert.strictEqual(scale.domain()[0].getTime(), minValue.getTime(),
          "left side of domain isn't padded if it matches the exception");
        const maxValuePaddingException = () => [maxValue];
        scale.addPaddingExceptionsProvider(maxValuePaddingException);
        assert.strictEqual(scale.domain()[1].getTime(), maxValue.getTime(),
          "right side of domain isn't padded if it matches the exception");

        scale.removePaddingExceptionsProvider(maxValuePaddingException);
        assert.strictEqual(scale.domain()[0].getTime(), minValue.getTime(),
          "left side of domain still isn't padded");
        assert.operator(scale.domain()[1].getTime(), ">", maxValue.getTime(),
          "right side of the domain is padded again because exception was removed");
      });

      it("can't set reversed domain", () => {
        assert.throws(() => scale.domain([new Date("1986-10-26"), new Date("1985-11-05")]), "chronological");
      });

      it("produces correct number of ticks", () => {
        // 100 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
        const yearTicks = scale.tickInterval(Plottable.TimeInterval.year);
        assert.strictEqual(yearTicks.length, 101, "generated correct number of ticks for 100 year span, every year");
        // 1 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
        const monthTicks = scale.tickInterval(Plottable.TimeInterval.month);
        assert.strictEqual(monthTicks.length, 12, "generated correct number of ticks for 1 year span, every month");
        const threeMonthTicks = scale.tickInterval(Plottable.TimeInterval.month, 3);
        assert.strictEqual(threeMonthTicks.length, 4, "generated correct number of ticks for 1 year span, every 3 months");
        // 1 month span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
        const dayTicks = scale.tickInterval(Plottable.TimeInterval.day);
        assert.strictEqual(dayTicks.length, 32, "generated correct number of ticks for 1 month span, every day");
        // 1 day span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
        const hourTicks = scale.tickInterval(Plottable.TimeInterval.hour);
        assert.strictEqual(hourTicks.length, 24, "generated correct number of ticks for 1 day span, every hour");
        // 1 hour span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
        const minuteTicks = scale.tickInterval(Plottable.TimeInterval.minute);
        assert.strictEqual(minuteTicks.length, 61, "generated correct number of ticks for 1 hour span, every minute");
        const tenMinuteTicks = scale.tickInterval(Plottable.TimeInterval.minute, 10);
        assert.strictEqual(tenMinuteTicks.length, 7, "generated correct number of ticks for 1 hour span, every 10 minutes");
        // 1 minute span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
        const secondTicks = scale.tickInterval(Plottable.TimeInterval.second);
        assert.strictEqual(secondTicks.length, 61, "generated correct number of ticks for 1 minute span, every second");
      });
    });

    describe("Automatic Domain Calculation", () => {
      it("expands single value domains to [value - 1, value + 1] when autoDomain()-ing", () => {
        const scale = new Plottable.Scales.Time();
        const singleValue = new Date(2000, 5, 5);
        const dayBefore = new Date(2000, 5, 4);
        const dayAfter = new Date(2000, 5, 6);
        scale.addIncludedValuesProvider(() => [singleValue]);
        scale.autoDomain();
        const domain = scale.domain();
        assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "left side of domain was expaded by one day");
        assert.strictEqual(domain[1].getTime(), dayAfter.getTime(), "right side of domain was expaded by one day");
      });

      it("doesn't lock up if a zero-width domain is set while there are value providers", () => {
        const scale = new Plottable.Scales.Time();
        scale.padProportion(0.1);
        const provider = () => [new Date(2000, 5, 5), new Date(2000, 5, 6)];
        scale.addIncludedValuesProvider(provider);
        scale.autoDomain();
        const originalAutoDomain = scale.domain();

        scale.domain([new Date(0), new Date(0)]);
        scale.autoDomain();

        const domainAfter = scale.domain();

        const numberize = (d: Date) => d.getTime();
        assert.deepEqual(domainAfter.map(numberize), originalAutoDomain.map(numberize), "autodomained as expected");
      });
    });

    describe("Domain constraints with domainMin() and domainMax()", () => {
      let scale: Plottable.Scales.Time;

      beforeEach(() => {
        scale = new Plottable.Scales.Time();
      });

      it("can force the minimum of the domain with domainMin()", () => {
        scale.padProportion(0);
        const requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const minBelowBottom = new Date("2015-04-01");
        assert.strictEqual(scale.domainMin(minBelowBottom), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMin().getTime(), minBelowBottom.getTime(), "can get domainMin()");
        assert.strictEqual(scale.domain()[0].getTime(), minBelowBottom.getTime(), "lower end of domain was set by domainMin()");

        const minInMiddle = new Date("2015-06-01");
        scale.domainMin(minInMiddle);
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(),
          "lower end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
        assert.strictEqual(scale.domainMin().getTime(), scale.domain()[0].getTime(),
          "returns autoDomain()-ed min value after autoDomain()-ing");

        const minEqualTop = scale.domain()[1];
        const nextDay = new Date("2015-07-02");
        scale.domainMin(minEqualTop);
        const domain = scale.domain();
        assert.strictEqual(domain[0].getTime(), minEqualTop.getTime(),
          "lower end was set even if requested value is >= autoDomain()-ed max");
        assert.strictEqual(domain[1].getTime(), nextDay.getTime(), "upper end is set one day later");
      });

      it("does not change domainMin() after adding more included values providers", () => {
        scale.padProportion(0);
        const requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const minInMiddle = new Date("2015-06-01");

        assert.strictEqual(scale.domain()[0].getTime(), requestedDomain[0].getTime(), "domain minimum is the minimum value");
        scale.domainMin(minInMiddle);
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(), "can set domain minimum with domainMin()");

        const requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain2);
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(), "adding IncludedValuesProvider doesn't change domainMin()");
      });

      it("can force the maximum of the domain with domainMax()", () => {
        scale.padProportion(0);
        const requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const maxAboveTop = new Date("2015-08-01");
        assert.strictEqual(scale.domainMax(maxAboveTop), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMax().getTime(), maxAboveTop.getTime(), "can get domainMax()");
        assert.strictEqual(scale.domain()[1].getTime(), maxAboveTop.getTime(), "upper end of domain was set by domainMax()");

        const maxInMiddle = new Date("2015-06-01");
        scale.domainMax(maxInMiddle);
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(),
          "upper end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
        assert.strictEqual(scale.domainMax().getTime(), scale.domain()[1].getTime(),
          "returns autoDomain()-ed max value after autoDomain()-ing");

        const maxEqualBottom = new Date("2015-05-01");
        const dayBefore = new Date("2015-04-30");
        scale.domainMax(maxEqualBottom);
        const domain = scale.domain();
        assert.strictEqual(domain[1].getTime(), maxEqualBottom.getTime(),
          "upper end was set even if requested value is <= autoDomain()-ed min");
        assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "lower end is set one day before");
      });

      it("does not change domainMax() after adding more included values providers", () => {
        scale.padProportion(0);
        const requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const maxInMiddle = new Date("2015-06-01");

        assert.strictEqual(scale.domain()[1].getTime(), requestedDomain[1].getTime(), "domain maximum is the maximum value");
        scale.domainMax(maxInMiddle);
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(), "can set domain maximum with domainMax()");

        const requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
        scale.addIncludedValuesProvider((_scale) => requestedDomain2);
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(),
          "adding another ExtentsProvider doesn't change domainMax()");
      });

      it("can force the domain by using domainMin() and domainMax() together", () => {
        scale.padProportion(0);
        const requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const desiredMin = new Date("2015-04-01");
        const desiredMax = new Date("2015-06-01");
        assert.deepEqual(scale.domain(), requestedDomain, "there are no initial constraings");
        scale.domainMin(desiredMin);
        scale.domainMax(desiredMax);
        assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "autoDomaining overwrites the domain constraints");
      });

      it.skip("cannot invert the domain using domainMin() or domainMax()", () => {
        scale.padProportion(0);
        const requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        const bigMin = new Date("2015-08-01");
        const smallMax = new Date("2015-04-01");

        assert.deepEqual(scale.domain(), requestedDomain, "initial domain is set");
        scale.domainMin(bigMin);
        (<any>assert).throws(() => scale.domainMax(smallMax), Error, "domain values must be in chronological order",
          "cannot invert the domain using domainMax()");
        assert.deepEqual(scale.domain(), requestedDomain, "scale domain did not change");

        scale.domainMax(smallMax);
        (<any>assert).throws(() => scale.domainMin(bigMin), Error, "domain values must be in chronological order",
          "cannot invert the domain using domainMin()");
        assert.deepEqual(scale.domain(), requestedDomain, "scale domain did not change");
      });
    });

  });
});
