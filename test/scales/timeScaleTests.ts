///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("TimeScale tests", () => {

    describe("Basic Usage", () => {
      let scale: Plottable.Scales.Time;

      beforeEach(() => {
        scale = new Plottable.Scales.Time();
      });

      it("calculates the correct extent", () => {
        let date1 = new Date(2015, 2, 25, 19, 0, 0);
        let date2 = new Date(2015, 2, 24, 19, 0, 0);
        let date3 = new Date(2015, 2, 25, 19, 0, 0);
        let date4 = new Date(2015, 2, 26, 19, 0, 0);
        let values = [date1, date2, date3, date4];

        let computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, [date2, date4], "The extent is the miminum and the maximum value in the domain");
      });

      it.skip("ignores invalid values when calculating the extent", () => {
        let expectedExtent = [new Date("2015-06-05"), new Date("2015-06-04")];
        let arrayWithBadValues: any = [
          null,
          NaN,
          undefined,
          Infinity,
          -Infinity,
          "a string",
          0,
          expectedExtent[0],
          expectedExtent[1]
        ];
        let extent = scale.extentOfValues(arrayWithBadValues);
        assert.strictEqual(extent[0].getTime(), expectedExtent[0].getTime(), "returned correct min");
        assert.strictEqual(extent[1].getTime(), expectedExtent[1].getTime(), "returned correct max");
      });

      it("can be padded", () => {
        scale.padProportion(0);
        let unpaddedDomain = scale.domain();
        scale.addIncludedValuesProvider(() => unpaddedDomain);
        scale.padProportion(0.1);
        assert.operator(scale.domain()[0].getTime(), "<", unpaddedDomain[0].getTime(), "left side of domain was padded");
        assert.operator(scale.domain()[1].getTime(), ">", unpaddedDomain[1].getTime(), "right side of domain was padded");
      });

      it("respects padding exceptions", () => {
        let minValue = new Date(2000, 5, 4);
        let maxValue = new Date(2000, 5, 6);
        scale.addIncludedValuesProvider(() => [minValue, maxValue]);
        assert.operator(scale.domain()[0].getTime(), "<", minValue.getTime(), "left side of domain is normally padded");
        assert.operator(scale.domain()[1].getTime(), ">", maxValue.getTime(), "right side of domain is normally padded");
        scale.addPaddingExceptionsProvider(() => [minValue]);
        assert.strictEqual(scale.domain()[0].getTime(), minValue.getTime(),
          "left side of domain isn't padded if it matches the exception");
        let maxValuePaddingException = () => [maxValue];
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
        let yearTicks = scale.tickInterval(Plottable.TimeInterval.year);
        assert.strictEqual(yearTicks.length, 101, "generated correct number of ticks for 100 year span, every year");
        // 1 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
        let monthTicks = scale.tickInterval(Plottable.TimeInterval.month);
        assert.strictEqual(monthTicks.length, 12, "generated correct number of ticks for 1 year span, every month");
        let threeMonthTicks = scale.tickInterval(Plottable.TimeInterval.month, 3);
        assert.strictEqual(threeMonthTicks.length, 4, "generated correct number of ticks for 1 year span, every 3 months");
        // 1 month span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
        let dayTicks = scale.tickInterval(Plottable.TimeInterval.day);
        assert.strictEqual(dayTicks.length, 32, "generated correct number of ticks for 1 month span, every day");
        // 1 day span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
        let hourTicks = scale.tickInterval(Plottable.TimeInterval.hour);
        assert.strictEqual(hourTicks.length, 24, "generated correct number of ticks for 1 day span, every hour");
        // 1 hour span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
        let minuteTicks = scale.tickInterval(Plottable.TimeInterval.minute);
        assert.strictEqual(minuteTicks.length, 61, "generated correct number of ticks for 1 hour span, every minute");
        let tenMinuteTicks = scale.tickInterval(Plottable.TimeInterval.minute, 10);
        assert.strictEqual(tenMinuteTicks.length, 7, "generated correct number of ticks for 1 hour span, every 10 minutes");
        // 1 minute span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
        let secondTicks = scale.tickInterval(Plottable.TimeInterval.second);
        assert.strictEqual(secondTicks.length, 61, "generated correct number of ticks for 1 minute span, every second");
      });
    });

    describe("Auto Domaining", () => {
      let scale: Plottable.Scales.Time;

      beforeEach(() => {
        scale = new Plottable.Scales.Time();
      });

      it("expands single value domains to [value - 1, value + 1] when auto domaining", () => {
        let singleValue = new Date(2000, 5, 5);
        let dayBefore = new Date(2000, 5, 4);
        let dayAfter = new Date(2000, 5, 6);
        scale.addIncludedValuesProvider(() => [singleValue]);
        scale.autoDomain();
        let domain = scale.domain();
        assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "left side of domain was expaded by one day");
        assert.strictEqual(domain[1].getTime(), dayAfter.getTime(), "right side of domain was expaded by one day");
      });

      it("can force the minimum of the domain with domainMin()", () => {
        scale.padProportion(0);
        let requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        let minBelowBottom = new Date("2015-04-01");
        assert.strictEqual(scale.domainMin(minBelowBottom), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMin().getTime(), minBelowBottom.getTime(), "can get domainMin");
        assert.strictEqual(scale.domain()[0].getTime(), minBelowBottom.getTime(), "lower end of domain was set by domainMin()");
        assert.strictEqual(scale.domainMin().getTime(), minBelowBottom.getTime(), "returns the set minimum value");

        let minInMiddle = new Date("2015-06-01");
        scale.domainMin(minInMiddle);
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(),
          "lower end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
        assert.strictEqual(scale.domainMin().getTime(), scale.domain()[0].getTime(),
          "returns autoDomain()-ed min value after autoDomain()-ing");

        let minEqualTop = scale.domain()[1];
        let nextDay = new Date("2015-07-02");
        scale.domainMin(minEqualTop);
        let domain = scale.domain();
        assert.strictEqual(domain[0].getTime(), minEqualTop.getTime(),
          "lower end was set even if requested value is >= autoDomain()-ed max");
        assert.strictEqual(domain[1].getTime(), nextDay.getTime(), "upper end is set one day later");

        scale.domainMin(minInMiddle);
        let requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain2);
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(),
          "adding another ExtentsProvider doesn't change domainMin()");
      });

      it("can force the maximum of the domain with domainMax()", () => {
        scale.padProportion(0);
        let requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        let maxAboveTop = new Date("2015-08-01");
        assert.strictEqual(scale.domainMax(maxAboveTop), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMax().getTime(), maxAboveTop.getTime(), "can get domainMax");
        assert.strictEqual(scale.domain()[1].getTime(), maxAboveTop.getTime(), "upper end of domain was set by domainMax()");
        assert.strictEqual(scale.domainMax().getTime(), maxAboveTop.getTime(), "returns the set maximum value");

        let maxInMiddle = new Date("2015-06-01");
        scale.domainMax(maxInMiddle);
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(),
          "upper end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
        assert.strictEqual(scale.domainMax().getTime(), scale.domain()[1].getTime(),
          "returns autoDomain()-ed max value after autoDomain()-ing");

        let maxEqualBottom = new Date("2015-05-01");
        let dayBefore = new Date("2015-04-30");
        scale.domainMax(maxEqualBottom);
        let domain = scale.domain();
        assert.strictEqual(domain[1].getTime(), maxEqualBottom.getTime(),
          "upper end was set even if requested value is <= autoDomain()-ed min");
        assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "lower end is set one day before");

        scale.domainMax(maxInMiddle);
        let requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
        scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => requestedDomain2);
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(),
          "adding another ExtentsProvider doesn't change domainMax()");
      });

      it("can force the domain by using domainMin() and domainMax() together", () => {
        scale.padProportion(0);
        let requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(() => requestedDomain);

        let desiredMin = new Date("2015-04-01");
        let desiredMax = new Date("2015-06-01");
        assert.deepEqual(scale.domain(), requestedDomain, "there are no initial constraings");
        scale.domainMin(desiredMin);
        scale.domainMax(desiredMax);
        assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "autoDomaining overwrites the domain constraints");
        let bigMin = new Date("2015-08-01");
        let smallMax = new Date("2015-04-01");
        scale.domainMin(bigMin);
        (<any>assert).throws(() => scale.domainMax(smallMax), Error, "domain values must be in chronological order",
          "cannot invert the domain using domainMax()");

        scale.autoDomain();
        scale.domainMax(smallMax);
        (<any>assert).throws(() => scale.domainMin(bigMin), Error, "domain values must be in chronological order",
          "cannot invert the domain using domainMin()");
      });
    });

  });
});
