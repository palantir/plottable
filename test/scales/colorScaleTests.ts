import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

describe("Scales", () => {
  describe("Color Scale", () => {

    describe("Basic Usage", () => {
      const defaultColors = [
        "#5279c7", "#fd373e", "#63c261", "#fad419", "#2c2b6f",
        "#ff7939", "#db2e65", "#99ce50", "#962565", "#06cccc",
      ];

      let scale: Plottable.Scales.Color;

      beforeEach(() => {
        scale = new Plottable.Scales.Color();
      });

      it("uses the default colors by default", () => {
        assert.deepEqual(scale.range(), defaultColors, "The color scale uses the default colors by default");
      });

      it("uses altered colors if size of domain exceeds size of range", () => {
        const colorRange = ["#5279c7", "#fd373e"];
        scale.range(colorRange);
        scale.domain(["a", "b", "c"]);
        assert.deepEqual(d3.color(scale.scale("a")), d3.color(colorRange[0]), "first color is used");
        assert.deepEqual(d3.color(scale.scale("b")), d3.color(colorRange[1]), "second color is used");

        const alteredColor1 = d3.color(scale.scale("c")).rgb();
        const color1 = d3.color(colorRange[0]).rgb();
        assert.operator(alteredColor1.r, ">", color1.r, "The resulting color should be lighter in the red component");
        assert.operator(alteredColor1.g, ">", color1.g, "The resulting color should be lighter in the green component");
        assert.operator(alteredColor1.b, ">", color1.b, "The resulting color should be lighter in the blue component");
      });

      it("interprets named color values correctly", () => {
        scale.range(["red", "blue"]);
        scale.domain(["a", "b"]);
        assert.deepEqual(d3.color(scale.scale("a")), d3.color("#ff0000"), "red color as string should be correctly identified");
        assert.deepEqual(d3.color(scale.scale("b")), d3.color("#0000ff"), "blue color as string should be correctly identified");
        assert.deepEqual(scale.range(), ["red", "blue"], "the range itself does not convert to hex values");
      });

      it("accepts Category domain", () => {
        scale.domain(["yes", "no", "maybe"]);
        assert.deepEqual(d3.color(scale.scale("yes")), d3.color(defaultColors[0]), "first color used for first option");
        assert.deepEqual(d3.color(scale.scale("no")), d3.color(defaultColors[1]), "second color used for second option");
        assert.deepEqual(d3.color(scale.scale("maybe")), d3.color(defaultColors[2]), "third color used for third option");
      });
    });

    describe("CSS integration", () => {
      const defaultColors = [
        "#5279c7", "#fd373e", "#63c261", "#fad419", "#2c2b6f",
        "#ff7939", "#db2e65", "#99ce50", "#962565", "#06cccc",
      ];

      it("accepts CSS specified colors", () => {
        const style = d3.select("body").append("style");
        style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");

        Plottable.Scales.Color.invalidateColorCache();
        const scale = new Plottable.Scales.Color();
        assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");
        assert.strictEqual(scale.range()[1], defaultColors[1], "The second color of the color scale should be the same");

        style.remove();
        Plottable.Scales.Color.invalidateColorCache();

        const defaultScale = new Plottable.Scales.Color();
        assert.strictEqual(scale.range()[0], "#ff0000",
          "Unloading the CSS should not modify the first scale color (this will not be the case if we support dynamic CSS");
        assert.strictEqual(defaultScale.range()[0], "#5279c7",
          "Unloading the CSS should cause color scales fallback to default colors");
      });

      it("caches CSS specified colors unless the cache is invalidated", () => {
        const style = d3.select("body").append("style");
        style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");
        Plottable.Scales.Color.invalidateColorCache();
        const scale = new Plottable.Scales.Color();
        style.remove();

        assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");

        const scaleCached = new Plottable.Scales.Color();
        assert.strictEqual(scaleCached.range()[0], "#ff0000", "The red color should still be cached");

        Plottable.Scales.Color.invalidateColorCache();
        const scaleFresh = new Plottable.Scales.Color();
        assert.strictEqual(scaleFresh.range()[0], "#5279c7", "Invalidating the cache should reset the red color to the default");
      });

      it("should try to recover from malicious CSS styleseets", () => {
        const defaultNumberOfColors = defaultColors.length;

        const initialScale = new Plottable.Scales.Color();
        assert.strictEqual(initialScale.range().length, defaultNumberOfColors,
          "there should initially be " + defaultNumberOfColors + " default colors");

        const maliciousStyle = d3.select("body").append("style");
        maliciousStyle.html("* {background-color: #fff000;}");
        Plottable.Scales.Color.invalidateColorCache();
        const affectedScale = new Plottable.Scales.Color();
        maliciousStyle.remove();
        Plottable.Scales.Color.invalidateColorCache();
        const colorRange = affectedScale.range();
        assert.strictEqual(colorRange.length, defaultNumberOfColors + 1,
          "it should detect the end of the given colors and the fallback to the * selector, " +
          "but should still include the last occurance of the * selector color");

        assert.strictEqual(colorRange[colorRange.length - 1], "#fff000",
          "the * selector background color should be added at least once at the end");

        assert.notStrictEqual(colorRange[colorRange.length - 2], "#fff000",
          "the * selector background color should be added at most once at the end");
      });

      it("does not crash by malicious CSS stylesheets", () => {
        const initialScale = new Plottable.Scales.Color();
        assert.strictEqual(initialScale.range().length, 10, "there should initially be 10 default colors");

        const maliciousStyle = d3.select("body").append("style");
        maliciousStyle.html("[class^='plottable-'] {background-color: pink;}");
        Plottable.Scales.Color.invalidateColorCache();
        const affectedScale = new Plottable.Scales.Color();
        maliciousStyle.remove();
        Plottable.Scales.Color.invalidateColorCache();
        const maximumColorsFromCss = (<any> Plottable.Scales.Color)._MAXIMUM_COLORS_FROM_CSS;
        assert.strictEqual(affectedScale.range().length, maximumColorsFromCss,
          "current malicious CSS countermeasure is to cap maximum number of colors to 256");
      });
    });

    describe("Custom color scales", () => {
      it("Category 10 scale", () => {
        const scale = new Plottable.Scales.Color("10");

        const category10Colors = [
          "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
          "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
        ];

        scale.domain(["yes", "no", "maybe"]);
        assert.deepEqual(d3.color(scale.scale("yes")), d3.color(category10Colors[0]), "D3 Category 10 Scale color 1 used for option 1");
        assert.deepEqual(d3.color(scale.scale("no")), d3.color(category10Colors[1]), "D3 Category 10 Scale color 2 used for option 2");
        assert.deepEqual(d3.color(scale.scale("maybe")), d3.color(category10Colors[2]), "D3 Category 10 Scale color 3 used for option 3");

        assert.deepEqual(scale.range(), category10Colors, "The correct D3 Category 10 Scale colors are in range");
      });

      it("Category 20 scale", () => {
        const scale = new Plottable.Scales.Color("20");

        const category20Colors = [
          "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
          "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
          "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
          "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
        ];

        scale.domain(["yes"]);
        assert.deepEqual(d3.color(scale.scale("yes")), d3.color(category20Colors[0]), "D3 Category 20 Scale color 1 used for option 1");

        assert.deepEqual(scale.range(), category20Colors, "The correct D3 Category 20 Scale colors are in range");
      });
    });

  });
});
