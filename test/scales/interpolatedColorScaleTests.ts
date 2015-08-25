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

      function linearlyInterpolateColors(color1: string, color2: string, ratio: number) {

        let red1 = parseInt(color1.substr(1, 2), 16);
        let green1 = parseInt(color1.substr(3, 2), 16);
        let blue1 = parseInt(color1.substr(5, 2), 16);

        let red2 = parseInt(color2.substr(1, 2), 16);
        let green2 = parseInt(color2.substr(3, 2), 16);
        let blue2 = parseInt(color2.substr(5, 2), 16);

        let redOutput = Math.floor(red1 * ratio + red2 * (1 - ratio));
        let greenOutput = Math.floor(green1 * ratio + green2 * (1 - ratio));
        let blueOutput = Math.floor(blue1 * ratio + blue2 * (1 - ratio));

        let redHex = redOutput.toString(16);
        if (redHex.length === 1) {
          redHex = "0" + redHex;
        }

        let greenHex = greenOutput.toString(16);
        if (greenHex.length === 1) {
          greenHex = "0" + greenHex;
        }

        let blueHex = blueOutput.toString(16);
        if (blueHex.length === 1) {
          blueHex = "0" + blueHex;
        }

        return "#" + redHex + greenHex + blueHex;
      }
    });

  });
});
