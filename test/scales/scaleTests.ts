///<reference path="../testReference.ts" />

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
    (<any> scale)._setBackingScaleDomain = () => { return; };
    scale.domain([0, 10]);
    assert.isTrue(callbackWasCalled, "The registered callback was called");
  });

  it("Scale update listeners can be turned off", () => {
    var scale = new Plottable.Scale();
    (<any> scale)._d3Scale = d3.scale.identity();
    (<any> scale)._setBackingScaleDomain = () => { return; };

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
    var barPlot = new Plottable.Plots.Bar();
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
      Plottable.Scales.Color.invalidateColorCache();
      var scale = new Plottable.Scales.Color();
      style.remove();
      Plottable.Scales.Color.invalidateColorCache();
      assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");
      assert.strictEqual(scale.range()[1], "#fd373e", "The second color of the color scale should be the same");

      var defaultScale = new Plottable.Scales.Color();
      assert.strictEqual(scale.range()[0], "#ff0000",
        "Unloading the CSS should not modify the first scale color (this will not be the case if we support dynamic CSS");
      assert.strictEqual(defaultScale.range()[0], "#5279c7",
        "Unloading the CSS should cause color scales fallback to default colors");
    });

     it("caches CSS specified colors unless the cache is invalidated", () => {
      var style = d3.select("body").append("style");
      style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");
      Plottable.Scales.Color.invalidateColorCache();
      var scale = new Plottable.Scales.Color();
      style.remove();

      assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");

      var scaleCached = new Plottable.Scales.Color();
      assert.strictEqual(scaleCached.range()[0], "#ff0000", "The red color should still be cached");

      Plottable.Scales.Color.invalidateColorCache();
      var scaleFresh = new Plottable.Scales.Color();
      assert.strictEqual(scaleFresh.range()[0], "#5279c7", "Invalidating the cache should reset the red color to the default");
    });

    it("should try to recover from malicious CSS styleseets", () => {
      var defaultNumberOfColors = 10;

      var initialScale = new Plottable.Scales.Color();
      assert.strictEqual(initialScale.range().length, defaultNumberOfColors,
        "there should initially be " + defaultNumberOfColors + " default colors");

      var maliciousStyle = d3.select("body").append("style");
      maliciousStyle.html("* {background-color: #fff000;}");
      Plottable.Scales.Color.invalidateColorCache();
      var affectedScale = new Plottable.Scales.Color();
      maliciousStyle.remove();
      Plottable.Scales.Color.invalidateColorCache();
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
      Plottable.Scales.Color.invalidateColorCache();
      var affectedScale = new Plottable.Scales.Color();
      maliciousStyle.remove();
      Plottable.Scales.Color.invalidateColorCache();
      var maximumColorsFromCss = (<any> Plottable.Scales.Color)._MAXIMUM_COLORS_FROM_CSS;
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
      var scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["#000", "#FFF"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#777777", scale.scale(8));
    });

    it("accepts array types with color names", () => {
      var scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#777777", scale.scale(8));
    });

    it("overflow scale values clamp to range", () => {
      var scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#000000", scale.scale(-100));
      assert.strictEqual("#ffffff", scale.scale(100));
    });

    it("can be converted to a different range", () => {
      var scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      scale.range(Plottable.Scales.InterpolatedColor.REDS);
      assert.strictEqual("#b10026", scale.scale(16));
    });
  });

  describe("extent calculation", () => {
    it("categoryScale gives the unique values when domain is stringy", () => {
      var values = ["1", "3", "2", "1"];
      var scale = new Plottable.Scales.Category();
      var computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, ["1", "3", "2"], "the extent is made of all the unique values in the domain");
    });

    it("categoryScale gives the unique values when domain is numeric", () => {
      var values = [1, 3, 2, 1];
      var scale = new Plottable.Scales.Category();
      var computedExtent = scale.extentOfValues(<any>values);

      assert.deepEqual(computedExtent, [1, 3, 2], "the extent is made of all the unique values in the domain");
    });

    it("quantitaveScale gives the minimum and maxiumum when the domain is stringy", () => {
      var values = ["1", "3", "2", "1"];
      var scale = new Plottable.QuantitativeScale();
      var computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, ["1", "3"], "the extent is the miminum and the maximum value in the domain");
    });

    it("quantitaveScale gives the minimum and maxiumum when the domain is numeric", () => {
      var values = [1, 3, 2, 1];
      var scale = new Plottable.QuantitativeScale();
      var computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, [1, 3], "the extent is the miminum and the maximum value in the domain");
    });

    it("timeScale extent calculation works as expected", () => {
      var date1 = new Date(2015, 2, 25, 19, 0, 0);
      var date2 = new Date(2015, 2, 24, 19, 0, 0);
      var date3 = new Date(2015, 2, 25, 19, 0, 0);
      var date4 = new Date(2015, 2, 26, 19, 0, 0);
      var values = [date1, date2, date3, date4];

      var scale = new Plottable.Scales.Time();
      var computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, [date2, date4], "The extent is the miminum and the maximum value in the domain");
    });

  });
});
