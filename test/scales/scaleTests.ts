///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  it("Scale alerts listeners when its domain is updated", () => {
    var scale = new Plottable.Scale();
    (<any> scale)._d3Scale = d3.scale.identity();

    var callbackWasCalled = false;
    var testCallback = (listenable: Plottable.Scale<any, any>) => {
      assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
      callbackWasCalled = true;
    };
    scale.onUpdate(testCallback);
    (<any> scale)._setBackingScaleDomain = () => null;
    scale.domain([0, 10]);
    assert.isTrue(callbackWasCalled, "The registered callback was called");
  });

  it("Scale update listeners can be turned off", () => {
    var scale = new Plottable.Scale();
    (<any> scale)._d3Scale = d3.scale.identity();
    (<any> scale)._setBackingScaleDomain = () => null;

    var callbackWasCalled = false;
    var testCallback = (listenable: Plottable.Scale<any, any>) => {
      assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
      callbackWasCalled = true;
    };
    scale.onUpdate(testCallback);
    scale.domain([0, 10]);
    assert.isTrue(callbackWasCalled, "The registered callback was called");

    callbackWasCalled = false;
    scale.offUpdate(testCallback);
    scale.domain([11, 19]);
    assert.isFalse(callbackWasCalled, "The registered callback was not called because the callback was removed");
  });

  describe("autoranging behavior", () => {
    var data: any[];
    var dataset: Plottable.Dataset;
    var scale: Plottable.Scales.Linear;
    beforeEach(() => {
      data = [{foo: 2, bar: 1}, {foo: 5, bar: -20}, {foo: 0, bar: 0}];
      dataset = new Plottable.Dataset(data);
      scale = new Plottable.Scales.Linear();
    });

    it("scale autoDomain flag is not overwritten without explicitly setting the domain", () => {
      scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => [d3.extent(data, (e) => e.foo)]);
      scale.domainer(new Plottable.Domainer().pad().nice());
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
      var yScale = new Plottable.Scales.Linear();
      xScale.domainer(new Plottable.Domainer());
      var renderAreaD1 = new Plottable.Plots.Line(xScale, yScale);
      renderAreaD1.addDataset(ds1);
      renderAreaD1.x((d: any) => d.x, xScale);
      renderAreaD1.y((d: any) => d.y, yScale);
      var renderAreaD2 = new Plottable.Plots.Line(xScale, yScale);
      renderAreaD2.addDataset(ds2);
      renderAreaD2.x((d: any) => d.x, xScale);
      renderAreaD2.y((d: any) => d.y, yScale);
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

  describe("Quantitative Scales", () => {
    it("autorange defaults to [0, 1] if no perspectives set", () => {
      var scale = new Plottable.Scales.Linear();
      scale.autoDomain();
      var d = scale.domain();
      assert.strictEqual(d[0], 0);
      assert.strictEqual(d[1], 1);
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
  });

  describe("Category Scales", () => {

    it("rangeBand is updated when domain changes", () => {
      var scale = new Plottable.Scales.Category();
      scale.range([0, 2679]);

      scale.domain(["1", "2", "3", "4"]);
      assert.closeTo(scale.rangeBand(), 399, 1);

      scale.domain(["1", "2", "3", "4", "5"]);
      assert.closeTo(scale.rangeBand(), 329, 1);
    });

    it("stepWidth operates normally", () => {
      var scale = new Plottable.Scales.Category();
      scale.range([0, 3000]);

      scale.domain(["1", "2", "3", "4"]);
      var widthSum = scale.rangeBand() * (1 + scale.innerPadding());
      assert.strictEqual(scale.stepWidth(), widthSum, "step width is the sum of innerPadding width and band width");
    });
  });

  it("CategoryScale + BarPlot combo works as expected when the data is swapped", () => {
    // This unit test taken from SLATE, see SLATE-163 a fix for SLATE-102
    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var dA = {x: "A", y: 2};
    var dB = {x: "B", y: 2};
    var dC = {x: "C", y: 2};
    var dataset = new Plottable.Dataset([dA, dB]);
    var barPlot = new Plottable.Plots.Bar(xScale, yScale);
    barPlot.addDataset(dataset);
    barPlot.x((d: any) => d.x, xScale);
    barPlot.y((d: any) => d.y, yScale);
    var svg = TestMethods.generateSVG();
    assert.deepEqual(xScale.domain(), [], "before anchoring, the bar plot doesn't proxy data to the scale");
    barPlot.renderTo(svg);
    assert.deepEqual(xScale.domain(), ["A", "B"], "after anchoring, the bar plot's data is on the scale");

    function iterateDataChanges(...dataChanges: any[]) {
      dataChanges.forEach((dataChange) => {
        dataset.data(dataChange);
      });
    }

    iterateDataChanges([], [dA, dB, dC], []);
    assert.lengthOf(xScale.domain(), 0);

    iterateDataChanges([dA], [dB]);
    assert.lengthOf(xScale.domain(), 1);
    iterateDataChanges([], [dA, dB, dC]);
    assert.lengthOf(xScale.domain(), 3);
    svg.remove();
  });

  describe("Color Scales", () => {
    it("accepts categorical string types and Category domain", () => {
      var scale = new Plottable.Scales.Color("10");
      scale.domain(["yes", "no", "maybe"]);
      assert.strictEqual("#1f77b4", scale.scale("yes"));
      assert.strictEqual("#ff7f0e", scale.scale("no"));
      assert.strictEqual("#2ca02c", scale.scale("maybe"));
    });

    it("default colors are generated", () => {
      var scale = new Plottable.Scales.Color();
      var colorArray = ["#5279c7", "#fd373e", "#63c261",
                        "#fad419", "#2c2b6f", "#ff7939",
                        "#db2e65", "#99ce50", "#962565", "#06cccc"];
      assert.deepEqual(scale.range(), colorArray);
    });

    it("uses altered colors if size of domain exceeds size of range", () => {
      var scale = new Plottable.Scales.Color();
      scale.range(["#5279c7", "#fd373e"]);
      scale.domain(["a", "b", "c"]);
      assert.notEqual(scale.scale("c"), "#5279c7");
    });

    it("interprets named color values correctly", () => {
      var scale = new Plottable.Scales.Color();
      scale.range(["red", "blue"]);
      scale.domain(["a", "b"]);
      assert.strictEqual(scale.scale("a"), "#ff0000");
      assert.strictEqual(scale.scale("b"), "#0000ff");
    });

    it("accepts CSS specified colors", () => {
      var style = d3.select("body").append("style");
      style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");
      var scale = new Plottable.Scales.Color();
      style.remove();
      assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");
      assert.strictEqual(scale.range()[1], "#fd373e", "The second color of the color scale should be the same");

      var defaultScale = new Plottable.Scales.Color();
      assert.strictEqual(scale.range()[0], "#ff0000",
        "Unloading the CSS should not modify the first scale color (this will not be the case if we support dynamic CSS");
      assert.strictEqual(defaultScale.range()[0], "#5279c7",
        "Unloading the CSS should cause color scales fallback to default colors");
    });

    it("should try to recover from malicious CSS styleseets", () => {
      var defaultNumberOfColors = 10;

      var initialScale = new Plottable.Scales.Color();
      assert.strictEqual(initialScale.range().length, defaultNumberOfColors,
        "there should initially be " + defaultNumberOfColors + " default colors");

      var maliciousStyle = d3.select("body").append("style");
      maliciousStyle.html("* {background-color: #fff000;}");
      var affectedScale = new Plottable.Scales.Color();
      maliciousStyle.remove();
      var colorRange = affectedScale.range();
      assert.strictEqual(colorRange.length, defaultNumberOfColors + 1,
        "it should detect the end of the given colors and the fallback to the * selector, " +
        "but should still include the last occurance of the * selector color");

      assert.strictEqual(colorRange[colorRange.length - 1], "#fff000",
        "the * selector background color should be added at least once at the end");

      assert.notStrictEqual(colorRange[colorRange.length - 2], "#fff000",
        "the * selector background color should be added at most once at the end");
    });

    it("does not crash by malicious CSS stylesheets", () => {
      var initialScale = new Plottable.Scales.Color();
      assert.strictEqual(initialScale.range().length, 10, "there should initially be 10 default colors");

      var maliciousStyle = d3.select("body").append("style");
      maliciousStyle.html("[class^='plottable-'] {background-color: pink;}");
      var affectedScale = new Plottable.Scales.Color();
      maliciousStyle.remove();
      var maximumColorsFromCss = (<any> Plottable.Scales.Color).MAXIMUM_COLORS_FROM_CSS;
      assert.strictEqual(affectedScale.range().length, maximumColorsFromCss,
        "current malicious CSS countermeasure is to cap maximum number of colors to 256");
    });

  });

  describe("Interpolated Color Scales", () => {
    it("default scale uses reds and a linear scale type", () => {
      var scale = new Plottable.Scales.InterpolatedColor();
      scale.domain([0, 16]);
      assert.strictEqual("#ffffff", scale.scale(0));
      assert.strictEqual("#feb24c", scale.scale(8));
      assert.strictEqual("#b10026", scale.scale(16));
    });

    it("linearly interpolates colors in L*a*b color space", () => {
      var scale = new Plottable.Scales.InterpolatedColor();
      scale.domain([0, 1]);
      assert.strictEqual("#b10026", scale.scale(1));
      assert.strictEqual("#d9151f", scale.scale(0.9));
    });

    it("accepts array types with color hex values", () => {
      var scale = new Plottable.Scales.InterpolatedColor(["#000", "#FFF"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#777777", scale.scale(8));
    });

    it("accepts array types with color names", () => {
      var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#777777", scale.scale(8));
    });

    it("overflow scale values clamp to range", () => {
      var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#000000", scale.scale(-100));
      assert.strictEqual("#ffffff", scale.scale(100));
    });

    it("can be converted to a different range", () => {
      var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      scale.colorRange(Plottable.Scales.InterpolatedColor.REDS);
      assert.strictEqual("#b10026", scale.scale(16));
    });
  });

  describe("extent calculation", () => {
    it("categoryScale gives the unique values when domain is stringy", () => {
      var domain = ["1", "3", "2", "1"];
      var scale = new Plottable.Scales.Category();
      var computedExtent = scale.getExtentFromDomain(domain);

      assert.deepEqual(computedExtent, ["1", "3", "2"], "the extent is made of all the unique values in the domain");
    });

    it("categoryScale gives the unique values when domain is numeric", () => {
      var domain = [1, 3, 2, 1];
      var scale = new Plottable.Scales.Category();
      var computedExtent = scale.getExtentFromDomain(<any>domain);

      assert.deepEqual(computedExtent, [1, 3, 2], "the extent is made of all the unique values in the domain");
    });

    it("quantitaveScale gives the minimum and maxiumum when the domain is stringy", () => {
      var domain = ["1", "3", "2", "1"];
      var scale = new Plottable.QuantitativeScale();
      var computedExtent = scale.getExtentFromDomain(domain);

      assert.deepEqual(computedExtent, ["1", "3"], "the extent is the miminum and the maximum value in the domain");
    });

    it("quantitaveScale gives the minimum and maxiumum when the domain is numeric", () => {
      var domain = [1, 3, 2, 1];
      var scale = new Plottable.QuantitativeScale();
      var computedExtent = scale.getExtentFromDomain(domain);

      assert.deepEqual(computedExtent, [1, 3], "the extent is the miminum and the maximum value in the domain");
    });

    it("timeScale extent calculation works as expected", () => {
      var date1 = new Date(2015, 2, 25, 19, 0, 0);
      var date2 = new Date(2015, 2, 24, 19, 0, 0);
      var date3 = new Date(2015, 2, 25, 19, 0, 0);
      var date4 = new Date(2015, 2, 26, 19, 0, 0);
      var domain = [date1, date2, date3, date4];

      var scale = new Plottable.Scales.Time();
      var computedExtent = scale.getExtentFromDomain(domain);

      assert.deepEqual(computedExtent, [date2, date4], "The extent is the miminum and the maximum value in the domain");
    });

  });
});
