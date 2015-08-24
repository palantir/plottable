///<reference path="../testReference.ts" />

describe("Scales", () => {
  it("Scale alerts listeners when its domain is updated", () => {
    let scale = new Plottable.Scale();
    (<any> scale)._d3Scale = d3.scale.identity();

    let callbackWasCalled = false;
    let testCallback = (listenable: Plottable.Scale<any, any>) => {
      assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
      callbackWasCalled = true;
    };
    scale.onUpdate(testCallback);
    (<any> scale)._setBackingScaleDomain = () => { return; };
    scale.domain([0, 10]);
    assert.isTrue(callbackWasCalled, "The registered callback was called");
  });

  it("Scale update listeners can be turned off", () => {
    let scale = new Plottable.Scale();
    (<any> scale)._d3Scale = d3.scale.identity();
    (<any> scale)._setBackingScaleDomain = () => { return; };

    let callbackWasCalled = false;
    let testCallback = (listenable: Plottable.Scale<any, any>) => {
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
      let scale = new Plottable.Scales.Category();
      scale.range([0, 2679]);

      scale.domain(["1", "2", "3", "4"]);
      assert.closeTo(scale.rangeBand(), 399, 1);

      scale.domain(["1", "2", "3", "4", "5"]);
      assert.closeTo(scale.rangeBand(), 329, 1);
    });

    it("stepWidth operates normally", () => {
      let scale = new Plottable.Scales.Category();
      scale.range([0, 3000]);

      scale.domain(["1", "2", "3", "4"]);
      let widthSum = scale.rangeBand() * (1 + scale.innerPadding());
      assert.strictEqual(scale.stepWidth(), widthSum, "step width is the sum of innerPadding width and band width");
    });
  });

  it("CategoryScale + BarPlot combo works as expected when the data is swapped", () => {
    // This unit test taken from SLATE, see SLATE-163 a fix for SLATE-102
    let xScale = new Plottable.Scales.Category();
    let yScale = new Plottable.Scales.Linear();
    let dA = {x: "A", y: 2};
    let dB = {x: "B", y: 2};
    let dC = {x: "C", y: 2};
    let dataset = new Plottable.Dataset([dA, dB]);
    let barPlot = new Plottable.Plots.Bar();
    barPlot.addDataset(dataset);
    barPlot.x((d: any) => d.x, xScale);
    barPlot.y((d: any) => d.y, yScale);
    let svg = TestMethods.generateSVG();
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

  describe("Interpolated Color Scales", () => {
    it("default scale uses reds and a linear scale type", () => {
      let scale = new Plottable.Scales.InterpolatedColor();
      scale.domain([0, 16]);
      assert.strictEqual("#ffffff", scale.scale(0));
      assert.strictEqual("#feb24c", scale.scale(8));
      assert.strictEqual("#b10026", scale.scale(16));
    });

    it("linearly interpolates colors in L*a*b color space", () => {
      let scale = new Plottable.Scales.InterpolatedColor();
      scale.domain([0, 1]);
      assert.strictEqual("#b10026", scale.scale(1));
      assert.strictEqual("#d9151f", scale.scale(0.9));
    });

    it("accepts array types with color hex values", () => {
      let scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["#000", "#FFF"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#777777", scale.scale(8));
    });

    it("accepts array types with color names", () => {
      let scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#777777", scale.scale(8));
    });

    it("overflow scale values clamp to range", () => {
      let scale = new Plottable.Scales.InterpolatedColor();
      scale.range(["black", "white"]);
      scale.domain([0, 16]);
      assert.strictEqual("#000000", scale.scale(0));
      assert.strictEqual("#ffffff", scale.scale(16));
      assert.strictEqual("#000000", scale.scale(-100));
      assert.strictEqual("#ffffff", scale.scale(100));
    });

    it("can be converted to a different range", () => {
      let scale = new Plottable.Scales.InterpolatedColor();
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
      let values = ["1", "3", "2", "1"];
      let scale = new Plottable.Scales.Category();
      let computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, ["1", "3", "2"], "the extent is made of all the unique values in the domain");
    });

    it("categoryScale gives the unique values when domain is numeric", () => {
      let values = [1, 3, 2, 1];
      let scale = new Plottable.Scales.Category();
      let computedExtent = scale.extentOfValues(<any>values);

      assert.deepEqual(computedExtent, [1, 3, 2], "the extent is made of all the unique values in the domain");
    });

    it("quantitaveScale gives the minimum and maxiumum when the domain is stringy", () => {
      let values = ["1", "3", "2", "1"];
      let scale = new Plottable.QuantitativeScale();
      let computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, ["1", "3"], "the extent is the miminum and the maximum value in the domain");
    });

    it("quantitaveScale gives the minimum and maxiumum when the domain is numeric", () => {
      let values = [1, 3, 2, 1];
      let scale = new Plottable.QuantitativeScale();
      let computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, [1, 3], "the extent is the miminum and the maximum value in the domain");
    });

    it("timeScale extent calculation works as expected", () => {
      let date1 = new Date(2015, 2, 25, 19, 0, 0);
      let date2 = new Date(2015, 2, 24, 19, 0, 0);
      let date3 = new Date(2015, 2, 25, 19, 0, 0);
      let date4 = new Date(2015, 2, 26, 19, 0, 0);
      let values = [date1, date2, date3, date4];

      let scale = new Plottable.Scales.Time();
      let computedExtent = scale.extentOfValues(values);

      assert.deepEqual(computedExtent, [date2, date4], "The extent is the miminum and the maximum value in the domain");
    });

  });
});
