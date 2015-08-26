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
