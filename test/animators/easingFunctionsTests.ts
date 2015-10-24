///<reference path="../testReference.ts" />

describe("Easing Functions", () => {
  describe("atStart function", () => {
    it("is a well-formed easing function", () => {
      let efcn = Plottable.Animators.EasingFunctions.atStart;
      assert.strictEqual(1, efcn(1), "any easing function must return 1 for t = 1");
      assert.strictEqual(1, efcn(20), "any easing function must return 1 for t > 1");
    });
    it("transitions at start of transition duration", () => {
      let efcn = Plottable.Animators.EasingFunctions.atStart;
      assert.strictEqual(1, efcn(0), "returns 1 at time = 0");
    });
  });
  describe("atEnd function", () => {
    it("is a well-formed easing function", () => {
      let efcn = Plottable.Animators.EasingFunctions.atEnd;
      assert.strictEqual(1, efcn(1), "any easing function must return 1 for t = 1");
      assert.strictEqual(1, efcn(20), "any easing function must return 1 for t > 1");
    });

    it("transitions at end of transition duration", () => {
      let efcn = Plottable.Animators.EasingFunctions.atEnd;
      assert.strictEqual(0, efcn(.9999999), "returns 0 when t < 1");
    });
  });
  describe("squEase function", () => {
    it("is a well-formed easing function", () => {
      let efcn = Plottable.Animators.EasingFunctions.squEase("linear-in-out", .3, .5);
      assert.strictEqual(1, efcn(1), "any easing function must return 1 for t = 1");
      assert.strictEqual(1, efcn(20), "any easing function must return 1 for t > 1");
    });
    it("acts only in the range between start and end", () => {
      let efcn = Plottable.Animators.EasingFunctions.squEase("linear", .25, .75);
      assert.strictEqual(0, efcn(.24), "returns 0 for t < start");
      assert.strictEqual(1, efcn(.76), "returns 1 for t > end");
    });
    it("can wrap a pre-defined d3 easing function by name", () => {
      let efcn = Plottable.Animators.EasingFunctions.squEase("cubic-in-out", 0, .5);
      let d3fcn = d3.ease("cubic-in-out");
      assert.strictEqual(d3fcn(.3), efcn(.15), "scaled values match");
      efcn = Plottable.Animators.EasingFunctions.squEase("cubic-in-out", .1, .6);
      assert.strictEqual(d3fcn(.3), efcn(.25), "scaled values match with non-zero start");
    });
    it("can wrap a custom easing function", () => {
      let fcn = (t: number) => {
        if (t <= 0) {
          return 0;
        }
        if (t >= .5) {
          return 1;
        }
        return t * 2;
      };
      let efcn = Plottable.Animators.EasingFunctions.squEase(fcn, 0, .5);
      assert.strictEqual(fcn(.3), efcn(.15), "scaled values match");
      efcn = Plottable.Animators.EasingFunctions.squEase(fcn, .1, .6);
      assert.strictEqual(fcn(.3), efcn(.25), "scaled values match with non-zero start");
    });
  });
});
