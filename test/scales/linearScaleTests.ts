///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  describe("Linear Scales", () => {
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
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [[singleValue, singleValue]]);
      scale.autoDomain();
      assert.deepEqual(scale.domain(), [singleValue - 1, singleValue + 1], "single-value extent was expanded");
    });

    it("domainMin()", () => {
      var scale = new Plottable.Scales.Linear();
      scale.padProportion(0);
      var requestedDomain = [-5, 5];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [requestedDomain]);

      var minBelowBottom = -10;
      scale.domainMin(minBelowBottom);
      assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");

      var minInMiddle = 0;
      scale.domainMin(minInMiddle);
      assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]], "lower end was set even if requested value cuts off some data");

      var minAboveTop = 10;
      scale.domainMin(minAboveTop);
      assert.deepEqual(scale.domain(), [minAboveTop, minAboveTop + 1],
        "domain is set to [min, min + 1] if the requested value is above autoDomain()-ed max value");

      scale.autoDomain();
      assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");

      scale.domainMin(minInMiddle);
      var requestedDomain2 = [-10, 10];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [requestedDomain2]);
      scale._autoDomainIfAutomaticMode();
      assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
    });

    it("domainMax()", () => {
      var scale = new Plottable.Scales.Linear();
      scale.padProportion(0);
      var requestedDomain = [-5, 5];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [requestedDomain]);

      var maxAboveTop = 10;
      scale.domainMax(maxAboveTop);
      assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");

      var maxInMiddle = 0;
      scale.domainMax(maxInMiddle);
      assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle], "upper end was set even if requested value cuts off some data");

      var maxBelowBottom = -10;
      scale.domainMax(maxBelowBottom);
      assert.deepEqual(scale.domain(), [maxBelowBottom - 1, maxBelowBottom],
        "domain is set to [max - 1, max] if the requested value is below autoDomain()-ed min value");

      scale.autoDomain();
      assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");

      scale.domainMax(maxInMiddle);
      var requestedDomain2 = [-10, 10];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [requestedDomain2]);
      scale._autoDomainIfAutomaticMode();
      assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
    });

    it("domainMin() and domainMax() together", () => {
      var scale = new Plottable.Scales.Linear();
      scale.padProportion(0);
      var requestedDomain = [-5, 5];
      scale.addExtentsProvider((scale: Plottable.Scales.Linear) => [requestedDomain]);

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
      scale.tickGenerator((scale) => scale.getDefaultTicks().filter(tick => tick % 3 === 0));
      ticks = scale.ticks();
      assert.deepEqual(ticks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
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
        scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => [d3.extent(data, (e) => e.foo)]);
        assert.isTrue((<any> scale)._autoDomainAutomatically,
                            "the autoDomain flag is still set after autoranginging and padding and nice-ing");
        scale.domain([0, 5]);
        assert.isFalse((<any> scale)._autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
      });

      it("scale autorange works as expected with single dataset", () => {
        var svg = TestMethods.generateSVG(100, 100);
        new Plottable.Plot()
          .addDataset(dataset)
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
        var renderer1 = new Plottable.Plot()
                            .addDataset(dataset)
                            .attr("x", (d) => d.foo, scale);
        renderer1.renderTo(svg1);
        var renderer2 = new Plottable.Plot()
                            .addDataset(dataset)
                            .attr("x", (d) => d.foo, scale);
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

      it("addExtentsProvider()", () => {
        scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => [[0, 10]]);
        scale.autoDomain();
        assert.deepEqual(scale.domain(), [0, 10], "scale domain accounts for first provider");

        scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => [[-10, 0]]);
        scale.autoDomain();
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for second provider");
      });

      it("removeExtentsProvider()", () => {
        var posProvider = (scale: Plottable.Scale<number, number>) => [[0, 10]];
        scale.addExtentsProvider(posProvider);
        var negProvider = (scale: Plottable.Scale<number, number>) => [[-10, 0]];
        scale.addExtentsProvider(negProvider);
        scale.autoDomain();
        assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for both providers");

        scale.removeExtentsProvider(negProvider);
        scale.autoDomain();
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
        var renderAreaD1 = new Plottable.Plots.Line(xScale, yScale);
        renderAreaD1.addDataset(ds1);
        renderAreaD1.x((d) => d.x, xScale);
        renderAreaD1.y((d) => d.y, yScale);
        var renderAreaD2 = new Plottable.Plots.Line(xScale, yScale);
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
