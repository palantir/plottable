///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Linear Scales", () => {
    it("extentOfValues() filters out invalid numbers", () => {
      var scale = new Plottable.Scales.Linear();
      var expectedExtent = [0, 1];
      var arrayWithBadValues: any[] = [null, NaN, undefined, Infinity, -Infinity, "a string", 0, 1];
      var extent = scale.extentOfValues(arrayWithBadValues);
      assert.deepEqual(extent, expectedExtent, "invalid values were filtered out");
    });

    it("autoDomain() defaults to [0, 1]", () => {
      var scale = new Plottable.Scales.Linear();
      scale.autoDomain();
      var d = scale.domain();
      assert.strictEqual(d[0], 0);
      assert.strictEqual(d[1], 1);
    });

    it("autoDomain() expands single value to [value - 1, value + 1]", () => {
      var scale = new Plottable.Scales.Linear();
      var singleValue = 15;
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => [singleValue, singleValue]);
      assert.deepEqual(scale.domain(), [singleValue - 1, singleValue + 1], "single-value extent was expanded");
    });

    it("domainMin()", () => {
      var scale = new Plottable.Scales.Linear();
      scale.padProportion(0);
      var requestedDomain = [-5, 5];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain);

      var minBelowBottom = -10;
      scale.domainMin(minBelowBottom);
      assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");
      assert.strictEqual(scale.domainMin(), minBelowBottom, "returns the set minimum value");

      var minInMiddle = 0;
      scale.domainMin(minInMiddle);
      assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]], "lower end was set even if requested value cuts off some data");

      scale.autoDomain();
      assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
      assert.strictEqual(scale.domainMin(), scale.domain()[0], "returns autoDomain()-ed min value after autoDomain()-ing");

      var minEqualTop = scale.domain()[1];
      scale.domainMin(minEqualTop);
      assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop + 1],
        "domain is set to [min, min + 1] if the requested value is >= to autoDomain()-ed max value");

      scale.domainMin(minInMiddle);
      var requestedDomain2 = [-10, 10];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain2);
      assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
    });

    it("domainMax()", () => {
      var scale = new Plottable.Scales.Linear();
      scale.padProportion(0);
      var requestedDomain = [-5, 5];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain);

      var maxAboveTop = 10;
      scale.domainMax(maxAboveTop);
      assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");
      assert.strictEqual(scale.domainMax(), maxAboveTop, "returns the set maximum value");

      var maxInMiddle = 0;
      scale.domainMax(maxInMiddle);
      assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle], "upper end was set even if requested value cuts off some data");

      scale.autoDomain();
      assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
      assert.strictEqual(scale.domainMax(), scale.domain()[1], "returns autoDomain()-ed max value after autoDomain()-ing");

      var maxEqualBottom = scale.domain()[0];
      scale.domainMax(maxEqualBottom);
      assert.deepEqual(scale.domain(), [maxEqualBottom - 1, maxEqualBottom],
        "domain is set to [max - 1, max] if the requested value is <= to autoDomain()-ed min value");

      scale.domainMax(maxInMiddle);
      var requestedDomain2 = [-10, 10];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain2);
      assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
    });

    it("domainMin() and domainMax() together", () => {
      var scale = new Plottable.Scales.Linear();
      scale.padProportion(0);
      var requestedDomain = [-5, 5];
      scale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => requestedDomain);

      var desiredMin = -10;
      var desiredMax = 10;
      scale.domainMin(desiredMin);
      scale.domainMax(desiredMax);
      assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");

      scale.autoDomain();
      var bigMin = 10;
      var smallMax = -10;
      scale.domainMin(bigMin);
      scale.domainMax(smallMax);
      assert.deepEqual(scale.domain(), [bigMin, smallMax], "setting both is allowed even if it reverse the domain");
    });

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
      scale.tickGenerator((scale) => scale.defaultTicks().filter(tick => tick % 3 === 0));
      ticks = scale.ticks();
      assert.deepEqual(ticks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
    });

    describe("Padding exceptions", () => {
      it("addPaddingExceptionsProvider() works as expected on one end", () => {
        var scale = new Plottable.Scales.Linear();
        scale.addIncludedValuesProvider(() => [10, 13]);
        assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is padded");

        scale.addPaddingExceptionsProvider(() => [11]);
        assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is not changed");

        scale.addPaddingExceptionsProvider(() => [10]);
        assert.strictEqual(scale.domain()[0], 10, "The left side of the domain is no longer padded");
      });

      it("addPaddingExceptionsProvider() works as expected on both ends", () => {
        var scale = new Plottable.Scales.Linear();
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
        var scale = new Plottable.Scales.Linear();
        scale.addIncludedValuesProvider(() => [10, 13]);

        var paddingExceptionProviderLeft = () => [10];
        var paddingExceptionProviderBoth = () => [10, 13];

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

    describe("autoranging behavior", () => {
      var data: any[];
      var dataset: Plottable.Dataset;
      var scale: Plottable.Scales.Linear;
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
        var svg = TestMethods.generateSVG(100, 100);
        var plot = new Plottable.Plot();
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
        var svg1 = TestMethods.generateSVG(100, 100);
        var svg2 = TestMethods.generateSVG(100, 100);
        var renderer1 = new Plottable.Plot();
        (<any> renderer1)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
        renderer1.addDataset(dataset).attr("x", (d) => d.foo, scale);
        renderer1.renderTo(svg1);
        var renderer2 = new Plottable.Plot();
        (<any> renderer2)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
        renderer2.addDataset(dataset).attr("x", (d) => d.foo, scale);
        renderer2.renderTo(svg2);
        var otherScale = new Plottable.Scales.Linear();
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
        var posProvider = (scale: Plottable.Scale<number, number>) => [0, 10];
        scale.addIncludedValuesProvider(posProvider);
        var negProvider = (scale: Plottable.Scale<number, number>) => [-10, 0];
        scale.addIncludedValuesProvider(negProvider);
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for both providers");

        scale.removeIncludedValuesProvider(negProvider);
        assert.deepEqual(scale.domain(), [0, 10], "scale domain only accounts for remaining provider");
      });

      it("should resize when a plot is removed", () => {
        var svg = TestMethods.generateSVG(400, 400);
        var ds1 = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
        var ds2 = new Plottable.Dataset([{x: 1, y: 1}, {x: 2, y: 2}]);
        var xScale = new Plottable.Scales.Linear();
        xScale.padProportion(0);
        var yScale = new Plottable.Scales.Linear();
        yScale.padProportion(0);
        var renderAreaD1 = new Plottable.Plots.Line();
        renderAreaD1.addDataset(ds1);
        renderAreaD1.x((d) => d.x, xScale);
        renderAreaD1.y((d) => d.y, yScale);
        var renderAreaD2 = new Plottable.Plots.Line();
        renderAreaD2.addDataset(ds2);
        renderAreaD2.x((d) => d.x, xScale);
        renderAreaD2.y((d) => d.y, yScale);
        var renderAreas = new Plottable.Components.Group([renderAreaD1, renderAreaD2]);
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
