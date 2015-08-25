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
