import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

describe("Scales", () => {
  describe("Interploated Color Scale", () => {

    describe("Basic usage", () => {

      let scale: Plottable.Scales.InterpolatedColor;

      beforeEach(() => {
        scale = new Plottable.Scales.InterpolatedColor();
      });

      it("defaults to a linear scale and a red color palette", () => {
        scale.domain([0, 16]);
        assert.deepEqual(d3.color(scale.scale(0)), d3.color("#ffffff"), "domain minimum maps to white");
        assert.deepEqual(d3.color(scale.scale(8)), d3.color("#feb24c"), "domain median maps in between red and white");
        assert.deepEqual(d3.color(scale.scale(16)), d3.color("#b10026"), "domain maximum maps to red");

        assert.deepEqual(scale.range(), Plottable.Scales.InterpolatedColor.REDS,
          "the range of the default scale is made of shades of red");

        scale.domain([0, 1]);
        assert.deepEqual(d3.color(scale.scale(1)), d3.color("#b10026"), "new domain maximum maps to red");
        assert.deepEqual(d3.color(scale.scale(0.5)), d3.color("#feb24c"), "new domain median maps in between red and white");
        assert.deepEqual(d3.color(scale.scale(0.9)), d3.color("#d9151f"), "different shades of red are obtained for different values");
      });

      it("accepts array types with color hex values", () => {
        scale.range(["#000", "#FFF"]);
        scale.domain([0, 16]);
        assert.deepEqual(d3.color(scale.scale(0)), d3.color("#000000"), "domain minimum maps to black");
        assert.deepEqual(d3.color(scale.scale(8)), d3.color("#777777"), "domain median maps to gray");
        assert.deepEqual(d3.color(scale.scale(16)), d3.color("#ffffff"), "domain maximum maps to white");
      });

      it("accepts array types with color names", () => {
        scale.range(["white", "black"]);
        scale.domain([0, 16]);
        assert.deepEqual(d3.color(scale.scale(0)), d3.color("#ffffff"), "domain minimum maps to white");
        assert.deepEqual(d3.color(scale.scale(8)), d3.color("#777777"), "domain median maps to gray");
        assert.deepEqual(d3.color(scale.scale(16)), d3.color("#000000"), "domain maximum maps to black");
      });

      it("clamps overflow and underflow values to range", () => {
        scale.range(["black", "white"]);
        scale.domain([0, 16]);
        assert.deepEqual(d3.color(scale.scale(0)), d3.color("#000000"), "domain minimum maps to black");
        assert.deepEqual(d3.color(scale.scale(16)), d3.color("#ffffff"), "domain maximum maps to white");
        assert.deepEqual(d3.color(scale.scale(-100)), d3.color("#000000"), "values smaller than the domain minimum clamp to black");
        assert.deepEqual(d3.color(scale.scale(100)), d3.color("#ffffff"), "values larger than the domain maximum clamp to white");
      });

    });
  });
});
