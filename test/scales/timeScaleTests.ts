///<reference path="../testReference.ts" />

describe("TimeScale tests", () => {
    it.skip("extentOfValues() filters out invalid Dates", () => {
      let scale = new Plottable.Scales.Time();
      let expectedExtent = [new Date("2015-06-05"), new Date("2015-06-04")];
      let arrayWithBadValues: any[] = [null, NaN, undefined, Infinity, -Infinity, "a string",
        0, new Date("2015-06-05"), new Date("2015-06-04")];
      let extent = scale.extentOfValues(arrayWithBadValues);
      assert.strictEqual(extent[0].getTime(), expectedExtent[0].getTime(), "returned correct min");
      assert.strictEqual(extent[1].getTime(), expectedExtent[1].getTime(), "returned correct max");
    });

  it("can be padded", () => {
    let scale = new Plottable.Scales.Time();
    scale.padProportion(0);
    let unpaddedDomain = scale.domain();
    scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => unpaddedDomain);
    scale.padProportion(0.1);
    assert.operator(scale.domain()[0].getTime(), "<", unpaddedDomain[0].getTime(), "left side of domain was padded");
    assert.operator(scale.domain()[1].getTime(), ">", unpaddedDomain[1].getTime(), "right side of domain was padded");
  });

  it("respects padding exceptions", () => {
    let scale = new Plottable.Scales.Time();
    let minValue = new Date(2000, 5, 4);
    let maxValue = new Date(2000, 5, 6);
    scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => [minValue, maxValue]);
    scale.padProportion(0.1);
    assert.operator(scale.domain()[0].getTime(), "<", minValue.getTime(), "left side of domain is normally padded");
    assert.operator(scale.domain()[1].getTime(), ">", maxValue.getTime(), "right side of domain is normally padded");
    scale.addPaddingExceptionsProvider(() => [minValue]);
    assert.strictEqual(scale.domain()[0].getTime(), minValue.getTime(), "left side of domain isn't padded if it matches the exception");
    scale.addPaddingExceptionsProvider(() => [maxValue]);
    assert.strictEqual(scale.domain()[1].getTime(), maxValue.getTime(), "right side of domain isn't padded if it matches the exception");
  });

  it("autoDomain() expands single value to [value - 1 day, value + 1 day]", () => {
    let scale = new Plottable.Scales.Time();
    scale.padProportion(0);
    let singleValue = new Date(2000, 5, 5);
    let dayBefore = new Date(2000, 5, 4);
    let dayAfter = new Date(2000, 5, 6);
    scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => [singleValue, singleValue]);
    scale.autoDomain();
    let domain = scale.domain();
    assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "left side of domain was expaded by one day");
    assert.strictEqual(domain[1].getTime(), dayAfter.getTime(), "right side of domain was expaded by one day");
  });

  it("can't set reversed domain", () => {
    let scale = new Plottable.Scales.Time();
    assert.throws(() => scale.domain([new Date("1985-10-26"), new Date("1955-11-05")]), "chronological");
  });

  it("domainMin()", () => {
    let scale = new Plottable.Scales.Time();
    scale.padProportion(0);
    let requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
    scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => requestedDomain);

    let minBelowBottom = new Date("2015-04-01");
    scale.domainMin(minBelowBottom);
    assert.strictEqual(scale.domain()[0].getTime(), minBelowBottom.getTime(), "lower end of domain was set by domainMin()");
    assert.strictEqual(scale.domainMin().getTime(), minBelowBottom.getTime(), "returns the set minimum value");

    let minInMiddle = new Date("2015-06-01");
    scale.domainMin(minInMiddle);
    assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(), "lower end was set even if requested value cuts off some data");

    scale.autoDomain();
    assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
    assert.strictEqual(scale.domainMin().getTime(), scale.domain()[0].getTime(),
      "returns autoDomain()-ed min value after autoDomain()-ing");

    let minEqualTop = new Date("2015-07-01");
    let nextDay = new Date("2015-07-02");
    scale.domainMin(minEqualTop);
    let domain = scale.domain();
    assert.strictEqual(domain[0].getTime(), minEqualTop.getTime(),
      "lower end was set even if requested value is >= autoDomain()-ed max");
    assert.strictEqual(domain[1].getTime(), nextDay.getTime(), "upper end is set one day later");

    scale.domainMin(minInMiddle);
    let requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
    scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => requestedDomain2);
    assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(), "adding another ExtentsProvider doesn't change domainMin()");
  });

  it("domainMax()", () => {
    let scale = new Plottable.Scales.Time();
    scale.padProportion(0);
    let requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
    scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => requestedDomain);

    let maxAboveTop = new Date("2015-08-01");
    scale.domainMax(maxAboveTop);
    assert.strictEqual(scale.domain()[1].getTime(), maxAboveTop.getTime(), "upper end of domain was set by domainMax()");
    assert.strictEqual(scale.domainMax().getTime(), maxAboveTop.getTime(), "returns the set maximum value");

    let maxInMiddle = new Date("2015-06-01");
    scale.domainMax(maxInMiddle);
    assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(), "upper end was set even if requested value cuts off some data");

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
    assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(), "adding another ExtentsProvider doesn't change domainMax()");
  });

    it("domainMin() and domainMax() together", () => {
      let scale = new Plottable.Scales.Time();
      scale.padProportion(0);
    let requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Time) => requestedDomain);

      let desiredMin = new Date("2015-04-01");
      let desiredMax = new Date("2015-08-01");
      scale.domainMin(desiredMin);
      scale.domainMax(desiredMax);
      assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");

      scale.autoDomain();
      let bigMin = new Date("2015-08-01");
      let smallMax = new Date("2015-04-01");
      scale.domainMin(bigMin);
      assert.throws(() => scale.domainMax(smallMax), Error);

      scale.autoDomain();
      scale.domainMax(smallMax);
      assert.throws(() => scale.domainMin(bigMin), Error);
    });

  it("tickInterval produces correct number of ticks", () => {
    let scale = new Plottable.Scales.Time();
    // 100 year span
    scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
    let yearTicks = scale.tickInterval(Plottable.TimeInterval.year);
    assert.strictEqual(yearTicks.length, 101, "generated correct number of ticks");
    // 1 year span
    scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
    let monthTicks = scale.tickInterval(Plottable.TimeInterval.month);
    assert.strictEqual(monthTicks.length, 12, "generated correct number of ticks");
    let threeMonthTicks = scale.tickInterval(Plottable.TimeInterval.month, 3);
    assert.strictEqual(threeMonthTicks.length, 4, "generated correct number of ticks");
    // 1 month span
    scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
    let dayTicks = scale.tickInterval(Plottable.TimeInterval.day);
    assert.strictEqual(dayTicks.length, 32, "generated correct number of ticks");
    // 1 day span
    scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
    let hourTicks = scale.tickInterval(Plottable.TimeInterval.hour);
    assert.strictEqual(hourTicks.length, 24, "generated correct number of ticks");
    // 1 hour span
    scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
    let minuteTicks = scale.tickInterval(Plottable.TimeInterval.minute);
    assert.strictEqual(minuteTicks.length, 61, "generated correct number of ticks");
    let tenMinuteTicks = scale.tickInterval(Plottable.TimeInterval.minute, 10);
    assert.strictEqual(tenMinuteTicks.length, 7, "generated correct number of ticks");
    // 1 minute span
    scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
    let secondTicks = scale.tickInterval(Plottable.TimeInterval.second);
    assert.strictEqual(secondTicks.length, 61, "generated correct number of ticks");
  });
});
