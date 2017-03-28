import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";
import { BarOrientation } from "../../src/plots/barPlot";
import { getTranslateValues } from "../../src/utils/domUtils";

import * as TestMethods from "../testMethods";

describe("Metadata", () => {
  let xScale: Plottable.Scales.Linear;
  let yScale: Plottable.Scales.Linear;
  const data1 = [{x: 0, y: 0}, {x: 1, y: 1}];
  const data2 = [{x: 2, y: 2}, {x: 3, y: 3}];
  before(() => {
    xScale = new Plottable.Scales.Linear();
    yScale = new Plottable.Scales.Linear();
    xScale.domain([0, 400]);
    yScale.domain([400, 0]);
  });

  it("Dataset is passed in", () => {
    const div = TestMethods.generateDiv(400, 400);
    const metadata = {foo: 10, bar: 20};
    const xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.x + i * dataset.metadata().foo;
    const yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => dataset.metadata().bar;
    const dataset = new Plottable.Dataset(data1, metadata);
    const plot = new Plottable.Plots.Scatter()
                                  .x(xAccessor, xScale)
                                  .y(yAccessor, yScale);
    plot.addDataset(dataset);
    plot.renderTo(div);
    const circles = plot.selections().nodes();
    const c1 = d3.select(circles[0]);
    const c2 = d3.select(circles[1]);
    let c1Position = getTranslateValues(c1);
    let c2Position = getTranslateValues(c2);
    assert.closeTo(c1Position[0], 0, 0.01, "first circle cx is correct");
    assert.closeTo(c1Position[1], 20, 0.01, "first circle cy is correct");
    assert.closeTo(c2Position[0], 11, 0.01, "second circle cx is correct");
    assert.closeTo(c2Position[1], 20, 0.01, "second circle cy is correct");

    const changedMetadata = {foo: 0, bar: 0};
    dataset.metadata(changedMetadata);
    c1Position = getTranslateValues(c1);
    c2Position = getTranslateValues(c2);

    assert.closeTo(c1Position[0], 0, 0.01, "first circle cx is correct after metadata change");
    assert.closeTo(c1Position[1], 0, 0.01, "first circle cy is correct after metadata change");
    assert.closeTo(c2Position[0], 1, 0.01, "second circle cx is correct after metadata change");
    assert.closeTo(c2Position[1], 0, 0.01, "second circle cy is correct after metadata change");

    div.remove();
  });

  it("user metadata is applied to associated dataset", () => {
    const div = TestMethods.generateDiv(400, 400);
    const metadata1 = {foo: 10};
    const metadata2 = {foo: 30};
    const xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.x + (i + 1) * dataset.metadata().foo;
    const yAccessor = () => 0;
    const dataset1 = new Plottable.Dataset(data1, metadata1);
    const dataset2 = new Plottable.Dataset(data2, metadata2);
    const plot = new Plottable.Plots.Scatter()
                                  .x(xAccessor, xScale)
                                  .y(yAccessor, yScale);
    plot.addDataset(dataset1);
    plot.addDataset(dataset2);
    plot.renderTo(div);
    const circles = plot.selections().nodes();
    const c1 = d3.select(circles[0]);
    const c2 = d3.select(circles[1]);
    const c3 = d3.select(circles[2]);
    const c4 = d3.select(circles[3]);

    const c1Position = getTranslateValues(c1);
    const c2Position = getTranslateValues(c2);
    const c3Position = getTranslateValues(c3);
    const c4Position = getTranslateValues(c4);
    assert.closeTo(c1Position[0], 10, 0.01, "first circle is correct");
    assert.closeTo(c2Position[0], 21, 0.01, "second circle is correct");
    assert.closeTo(c3Position[0], 32, 0.01, "third circle is correct");
    assert.closeTo(c4Position[0], 63, 0.01, "fourth circle is correct");

    div.remove();
  });

  it("each plot passes metadata to projectors", () => {
    const div = TestMethods.generateDiv(400, 400);
    const metadata = {foo: 11};
    const dataset1 = new Plottable.Dataset(data1, metadata);
    const dataset2 = new Plottable.Dataset(data2, metadata);

    const checkXYPlot = (plot: Plottable.XYPlot<any, any>) => {
      const xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => {
          return d.x + dataset.metadata().foo;
      };
      const yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => {
          return d.y + dataset.metadata().foo;
      };
      plot.addDataset(dataset1)
          .addDataset(dataset2);
      plot.x(xAccessor, xScale)
          .y(yAccessor, yScale);

      // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
      plot.renderTo(div);
      plot.destroy();
    };

    const checkPiePlot = (plot: Plottable.Plots.Pie) => {
      plot.sectorValue((d) => d.x).addDataset(dataset1);

      // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
      plot.renderTo(div);
      plot.destroy();
    };

    checkXYPlot(new Plottable.Plots.Area());
    checkXYPlot(new Plottable.Plots.StackedArea());
    checkXYPlot(new Plottable.Plots.Bar());
    checkXYPlot(new Plottable.Plots.StackedBar());
    checkXYPlot(new Plottable.Plots.StackedBar(BarOrientation.horizontal));
    checkXYPlot(new Plottable.Plots.ClusteredBar());
    checkXYPlot(new Plottable.Plots.Bar(BarOrientation.horizontal));
    checkXYPlot(new Plottable.Plots.Scatter());
    checkPiePlot(new Plottable.Plots.Pie());
    div.remove();
  });
});
