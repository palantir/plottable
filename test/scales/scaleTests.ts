///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Scale", () => {
    describe("onUpdate", () => {
      it("alerts listeners when its domain is updated", () => {
        const scale = new Plottable.Scale();
        (<any> scale)._setBackingScaleDomain = () => { return; };

        let callbackWasCalled = false;
        const testCallback = (listenable: Plottable.Scale<any, any>) => {
          assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
          callbackWasCalled = true;
        };
        scale.onUpdate(testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
      });

      it("can disconnect listeners", () => {
        const scale = new Plottable.Scale();
        (<any> scale)._setBackingScaleDomain = () => { return; };

        let callbackWasCalled = false;
        const testCallback = (listenable: Plottable.Scale<any, any>) => {
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
});
