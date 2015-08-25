///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Interploated Color Scale", () => {

    describe("Basic usage", () => {

      let scale: Plottable.Scales.InterpolatedColor;

      beforeEach(() => {
        scale = new Plottable.Scales.InterpolatedColor();
      })

      it("default scale uses reds and a linear scale type", () => {
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#ffffff", "");
        assert.strictEqual(scale.scale(8), "#feb24c", "");
        assert.strictEqual(scale.scale(16), "#b10026", "");
      });

      it("linearly interpolates colors in L*a*b color space", () => {
        scale.domain([0, 1]);
        assert.strictEqual(scale.scale(1), "#b10026", "");
        assert.strictEqual(scale.scale(0.9), "#d9151f", "");
      });

      it("accepts array types with color hex values", () => {
        scale.range(["#000", "#FFF"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#000000", "");
        assert.strictEqual(scale.scale(8), "#777777", "");
        assert.strictEqual(scale.scale(16), "#ffffff", "");
      });

      it("accepts array types with color names", () => {
        scale.range(["black", "white"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#000000", "");
        assert.strictEqual(scale.scale(8), "#777777", "");
        assert.strictEqual(scale.scale(16), "#ffffff", "");
      });

      it("overflow scale values clamp to range", () => {
        scale.range(["black", "white"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#000000", "");
        assert.strictEqual(scale.scale(16), "#ffffff", "");
        assert.strictEqual(scale.scale(-100), "#000000", "");
        assert.strictEqual(scale.scale(100), "#ffffff", "");
      });

      it("can be converted to a different range", () => {
        scale.range(["black", "white"]);
        scale.domain([0, 16]);
        assert.strictEqual(scale.scale(0), "#000000", "");
        assert.strictEqual(scale.scale(16), "#ffffff", "");
        scale.range(Plottable.Scales.InterpolatedColor.REDS);
        assert.strictEqual(scale.scale(16), "#b10026", "");
      });

      function linearlyInterpolateColors(color1Hex: string, color2Hex: string, ratio: number) {
        let color1 = TestMethods.colorHexToRGB(color1Hex);
        let color2 = TestMethods.colorHexToRGB(color2Hex);

        return TestMethods.colorRGBToHex({
          red: Math.floor(color1.red * ratio + color2.red * (1 - ratio)),
          green: Math.floor(color1.green * ratio + color2.green * (1 - ratio)),
          blue: Math.floor(color1.blue * ratio + color2.blue * (1 - ratio))
        });
      }
    });

  });
});
