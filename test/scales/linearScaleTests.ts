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
      });

      it("can have a reversed domain", () => {
        scale.domain([20, 10]);
        scale.range([400, 500]);
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
        let warningCalled = false;
        let oldWarn = Plottable.Utils.Window.warn;
        Plottable.Utils.Window.warn = (msg: string) => {
          if (msg.indexOf("NaN or Infinity") > -1) {
            warningCalled = true;
          }
        };

        scale.domain([1, 2]);
        assert.deepEqual(scale.domain(), [1, 2], "initial domain is set");

        warningCalled = false;
        scale.domain([5, Infinity]);
        assert.deepEqual(scale.domain(), [1, 2], "Infinity containing domain was ignored");
        assert.isTrue(warningCalled, "a warning was thrown for setting domain to Infinity");

        warningCalled = false;
        scale.domain([-Infinity, 5]);
        assert.deepEqual(scale.domain(), [1, 2], "-Infinity containing domain was ignored");
        assert.isTrue(warningCalled, "a warning was thrown for setting domain to -Infinity");

        warningCalled = false;
        scale.domain([NaN, 7]);
        assert.deepEqual(scale.domain(), [1, 2], "NaN containing domain was ignored");
        assert.isTrue(warningCalled, "a warning was thrown for setting domain to NaN");

        warningCalled = false;
        scale.domain([-1, 5]);
        assert.deepEqual(scale.domain(), [-1, 5], "Regular domains still accepted");
        assert.isFalse(warningCalled, "a warning is not thrown when correct domains are given");

        Plottable.Utils.Window.warn = oldWarn;
      });

      it("accepts NaN or Infinity as range", () => {
        scale.range([5, Infinity]);
        assert.deepEqual(scale.range(), [5, Infinity], "Infinity accepted as part of range");
        scale.range([-Infinity, 5]);
        assert.deepEqual(scale.range(), [-Infinity, 5], "-Infinity accepted as part of range");
        scale.range([NaN, 7]);
        assert.deepEqual(scale.range(), [NaN, 7], "NaN accepted as part of range");
      });

      it("can receive custom tick generator", () => {
        scale.domain([0, 10]);
        let defaultTicks = scale.ticks();
        assert.strictEqual(defaultTicks.length, 11, "ticks were generated correctly with default generator");
        assert.deepEqual(defaultTicks, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "all numbers from 0 to 10 were generated");
        scale.tickGenerator((_scale) => scale.defaultTicks().filter(tick => tick % 3 === 0));
        let customTicks = scale.ticks();
        assert.deepEqual(customTicks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
      });
    });

    describe("Auto Domaining", () => {
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("has a default domain of [0, 1]", () => {
        assert.deepEqual(scale.domain(), [0, 1], "the default domain is [0, 1]");

        scale.autoDomain();
        assert.deepEqual(scale.domain(), [0, 1], "the domain is still [0, 1]");
      });

      it("auto domains upon request", () => {
        scale.padProportion(0);

        assert.deepEqual(scale.domain(), [0, 1], "Default domain is [0, 1]");
        scale.addIncludedValuesProvider(() => [4, 6]);
        assert.deepEqual(scale.domain(), [4, 6], "auto domains by default");

        assert.strictEqual(scale.domain([7, 8]), scale, "Setting the domain explicitly returns the scale");
        assert.deepEqual(scale.domain(), [7, 8], "setting the domain explicitly stops autoDomaining");

        scale.addIncludedValuesProvider(() => [4, 6]);
        assert.deepEqual(scale.domain(), [7, 8], "adding new values providers does not trigger autoDomain");

        assert.strictEqual(scale.autoDomain(), scale, "setting the autoDomain returns the scale");
        assert.deepEqual(scale.domain(), [4, 6], "triggering the autoDomain overrides the manually inputted domain");
      });

      it("accounts for included values providers", () => {
        scale.padProportion(0);

        assert.deepEqual(scale.domain(), [0, 1], "the default domain is [0, 1]");

        scale.addIncludedValuesProvider((_scale) => [0, 10]);
        assert.deepEqual(scale.domain(), [0, 10], "scale domain accounts for first provider");

        scale.addIncludedValuesProvider((_scale) => [-10, 0]);
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for second provider");
      });

      it("can remove included values providers", () => {
        scale.padProportion(0);

        assert.deepEqual(scale.domain(), [0, 1], "the default domain is [0, 1]");

        let posProvider = () => [0, 10];
        assert.strictEqual(scale.addIncludedValuesProvider(posProvider), scale,
          "Adding an included values provider returns the scale");
        let negProvider = () => [-10, 0];
        scale.addIncludedValuesProvider(negProvider);
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for both providers");

        assert.strictEqual(scale.removeIncludedValuesProvider(negProvider), scale,
          "Removing an included values provider returns the scale");
        assert.deepEqual(scale.domain(), [0, 10], "scale domain only accounts for remaining provider");

        scale.removeIncludedValuesProvider(posProvider);
        assert.deepEqual(scale.domain(), [0, 1], "scale defaults back to the [0, 1] domain when all value providers are removed");
      });

      it("doesn't lock up if a zero-width domain is set while there are value providers and padding", () => {
        scale.padProportion(0.1);
        const provider = () => [0, 1];
        scale.addIncludedValuesProvider(provider);
        scale.autoDomain();
        const originalAutoDomain = scale.domain();

        scale.domain([0, 0]);
        scale.autoDomain();

        assert.deepEqual(scale.domain(), originalAutoDomain, "autodomained as expected");
      });

      it("expands single value domains to [value - 1, value + 1] when auto domaining", () => {
        let singleValue = 15;
        scale.addIncludedValuesProvider((_scale) => [singleValue]);
        assert.deepEqual(scale.domain(), [singleValue - 1, singleValue + 1], "single-value extent was expanded");
      });

      it("can force the minimum of the domain with domainMin()", () => {
        scale.padProportion(0);
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider((_scale) => requestedDomain);

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
        scale.addIncludedValuesProvider((_scale) => requestedDomain2);
        assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]],
          "adding new IncludedValuesProvider doesn't change domainMin()");
      });

      it("can force the maximum of the domain with domainMax()", () => {
        scale.padProportion(0);
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider((_scale) => requestedDomain);

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
        scale.addIncludedValuesProvider((_scale) => requestedDomain2);
        assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle],
          "adding another IncludedValuesProvider doesn't change domainMax()");
      });

      it("can force the domain by using domainMin() and domainMax() together", () => {
        scale.padProportion(0);
        let requestedDomain = [-5, 5];
        scale.addIncludedValuesProvider((_scale) => requestedDomain);

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
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("can set domain snapping", () => {
        assert.strictEqual(scale.snappingDomainEnabled(), true, "scales make their domain snap by default");
        assert.strictEqual(scale.snappingDomainEnabled(false), scale, "setting disabling domain snapping returns the scale");
        assert.strictEqual(scale.snappingDomainEnabled(), false, "the domain is no longer snaps");
      });

      it("stops snapping the domain when option is disabled", () => {
        const includedValues = [0.5, 1.5];
        scale.addIncludedValuesProvider(function() {
          return includedValues;
        });
        const originalPaddedDomain = scale.domain();

        scale.snappingDomainEnabled(false);
        const padding = scale.padProportion() / 2 * (includedValues[1] - includedValues[0]);
        const expectedDomain = [includedValues[0] - padding, includedValues[1] + padding];
        assert.deepEqual(scale.domain(), expectedDomain, "domain snapping can be deactivated");

        scale.snappingDomainEnabled(true);
        assert.deepEqual(scale.domain(), originalPaddedDomain, "domain snapping can be activated back");
      });
    });

    describe("Padding exceptions", () => {
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        scale = new Plottable.Scales.Linear();
      });

      it("can stop padding on one end using addPaddingExceptionsProvider()", () => {
        scale.addIncludedValuesProvider(() => [10, 13]);
        assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is padded");

        scale.addPaddingExceptionsProvider(() => [11]);
        assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is not changed");

        scale.addPaddingExceptionsProvider(() => [10]);
        assert.strictEqual(scale.domain()[0], 10, "The left side of the domain is no longer padded");
      });

      it("can stop padding on both ends using addPaddingExceptionsProvider()", () => {
        scale.addIncludedValuesProvider(() => [10, 13]);
        assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded");

        scale.addPaddingExceptionsProvider(() => [0.9, 11, 12, 13.5]);
        assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain padding has not changed");

        scale.addPaddingExceptionsProvider(() => [13]);
        assert.deepEqual(scale.domain(), [9.5, 13], "The right side of the domain is no longer padded");

        scale.addPaddingExceptionsProvider(() => [10, 13]);
        assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");
      });

      it("can remove the PaddingExceptionProvider", () => {
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

        scale.removePaddingExceptionsProvider(paddingExceptionProviderLeft);
        assert.deepEqual(scale.domain(), [10, 13], "The domain is still not padded");
      });
    });

    describe("Plot interaction", () => {
      function createMockDrawer(dataset: Plottable.Dataset) {
        let drawer = new Plottable.Drawer(dataset);
        (<any> drawer)._svgElementName = "mock";
        return drawer;
      }

      let data: any[];
      let dataset: Plottable.Dataset;
      let scale: Plottable.Scales.Linear;

      beforeEach(() => {
        data = [{x: 2}, {x: 5}, {x: 0}];
        dataset = new Plottable.Dataset(data);
        scale = new Plottable.Scales.Linear();
        scale.padProportion(0);
      });

      it("receives updates from the plot and autodomains accordingly", () => {
        let svg = TestMethods.generateSVG();
        let plot = new Plottable.Plot();

        (<any> plot)._createDrawer = (_dataset: Plottable.Dataset) => createMockDrawer(_dataset);
        plot.addDataset(dataset);
        plot.attr("x", (d) => d.x, scale);
        plot.renderTo(svg);

        assert.deepEqual(scale.domain(), [0, 5], "scale domain was autodomained correctly");

        dataset.data([{x: 100}]);
        assert.deepEqual(scale.domain(), [99, 101], "scale domain was updated properly");

        svg.remove();
      });

      it("uses reference counting to keep track of the plots it coordinates", () => {
        let svg1 = TestMethods.generateSVG();
        let svg2 = TestMethods.generateSVG();

        let plot1 = new Plottable.Plot();
        (<any> plot1)._createDrawer = (_dataset: Plottable.Dataset) => createMockDrawer(_dataset);
        plot1.addDataset(dataset).attr("x", (d) => d.x, scale);
        plot1.renderTo(svg1);

        let plot2 = new Plottable.Plot();
        (<any> plot2)._createDrawer = (_dataset: Plottable.Dataset) => createMockDrawer(_dataset);
        plot2.addDataset(dataset).attr("x", (d) => d.x, scale);
        plot2.renderTo(svg2);

        assert.deepEqual(scale.domain(), [0, 5], "correct domain is initially set for the scale");

        let otherScale = new Plottable.Scales.Linear();
        plot1.attr("x", (d) => d.x, otherScale);

        assert.deepEqual(scale.domain(), [0, 5], "the domain for the scale did not change as it is still attached to plot 2");
        dataset.data([{x: 10}, {x: 11}]);
        assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataset after one perspective deregistered");

        plot2.attr("x", (d) => d.x, otherScale);
        assert.deepEqual(scale.domain(), [0, 1], "scale resets to the default domain as it is no longer attached to plots");
        dataset.data([{x: 99}, {x: 100}]);
        assert.deepEqual(scale.domain(), [0, 1], "scale shows default values when all perspectives removed");

        svg1.remove();
        svg2.remove();
      });

      it("adjusts to plot detaching, reattaching or destruction", () => {
        let svg = TestMethods.generateSVG();
        let dataset1 = new Plottable.Dataset([
          {x: 0, y: 0},
          {x: 1, y: 1}
        ]);
        let dataset2 = new Plottable.Dataset([
          {x: 1, y: 1},
          {x: 2, y: 2}
        ]);

        let xScale = new Plottable.Scales.Linear();
        xScale.padProportion(0);
        let yScale = new Plottable.Scales.Linear();
        yScale.padProportion(0);

        let plot1 = new Plottable.Plots.Line();
        plot1.addDataset(dataset1);
        plot1.x((d) => d.x, xScale);
        plot1.y((d) => d.y, yScale);

        let plot2 = new Plottable.Plots.Line();
        plot2.addDataset(dataset2);
        plot2.x((d) => d.x, xScale);
        plot2.y((d) => d.y, yScale);

        let group = new Plottable.Components.Group([plot1, plot2]);
        group.renderTo(svg);

        assert.deepEqual(xScale.domain(), [0, 2]);
        plot1.detach();
        assert.deepEqual(xScale.domain(), [1, 2], "domain update on removing plot 1");
        group.append(plot1);
        assert.deepEqual(xScale.domain(), [0, 2], "domain update on readding plot 1");
        plot1.destroy();
        assert.deepEqual(xScale.domain(), [1, 2], "domain update on destroying plot 1");

        svg.remove();
      });
    });
  });
});
