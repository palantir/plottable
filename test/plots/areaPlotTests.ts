import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("AreaPlot", () => {
    describe("Basic Usage", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Area<{}>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Area();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("does not throw error when rendering without data", () => {
        assert.doesNotThrow(() => plot.renderTo(div), Error, "rendering without data does not throw an error");
        div.remove();
      });

      it("adds a padding exception to the y scale at the constant y0 value", () => {
        yScale.padProportion(0.1);
        const constantY0 = 30;
        yScale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => [constantY0, constantY0 + 10]);
        plot.y0(constantY0);
        plot.addDataset(new Plottable.Dataset([{ x: 0, y: constantY0 + 5 }]));
        plot.renderTo(div);
        assert.strictEqual(yScale.domain()[0], constantY0, "y Scale doesn't pad beyond 0 when used in a Plots.Area");
        div.remove();
      });
    });

    describe("Rendering", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let areaPlot: Plottable.Plots.Area<number>;
      const fill = "steelblue";

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        div = TestMethods.generateDiv();
        const twoPointData = [{x: 0, y: 0}, {x: 1, y: 1}];
        const simpleDataset = new Plottable.Dataset(twoPointData);
        areaPlot = new Plottable.Plots.Area<number>();
        areaPlot.addDataset(simpleDataset);
        areaPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        areaPlot.y0(() => 0)
                .attr("fill", () => fill)
                .attr("stroke", (d, i) => d3.rgb(d.x, d.y, i).toString())
                .renderTo(div);
      });

      it("draws area and line with correct data points and correct fill and stroke attributes", () => {
        const content = areaPlot.content();
        const areaPath = content.select(".area");
        areaPlot.datasets().forEach((dataset: Plottable.Dataset) => {
          const data = dataset.data();
          const pointsInArea = getPointsInArea(areaPlot, data);
          TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);
          assert.strictEqual(areaPath.attr("fill"), fill, "area fill was set correctly");
          assert.strictEqual(areaPath.style("stroke"), "none", "area stroke renders as \"none\"");

          const linePath = content.select(".line");
          TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), data, xScale, yScale);
          assert.strictEqual(linePath.attr("stroke"), "rgb(0, 0, 0)", "line stroke was set correctly");
          assert.strictEqual(linePath.style("fill"), "none", "line fill renders as \"none\"");
        });
        div.remove();
      });

      it("draws area appropriately with non-constant y0 values", () => {
        areaPlot.y0((d) => d.y / 2);
        areaPlot.datasets().forEach((dataset: Plottable.Dataset) => {
          const data = dataset.data();
          const areaPath = areaPlot.content().select(".area");
          const pointsInArea = getPointsInArea(areaPlot, data);
          TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);
        });
        div.remove();
      });

      it("places the area before line", () => {
        const content = areaPlot.content();
        const paths = content.selectAll<Element, any>("path").nodes();
        const areaElement = content.select<Element>(".area").node();
        const lineElement = content.select<Element>(".line").node();
        assert.operator(paths.indexOf(areaElement), "<", paths.indexOf(lineElement), "area appended before line");
        div.remove();
      });

      it("removes the plot svg elements when removing Datasets", () => {
        areaPlot.renderTo(div);
        let paths = areaPlot.content().selectAll<Element, any>("path");
        const pathSize = paths.size();
        const dataset = areaPlot.datasets()[0];
        areaPlot.removeDataset(dataset);
        paths = areaPlot.content().selectAll<Element, any>("path");
        assert.strictEqual(paths.size(), pathSize - 2, "removing a Dataset cleans up both <path>s associated with it");
        div.remove();
      });

      it("skips data points consisting of NaN and undefined x and y values", () => {
        const areaData = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 },
        ];

        const areaPath = areaPlot.content().select(".area");
        const dataset = areaPlot.datasets()[0];
        const dataWithNaN = areaData.slice();
        dataWithNaN[2] = { x: 0.4, y: NaN };
        dataset.data(dataWithNaN);

        const pointsInArea = getPointsInArea(areaPlot, dataWithNaN.slice(0, 2)).concat(getPointsInArea(areaPlot, dataWithNaN.slice(3, 5)));
        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        dataWithNaN[2] = { x: NaN, y: 0.4 };
        dataset.data(dataWithNaN);

        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        const dataWithUndefined = areaData.slice();
        dataWithUndefined[2] = { x: 0.4, y: undefined };
        dataset.data(dataWithUndefined);

        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        dataWithUndefined[2] = { x: undefined, y: 0.4 };
        dataset.data(dataWithUndefined);

        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        div.remove();
      });

      it("retains the area class when setting css class via attr", () => {
        const cssClass = "pink";
        areaPlot.attr("class", cssClass);
        areaPlot.renderTo(div);
        const areaPath = areaPlot.content().select(".area");
        assert.isTrue(areaPath.classed(cssClass), "it has css class set via attr");
        assert.isTrue(areaPath.classed("area"), "it has default css class");
        div.remove();
      });
    });

    describe("Selections", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let areaPlot: Plottable.Plots.Area<number>;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        div = TestMethods.generateDiv();
        const simpleDataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
        areaPlot = new Plottable.Plots.Area<number>();
        areaPlot.addDataset(simpleDataset);
        areaPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        areaPlot.y0(0)
                .attr("fill", "steelblue")
                .attr("stroke", (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString())
                .renderTo(div);
      });

      it("retrieves all selections with no args", () => {
        const newTwoPointData = [{ x: 2, y: 1 }, { x: 3, y: 2 }];
        areaPlot.addDataset(new Plottable.Dataset(newTwoPointData));
        const allAreas = areaPlot.selections();
        assert.strictEqual(allAreas.filter(".line").size(), 2, "2 lines retrieved");
        assert.strictEqual(allAreas.filter(".area").size(), 2, "2 areas retrieved");

        div.remove();
      });

      it("retrieves correct selections", () => {
        const twoPointDataset = new Plottable.Dataset([{ x: 0, y: 1 }, { x: 1, y: 2 }]);
        areaPlot.addDataset(twoPointDataset);
        const allAreas = areaPlot.selections([twoPointDataset]);
        assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
        const selectionData = allAreas.data()[0];
        assert.deepEqual(selectionData, twoPointDataset.data(), "new dataset data in selection data");

        div.remove();
      });
    });

    function getPointsInArea(plot: Plottable.Plots.Area<any>, points: Plottable.Point[]) {
      const y0Binding = plot.y0();
      const ds = plot.datasets()[0];
      const bottomPoints = points.map((d, i) => {
        const x = d.x;
        const y0 = y0Binding.accessor(d, i, ds);
        return { x: x, y: y0 };
      }).reverse();
      return points.concat(bottomPoints);
    }
  });
});
