///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Scale", () => {
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
  });
});
