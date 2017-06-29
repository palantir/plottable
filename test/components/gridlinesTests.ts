import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Gridlines", () => {
  let div: d3.Selection<HTMLDivElement, any, any, any>;
  let xScale: Plottable.Scales.Linear;
  let yScale: Plottable.Scales.Linear;
  let gridlines: Plottable.Components.Gridlines;

  beforeEach(() => {
    div = TestMethods.generateDiv();
    xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]);

    yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  });

  it("sets ranges of scales to the Gridlines dimensions when layout is computed", () => {
    gridlines.renderTo(div);

    assert.deepEqual(xScale.range(), [0, Plottable.Utils.DOM.elementWidth(div)], "x scale range extends to the width of the div");
    assert.deepEqual(yScale.range(), [Plottable.Utils.DOM.elementHeight(div), 0], "y scale range extends to the height of the div");

    div.remove();
  });

  it("draws gridlines on ticks of its scales and updates when scale update", () => {
    gridlines.renderTo(div);

    let xGridlines = gridlines.content().select(".x-gridlines").selectAll<Element, any>("line");
    let xTicks = xScale.ticks();
    assert.strictEqual(xGridlines.size(), xTicks.length, "There is an x gridline for each x tick");
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      assert.closeTo(x, xScale.scale(xTicks[i]), window.Pixel_CloseTo_Requirement, "x gridline drawn on ticks");
    });

    let yGridlines = gridlines.content().select(".y-gridlines").selectAll<Element, any>("line");
    let yTicks = yScale.ticks();
    assert.strictEqual(yGridlines.size(), yTicks.length, "There is a y gridline for each y tick");
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      assert.closeTo(y, yScale.scale(yTicks[i]), window.Pixel_CloseTo_Requirement, "y gridline drawn on ticks");
    });

    xScale.domain([0, 8]);
    yScale.domain([0, 8]);

    xGridlines = gridlines.content().select(".x-gridlines").selectAll<Element, any>("line");
    xTicks = xScale.ticks();
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      assert.closeTo(x, xScale.scale(xTicks[i]), window.Pixel_CloseTo_Requirement, "x gridline is updated");
    });

    yGridlines = gridlines.content().select(".y-gridlines").selectAll<Element, any>("line");
    yTicks = yScale.ticks();
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      assert.closeTo(y, yScale.scale(yTicks[i]), window.Pixel_CloseTo_Requirement, "y gridline is updated");
    });
    div.remove();
  });

  it("draws gridlines between ticks of its scales and updates when scale update", () => {
    gridlines.betweenX(true);
    gridlines.betweenY(true);

    gridlines.renderTo(div);

    const xGridlines = gridlines.content().select(".x-gridlines").selectAll<Element, any>(".betweenline");
    const xTicks = xScale.ticks();
    assert.strictEqual(xGridlines.size(), xTicks.length - 1, "There is an x gridline for each x tick minus one");
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      const expectedLocation = xScale.scale(xTicks[i]) + (xScale.scale(xTicks[i + 1]) - xScale.scale(xTicks[i])) / 2;
      assert.closeTo(x, expectedLocation, window.Pixel_CloseTo_Requirement, "x gridline drawn between ticks");
    });

    const yGridlines = gridlines.content().select(".y-gridlines").selectAll<Element, any>(".betweenline");
    const yTicks = yScale.ticks();
    assert.strictEqual(yGridlines.size(), yTicks.length - 1, "There is a y gridline for each y tick minus one");
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      const expectedLocation = yScale.scale(yTicks[i]) + (yScale.scale(yTicks[i + 1]) - yScale.scale(yTicks[i])) / 2;
      assert.closeTo(y, expectedLocation, window.Pixel_CloseTo_Requirement, "y gridline drawn on ticks");
    });

    div.remove();
  });
});
