///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Interploated Color Scale", () => {

    describe("Basic usage", () => {

      let scale: Plottable.Scales.InterpolatedColor;

      beforeEach(() => {
        scale = new Plottable.Scales.InterpolatedColor();
      });

      it("defaults to a linear scale and a red color palette", () => {
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#ffffff", "domain minimum maps to white");
        assert.strictEqual(scale.scale(8), "#feb24c", "domain median maps in between red and white");
        assert.strictEqual(scale.scale(16), "#b10026", "domain maximum maps to red");

        assert.deepEqual(scale.range(), Plottable.Scales.InterpolatedColor.REDS,
          "the range of the default scale is made of shades of red");

        scale.domain([0, 1]);
        assert.strictEqual(scale.scale(1), "#b10026", "new domain maximum maps to red");
        assert.strictEqual(scale.scale(0.5), "#feb24c", "new domain median maps in between red and white");
        assert.strictEqual(scale.scale(0.9), "#d9151f", "different shades of red are obtained for different values");
      });

      it("accepts array types with color hex values", () => {
        scale.range(["#000", "#FFF"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#000000", "domain minimum maps to black");
        assert.strictEqual(scale.scale(8), "#777777", "domain median maps to gray");
        assert.strictEqual(scale.scale(16), "#ffffff", "domain maximum maps to white");
      });

      it("accepts array types with color names", () => {
        scale.range(["white", "black"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#ffffff", "domain minimum maps to white");
        assert.strictEqual(scale.scale(8), "#777777", "domain median maps to gray");
        assert.strictEqual(scale.scale(16), "#000000", "domain maximum maps to black");
      });

      it("clamps overflow and underflow values to range", () => {
        scale.range(["black", "white"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#000000", "domain minimum maps to black");
        assert.strictEqual(scale.scale(16), "#ffffff", "domain maximum maps to white");
        assert.strictEqual(scale.scale(-100), "#000000", "values smaller than the domain minimum clamp to black");
        assert.strictEqual(scale.scale(100), "#ffffff", "values larger than the domain maximum clamp to white");
      });

    });
  });
});
