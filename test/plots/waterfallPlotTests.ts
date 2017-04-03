import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("Waterfall", () => {
    describe("rendering growth bars", () => {
      const numAttr = TestMethods.numAttr;
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      const growthBarData = [
        { x: "A", y: 0 },
        { x: "B", y: 5 },
        { x: "C", y: 10 },
        { x: "D", y: 100},
      ];
      const growthClass = "waterfall-growth";

      beforeEach(() => {
        div = TestMethods.generateDiv();
        dataset = new Plottable.Dataset(growthBarData);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.total((d, i) => i === 0);
        plot.addDataset(dataset);
        plot.renderTo(div);
      });

      it("classes growth bars", () => {
        const bars = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(bars.size(), growthBarData.length, "same number of bars as data points");
        bars.each(function(d, i) {
          if (i === 0) {
            return;
          }
          const bar = d3.select(this);
          assert.isTrue(bar.classed(growthClass), "bar classed as growth bar");
        });
        plot.destroy();
        div.remove();
      });

      it("places bars at current sum", () => {
        const bars = plot.content().selectAll<Element, any>(`rect.${growthClass}`);
        assert.strictEqual(bars.size(), growthBarData.length - 1, "all bars are growth except for first");
        const yAccessor = plot.y().accessor;
        let sum = 0;
        bars.each(function(d, i) {
          const dataY = yAccessor(d, i, dataset);
          const bar = d3.select(this);
          assert.closeTo(numAttr(bar, "y") + numAttr(bar, "height"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar bottom at previous sum");
          sum += dataY;
          assert.closeTo(numAttr(bar, "y"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar top at final sum");
        });

        plot.destroy();
        div.remove();
      });
    });

    describe("rendering decline bars", () => {
      const numAttr = TestMethods.numAttr;
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      const declineBarData = [
        { x: "A", y: 0 },
        { x: "B", y: -5 },
        { x: "C", y: -25 },
        { x: "D", y: -10 },
        { x: "E", y: -15 },
      ];
      const declineClass = "waterfall-decline";

      beforeEach(() => {
        div = TestMethods.generateDiv();
        dataset = new Plottable.Dataset(declineBarData);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.total((d, i) => i === 0);
        plot.addDataset(dataset);
        plot.renderTo(div);
      });

      it("classes decline bars", () => {
        const bars = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(bars.size(), declineBarData.length, "same number of bars as data points");
        bars.each(function(d, i) {
          if (i === 0) {
            return;
          }
          const bar = d3.select(this);
          assert.isTrue(bar.classed(declineClass), "bar classed as decline bars");
        });
        plot.destroy();
        div.remove();
      });

      it("places bars at current sum", () => {
        const bars = plot.content().selectAll<Element, any>(`rect.${declineClass}`);
        assert.strictEqual(bars.size(), declineBarData.length - 1, "all bars are decline except for first");
        const yAccessor = plot.y().accessor;
        let sum = 0;
        bars.each(function(d, i) {
          const dataY = yAccessor(d, i, dataset);
          const bar = d3.select(this);
          assert.closeTo(numAttr(bar, "y"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar top at previous sum");
          sum += dataY;
          assert.closeTo(numAttr(bar, "y") + numAttr(bar, "height"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar bottom at final sum");
        });

        plot.destroy();
        div.remove();
      });
    });

    describe("denoting total bars", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      const data = [
        { x: "A", y: 20, t: true },
        { x: "B", y: 5, t: false },
        { x: "C", y: 25, t: true },
        { x: "D", y: -10, t: false },
        { x: "E", y: 15, t: true },
      ];
      const totalClass = "waterfall-total";

      beforeEach(() => {
        div = TestMethods.generateDiv();
        dataset = new Plottable.Dataset(data);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("can set the total property", () => {
        const accessor = (d: any) => d.t;
        assert.strictEqual(plot.total(accessor), plot, "setter returns calling object");

        plot.addDataset(dataset);
        plot.renderTo(div);
        const bars = plot.content().selectAll<Element, any>("rect").filter((d) => accessor(d));
        bars.each(function(d) {
          const totalBar = d3.select(this);
          assert.isTrue(totalBar.classed(totalClass));
        });
        plot.destroy();
        div.remove();
      });

      it("can get the total property", () => {
        const accessor = (d: any) => d.t === "total";
        plot.total(accessor);
        assert.strictEqual(plot.total().accessor, accessor, "can get if connectors are enabled");
        plot.destroy();
        div.remove();
      });
    });

    describe("enabling connectors", () => {
      const numAttr = TestMethods.numAttr;
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      const data = [
        { x: "A", y: 20, t: true },
        { x: "B", y: 5, t: false },
        { x: "C", y: 25, t: true },
        { x: "D", y: -10, t: false },
        { x: "E", y: 15, t: true },
      ];

      beforeEach(() => {
        div = TestMethods.generateDiv();
        dataset = new Plottable.Dataset(data);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.total((d) => d.t);
        plot.addDataset(dataset);
      });

      it("can set if connectors are enabled", () => {
        assert.isFalse(plot.connectorsEnabled(), "no connectors by default");
        assert.strictEqual(plot.connectorsEnabled(true), plot, "setter returns calling object");
        plot.renderTo(div);
        const bars = plot.content().selectAll<Element, any>("rect");
        const connectors = plot.content().selectAll<Element, any>("line.connector");
        assert.strictEqual(bars.size(), connectors.size() + 1, "there is one more bar than number of connectors");
        connectors.each(function(datum, index) {
          const connector = d3.select(this);
          const bar = d3.select(bars.nodes()[index]);
          const connectorOnBottom = bar.classed("waterfall-decline");
          if (connectorOnBottom) {
            assert.closeTo(numAttr(connector, "y1"), numAttr(bar, "y") + numAttr(bar, "height"),
              window.Pixel_CloseTo_Requirement, "connector on declining bar at bottom");
          } else {
            assert.closeTo(numAttr(connector, "y1"), numAttr(bar, "y"),
              window.Pixel_CloseTo_Requirement, "connector on non-declining bar at top");
          }
          assert.strictEqual(numAttr(connector, "y1"), numAttr(connector, "y2"), "connector stays at same height");
        });
        plot.destroy();
        div.remove();
      });

      it("can get if connectors are enabled", () => {
        const connectorsEnabled = true;
        plot.connectorsEnabled(connectorsEnabled);
        assert.strictEqual(plot.connectorsEnabled(), connectorsEnabled, "can get if connectors are enabled");
        plot.destroy();
        div.remove();
      });
    });

  });
});
