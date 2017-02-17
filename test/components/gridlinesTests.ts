import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Gridlines", () => {
  let svg: SimpleSelection<void>;
  let xScale: Plottable.Scales.Linear;
  let yScale: Plottable.Scales.Linear;
  let gridlines: Plottable.Components.Gridlines;

  beforeEach(() => {
    svg = TestMethods.generateSVG();
    xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]);

    yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  });

  it("sets ranges of scales to the Gridlines dimensions when layout is computed", () => {
    gridlines.renderTo(svg);

    assert.deepEqual(xScale.range(), [0, TestMethods.numAttr(svg, "width")], "x scale range extends to the width of the svg");
    assert.deepEqual(yScale.range(), [TestMethods.numAttr(svg, "height"), 0], "y scale range extends to the height of the svg");

    svg.remove();
  });

  it("draws gridlines on ticks of its scales and updates when scale update", () => {
    gridlines.renderTo(svg);

    let xGridlines = gridlines.content().select(".x-gridlines").selectAll("line");
    let xTicks = xScale.ticks();
    assert.strictEqual(xGridlines.size(), xTicks.length, "There is an x gridline for each x tick");
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      assert.closeTo(x, xScale.scale(xTicks[i]), window.Pixel_CloseTo_Requirement, "x gridline drawn on ticks");
    });

    let yGridlines = gridlines.content().select(".y-gridlines").selectAll("line");
    let yTicks = yScale.ticks();
    assert.strictEqual(yGridlines.size(), yTicks.length, "There is a y gridline for each y tick");
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      assert.closeTo(y, yScale.scale(yTicks[i]), window.Pixel_CloseTo_Requirement, "y gridline drawn on ticks");
    });

    xScale.domain([0, 8]);
    yScale.domain([0, 8]);

    xGridlines = gridlines.content().select(".x-gridlines").selectAll("line");
    xTicks = xScale.ticks();
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      assert.closeTo(x, xScale.scale(xTicks[i]), window.Pixel_CloseTo_Requirement, "x gridline is updated");
    });

    yGridlines = gridlines.content().select(".y-gridlines").selectAll("line");
    yTicks = yScale.ticks();
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      assert.closeTo(y, yScale.scale(yTicks[i]), window.Pixel_CloseTo_Requirement, "y gridline is updated");
    });
    svg.remove();
  });

  it("throws error on non-Quantitative Scales", () => {
    const categoryScale = new Plottable.Scales.Category();
    // HACKHACK #2661: Cannot assert errors being thrown with description
    (<any> assert).throw(() => new Plottable.Components.Gridlines(<any> categoryScale, null), Error,
      "xScale needs to inherit from Scale.QuantitativeScale", "can't set xScale to category scale");
    (<any> assert).throw(() => new Plottable.Components.Gridlines(null, <any> categoryScale), Error,
      "yScale needs to inherit from Scale.QuantitativeScale", "can't set yScale to category scale");

    const colorScale = new Plottable.Scales.Color();
    (<any> assert).throw(() => new Plottable.Components.Gridlines(<any> colorScale, null), Error,
      "xScale needs to inherit from Scale.QuantitativeScale", "can't set xScale to color scale");
    (<any> assert).throw(() => new Plottable.Components.Gridlines(null, <any> colorScale), Error,
      "yScale needs to inherit from Scale.QuantitativeScale", "can't set yScale to color scale");

     svg.remove();
  });
});
