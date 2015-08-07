///<reference path="../testReference.ts" />

describe("Utils", () => {
  describe("CallbackSet", () => {
    it("callCallbacks()", () => {
      var expectedS = "Plottable";
      var expectedI = 1;

      var cb1called = false;
      var cb1 = (s: string, i: number) => {
        assert.strictEqual(s, expectedS, "was passed the correct first argument");
        assert.strictEqual(i, expectedI, "was passed the correct second argument");
        cb1called = true;
      };
      var cb2called = false;
      var cb2 = (s: string, i: number) => {
        assert.strictEqual(s, expectedS, "was passed the correct first argument");
        assert.strictEqual(i, expectedI, "was passed the correct second argument");
        cb2called = true;
      };

      var callbackSet = new Plottable.Utils.CallbackSet<(s: string, i: number) => any>();
      callbackSet.add(cb1);
      callbackSet.add(cb2);

      callbackSet.callCallbacks(expectedS, expectedI);
      assert.isTrue(cb1called, "callback 1 was called");
      assert.isTrue(cb2called, "callback 2 was called");
    });
  });
});
