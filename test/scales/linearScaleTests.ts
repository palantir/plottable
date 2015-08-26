///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Linear Scale", () => {

    describe("Basic usage", () => {
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("can set domain and range", () => {
        assert.deepEqual(scale.domain(), [0, 1], "the domain defaults to [0, 1]");
        assert.deepEqual(scale.range(), [0, 1], "the range defaults to [0, 1]");

        assert.strictEqual(scale.domain([5, 6]), scale, "setting the domain returns the scale");
        assert.strictEqual(scale.range([6, 7]), scale, "setting the range returns the scale");

        assert.deepEqual(scale.domain(), [5, 6], "the domain has been set");
        assert.deepEqual(scale.range(), [6, 7], "the range has been set");

        scale.domain([6, 5]);
        scale.range([7, 6]);
        assert.deepEqual(scale.domain(), [6, 5], "the domain can be unordered");
        assert.deepEqual(scale.range(), [7, 6], "the range can be unordered");
      });

      it("maps domain to range in a linear fashion", () => {
        scale.domain([10, 20]);
        scale.range([400, 500]);
        assert.strictEqual(scale.scale(10), 400, "first value in domain maps to first value in range");
        assert.strictEqual(scale.scale(20), 500, "last value in domain maps to last value in range");
        assert.strictEqual(scale.scale(15), 450, "middle value in domain maps to middle value in range");

        assert.strictEqual(scale.invert(400), 10, "first value in range maps to first value in domain");
        assert.strictEqual(scale.invert(500), 20, "last value in range maps to last value in domain");
        assert.strictEqual(scale.invert(450), 15, "middle value in range maps to middle value in domain");

        scale.domain([20, 10]);
        assert.strictEqual(scale.scale(10), 500, "first value in flipped domain maps to first value in range");
        assert.strictEqual(scale.scale(20), 400, "last value in flipped domain maps to last value in range");
        assert.strictEqual(scale.scale(15), 450, "middle value in flipped domain maps to middle value in range");

        assert.strictEqual(scale.invert(400), 20, "first value in range maps to first value in flipped domain");
        assert.strictEqual(scale.invert(500), 10, "last value in range maps to last value in flipped domain");
        assert.strictEqual(scale.invert(450), 15, "middle value in range maps to middle value in flipped domain");
      });

      it("filters out invalid numbers when using extentOfValues()", () => {
        let arrayWithBadValues: any[] = [null, NaN, undefined, Infinity, -Infinity, "a string", 1, 1.2];
        let expectedExtent = [1, 1.2];
        let extent = scale.extentOfValues(arrayWithBadValues);
        assert.deepEqual(extent, expectedExtent, "invalid values were filtered out");
      });

      it("does not accept NaN or Infinity as domain", () => {
        scale.domain([1, 2]);
        scale.domain([5, Infinity]);
        assert.deepEqual(scale.domain(), [1, 2], "Infinity containing domain was ignored");
        scale.domain([-Infinity, 5]);
        assert.deepEqual(scale.domain(), [1, 2], "-Infinity containing domain was ignored");
        scale.domain([NaN, 7]);
        assert.deepEqual(scale.domain(), [1, 2], "NaN containing domain was ignored");
        scale.domain([-1, 5]);
        assert.deepEqual(scale.domain(), [-1, 5], "Regular domains still accepted");
      });

      it("accepts NaN or Infinity as range", () => {
        scale.range([5, Infinity]);
        assert.deepEqual(scale.range(), [5, Infinity], "Infinity accepted as part of range");
        scale.range([-Infinity, 5]);
        assert.deepEqual(scale.range(), [-Infinity, 5], "-Infinity accepted as part of range");
        scale.range([NaN, 7]);
        assert.deepEqual(scale.range(), [NaN, 7], "NaN accepted as part of range");
      });
    });

    describe("Auto Domaining", () => {
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("auto domains by default", () => {
        assert.deepEqual(scale.domain(), [0, 1], "the default domain is [0, 1]");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), [0, 1], "the domain is still [0, 1]");
      });

      it("expands single value domains to [value - 1, value + 1] when auto domaining", () => {
        let singleValue = 15;
        scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => [singleValue]);
        assert.deepEqual(scale.domain(), [singleValue - 1, singleValue + 1], "single-value extent was expanded");
      });

      it("can force the minimum of the domain with domainMin()", () => {
        scale.padProportion(0);
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider((scale) => requestedDomain);

        let minBelowBottom = -10;
        assert.strictEqual(scale.domainMin(minBelowBottom), scale, "the scale is returned by the setter");
        assert.strictEqual(scale.domainMin(), minBelowBottom, "can get the domainMin");
        assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");

        let minInMiddle = 0;
        scale.domainMin(minInMiddle);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]], "lower end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
        assert.strictEqual(scale.domainMin(), scale.domain()[0], "returns autoDomain()-ed min value after autoDomain()-ing");

        let minEqualTop = scale.domain()[1];
        scale.domainMin(minEqualTop);
        assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop + 1],
          "domain is set to [min, min + 1] if the requested value is >= to autoDomain()-ed max value");

        scale.domainMin(minInMiddle);
        let requestedDomain2 = [-10, 10];
        scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain2);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]],
          "adding new IncludedValuesProvider doesn't change domainMin()");
      });

      it("can force the maximum of the domain with domainMax()", () => {
        scale.padProportion(0);
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider((scale) => requestedDomain);

        let maxAboveTop = 10;
        assert.strictEqual(scale.domainMax(maxAboveTop), scale, "the scale is returned by the setter");
        assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");
        assert.strictEqual(scale.domainMax(), maxAboveTop, "returns the set maximum value");

        let maxInMiddle = 0;
        scale.domainMax(maxInMiddle);
        assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle], "upper end was set even if requested value cuts off some data");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
        assert.strictEqual(scale.domainMax(), scale.domain()[1], "returns autoDomain()-ed max value after autoDomain()-ing");

        let maxEqualBottom = scale.domain()[0];
        scale.domainMax(maxEqualBottom);
        assert.deepEqual(scale.domain(), [maxEqualBottom - 1, maxEqualBottom],
          "domain is set to [max - 1, max] if the requested value is <= to autoDomain()-ed min value");

        scale.domainMax(maxInMiddle);
        let requestedDomain2 = [-10, 10];
        scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain2);
        assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle],
          "adding another IncludedValuesProvider doesn't change domainMax()");
      });

      it("can force the domain by using domainMin() and domainMax() together", () => {
        scale.padProportion(0);
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider((scale) => requestedDomain);

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
        assert.deepEqual(scale.domain(), [bigMin, smallMax], "setting both is allowed even if it reverses the domain");
      });
    });

    describe("Domain snapping", () => {
      it("domain snapping setter and getter", () => {
        let scale = new Plottable.Scales.Linear();

        assert.strictEqual(scale.snappingDomainEnabled(), true, "scales make their domain snap by default");
        assert.strictEqual(scale.snappingDomainEnabled(false), scale, "setting disabling domain snapping returns the scale");
        assert.strictEqual(scale.snappingDomainEnabled(), false, "the domain is no longer snaps");
      });

      it("domain snapping works", () => {
        let scale = new Plottable.Scales.Linear();
        scale.addIncludedValuesProvider(function() {
          return [1.123123123, 3.123123123];
        });

        assert.deepEqual(scale.domain(), [1, 3.2], "domain snapping works");
        scale.snappingDomainEnabled(false);
        assert.deepEqual(scale.domain(), [1.073123123, 3.173123123], "domain snapping can be deactivated");
        scale.snappingDomainEnabled(true);
        assert.deepEqual(scale.domain(), [1, 3.2], "domain snapping can be activated back");
      });

      it("custom tick generator", () => {
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        let defaultTicks = scale.ticks();
        assert.closeTo(defaultTicks.length, 10, 1, "ticks were generated correctly with default generator");
        scale.tickGenerator((scale) => scale.defaultTicks().filter(tick => tick % 3 === 0));
        let customTicks = scale.ticks();
        assert.deepEqual(customTicks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
      });
    });

    describe("Padding exceptions", () => {
      it("addPaddingExceptionsProvider() works as expected on one end", () => {
        let scale = new Plottable.Scales.Linear();
        scale.addIncludedValuesProvider(() => [10, 13]);
        assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is padded");

        scale.addPaddingExceptionsProvider(() => [11]);
        assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is not changed");

        scale.addPaddingExceptionsProvider(() => [10]);
        assert.strictEqual(scale.domain()[0], 10, "The left side of the domain is no longer padded");
      });

      it("addPaddingExceptionsProvider() works as expected on both ends", () => {
        let scale = new Plottable.Scales.Linear();
        scale.addIncludedValuesProvider(() => [10, 13]);
        assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded");

        scale.addPaddingExceptionsProvider(() => [0.9, 11, 12, 13.5]);
        assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain padding has not changed");

        scale.addPaddingExceptionsProvider(() => [13]);
        assert.deepEqual(scale.domain(), [9.5, 13], "The right side of the domain is no longer padded");

        scale.addPaddingExceptionsProvider(() => [10, 13]);
        assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");
      });

      it("removePaddingExceptionsProvider() works as expected", () => {
        let scale = new Plottable.Scales.Linear();
        scale.addIncludedValuesProvider(() => [10, 13]);

        let paddingExceptionProviderLeft = () => [10];
        let paddingExceptionProviderBoth = () => [10, 13];

        assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded");

        scale.addPaddingExceptionsProvider(paddingExceptionProviderLeft);
        assert.deepEqual(scale.domain(), [10, 13.5], "The left side of the domain is no longer padded");

        scale.addPaddingExceptionsProvider(paddingExceptionProviderBoth);
        assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");

        scale.removePaddingExceptionsProvider(paddingExceptionProviderBoth);
        assert.deepEqual(scale.domain(), [10, 13.5], "The left side of domain is still padded, right is not");

        scale.removePaddingExceptionsProvider(paddingExceptionProviderLeft);
        assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded again");

        scale.addPaddingExceptionsProvider(paddingExceptionProviderLeft);
        scale.addPaddingExceptionsProvider(paddingExceptionProviderBoth);
        assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");

        scale.addPaddingExceptionsProvider(paddingExceptionProviderLeft);
        assert.deepEqual(scale.domain(), [10, 13], "The domain is still no longer padded");
      });
    });

    describe("Autoranging behavior", () => {
      let data: any[];
      let dataset: Plottable.Dataset;
      let scale: Plottable.Scales.Linear;
      beforeEach(() => {
        data = [{foo: 2, bar: 1}, {foo: 5, bar: -20}, {foo: 0, bar: 0}];
        dataset = new Plottable.Dataset(data);
        scale = new Plottable.Scales.Linear();
        scale.padProportion(0);
      });

      it("scale autoDomain flag is not overwritten without explicitly setting the domain", () => {
        scale.addIncludedValuesProvider((scale: Plottable.Scale<number, number>) => d3.extent(data, (e) => e.foo));
        assert.isTrue((<any> scale)._autoDomainAutomatically,
                            "the autoDomain flag is still set after autoranginging and padding and nice-ing");
        scale.domain([0, 5]);
        assert.isFalse((<any> scale)._autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
      });

      it("scale autorange works as expected with single dataset", () => {
        let svg = TestMethods.generateSVG(100, 100);
        let plot = new Plottable.Plot();
        (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
        plot.addDataset(dataset)
            .attr("x", (d) => d.foo, scale)
            .renderTo(svg);
        assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
        data.push({foo: 100, bar: 200});
        dataset.data(data);
        assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
        svg.remove();
      });

      it("scale reference counting works as expected", () => {
        let svg1 = TestMethods.generateSVG(100, 100);
        let svg2 = TestMethods.generateSVG(100, 100);
        let renderer1 = new Plottable.Plot();
        (<any> renderer1)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
        renderer1.addDataset(dataset).attr("x", (d) => d.foo, scale);
        renderer1.renderTo(svg1);
        let renderer2 = new Plottable.Plot();
        (<any> renderer2)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
        renderer2.addDataset(dataset).attr("x", (d) => d.foo, scale);
        renderer2.renderTo(svg2);
        let otherScale = new Plottable.Scales.Linear();
        renderer1.attr("x", (d) => d.foo, otherScale);
        dataset.data([{foo: 10}, {foo: 11}]);
        assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataset after one perspective deregistered");
        renderer2.attr("x", (d) => d.foo, otherScale);
        // "scale not listening to the dataset after all perspectives removed"
        dataset.data([{foo: 99}, {foo: 100}]);
        assert.deepEqual(scale.domain(), [0, 1], "scale shows default values when all perspectives removed");
        svg1.remove();
        svg2.remove();
      });

      it("addIncludedValuesProvider()", () => {
        scale.addIncludedValuesProvider((scale: Plottable.Scale<number, number>) => [0, 10]);
        assert.deepEqual(scale.domain(), [0, 10], "scale domain accounts for first provider");

        scale.addIncludedValuesProvider((scale: Plottable.Scale<number, number>) => [-10, 0]);
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for second provider");
      });

      it("removeIncludedValuesProvider()", () => {
        let posProvider = (scale: Plottable.Scale<number, number>) => [0, 10];
        scale.addIncludedValuesProvider(posProvider);
        let negProvider = (scale: Plottable.Scale<number, number>) => [-10, 0];
        scale.addIncludedValuesProvider(negProvider);
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for both providers");

        scale.removeIncludedValuesProvider(negProvider);
        assert.deepEqual(scale.domain(), [0, 10], "scale domain only accounts for remaining provider");
      });

      it("should resize when a plot is removed", () => {
        let svg = TestMethods.generateSVG(400, 400);
        let ds1 = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
        let ds2 = new Plottable.Dataset([{x: 1, y: 1}, {x: 2, y: 2}]);
        let xScale = new Plottable.Scales.Linear();
        xScale.padProportion(0);
        let yScale = new Plottable.Scales.Linear();
        yScale.padProportion(0);
        let renderAreaD1 = new Plottable.Plots.Line();
        renderAreaD1.addDataset(ds1);
        renderAreaD1.x((d) => d.x, xScale);
        renderAreaD1.y((d) => d.y, yScale);
        let renderAreaD2 = new Plottable.Plots.Line();
        renderAreaD2.addDataset(ds2);
        renderAreaD2.x((d) => d.x, xScale);
        renderAreaD2.y((d) => d.y, yScale);
        let renderAreas = new Plottable.Components.Group([renderAreaD1, renderAreaD2]);
        renderAreas.renderTo(svg);
        assert.deepEqual(xScale.domain(), [0, 2]);
        renderAreaD1.detach();
        assert.deepEqual(xScale.domain(), [1, 2], "resize on plot.detach()");
        renderAreas.append(renderAreaD1);
        assert.deepEqual(xScale.domain(), [0, 2], "resize on plot.merge()");
        svg.remove();
      });
    });
  });
});
