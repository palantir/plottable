import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Components", () => {
  describe("PlotGroup", () => {
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let xScale: Plottable.Scales.Linear;
    let yScale: Plottable.Scales.Linear;
    let plotGroup: Plottable.Components.PlotGroup;
    let bottomPlot: Plottable.Plots.Line<number>;
    let topPlot: Plottable.Plots.Line<number>;
    let bottomData: any[];
    let topData: any[];

    beforeEach(() => {
      div = TestMethods.generateDiv();
      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Linear();
      plotGroup = new Plottable.Components.PlotGroup();
      bottomPlot = new Plottable.Plots.Line<number>();
      topPlot = new Plottable.Plots.Line<number>();

      bottomData = [
        { x: 0.0, y: 0.0 },
        { x: 0.2, y: 0.2 },
      ];
      bottomPlot.x((d) => d.x, xScale);
      bottomPlot.y((d) => d.y, yScale);
      bottomPlot.addDataset(new Plottable.Dataset(bottomData));

      topData = [
        { x: 0.0, y: 0.0 },
        { x: 0.2, y: 0.4 },
      ];
      topPlot.x((d) => d.x, xScale);
      topPlot.y((d) => d.y, yScale);
      topPlot.addDataset(new Plottable.Dataset(topData));
    });

    it("throws error when appending not plot", () => {
      const label = new Plottable.Components.Label();
      assert.throw(() => plotGroup.append((<any>label)), Error, "Plot Group only accepts plots");
      div.remove();
    });

    it("can retrieve the nearest Entity in case of empty group", () => {
      plotGroup.renderTo(div);
      assert.isUndefined(plotGroup.entityNearest({x: 0, y: 0}));
      div.remove();
    });

    it("can retrieve the nearest Entity", () => {
      plotGroup.append(bottomPlot);
      plotGroup.append(topPlot);
      plotGroup.renderTo(div);
      let px = xScale.scale(topData[1].x);
      let py = yScale.scale(topData[1].y);
      let closest = plotGroup.entityNearest({x: px, y: py});
      assert.strictEqual(closest.datum, topData[1], "it retrieves the closest point to top plot");

      px = xScale.scale(bottomData[1].x);
      py = yScale.scale(bottomData[1].y);
      closest = plotGroup.entityNearest({x: px, y: py});
      assert.strictEqual(closest.datum, bottomData[1], "it retrieves the closest point to bottom plot");

      closest = plotGroup.entityNearest({x: px, y: py + 1});
      assert.strictEqual(closest.datum, bottomData[1], "it retrieves the closest point in between plots");

      px = xScale.scale(topData[0].x);
      py = yScale.scale(topData[0].y);
      closest = plotGroup.entityNearest({x: px, y: py});
      assert.strictEqual(closest.datum, topData[0], "it retrieves the closest point to upper plot in case of tie");
      div.remove();
    });
  });
});
