import * as d3 from "d3/build/d3.node";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("AreaPlot", () => {
    describe("Basic Usage", () => {
      let svg: SimpleSelection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Area<{}>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Area();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("does not throw error when rendering without data", () => {
        assert.doesNotThrow(() => plot.renderTo(svg), Error, "rendering without data does not throw an error");
        svg.remove();
      });

      it("adds a padding exception to the y scale at the constant y0 value", () => {
        yScale.padProportion(0.1);
        let constantY0 = 30;
        yScale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => [constantY0, constantY0 + 10]);
        plot.y0(constantY0);
        plot.addDataset(new Plottable.Dataset([{ x: 0, y: constantY0 + 5 }]));
        plot.renderTo(svg);
        assert.strictEqual(yScale.domain()[0], constantY0, "y Scale doesn't pad beyond 0 when used in a Plots.Area");
        svg.remove();
      });
    });

    describe("Rendering", () => {
      let svg: SimpleSelection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let areaPlot: Plottable.Plots.Area<number>;
      let fill = "steelblue";

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        svg = TestMethods.generateSVG();
        let twoPointData = [{x: 0, y: 0}, {x: 1, y: 1}];
        let simpleDataset = new Plottable.Dataset(twoPointData);
        areaPlot = new Plottable.Plots.Area<number>();
        areaPlot.addDataset(simpleDataset);
        areaPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        areaPlot.y0(() => 0)
                .attr("fill", () => fill)
                .attr("stroke", (d, i) => d3.rgb(d.x, d.y, i).toString())
                .renderTo(svg);
      });

      it("draws area and line with correct data points and correct fill and stroke attributes", () => {
        let content = areaPlot.content();
        let areaPath = content.select(".area");
        areaPlot.datasets().forEach((dataset: Plottable.Dataset) => {
          let data = dataset.data();
          let pointsInArea = getPointsInArea(areaPlot, data);
          TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);
          assert.strictEqual(areaPath.attr("fill"), fill, "area fill was set correctly");
          assert.strictEqual(areaPath.style("stroke"), "none", "area stroke renders as \"none\"");

          let linePath = content.select(".line");
          TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), data, xScale, yScale);
          assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
          assert.strictEqual(linePath.style("fill"), "none", "line fill renders as \"none\"");
        });
        svg.remove();
      });

      it("draws area appropriately with non-constant y0 values", () => {
        areaPlot.y0((d) => d.y / 2);
        areaPlot.datasets().forEach((dataset: Plottable.Dataset) => {
          let data = dataset.data();
          let areaPath = areaPlot.content().select(".area");
          let pointsInArea = getPointsInArea(areaPlot, data);
          TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);
        });
        svg.remove();
      });

      it("places the area before line", () => {
        let content = areaPlot.content();
        let paths = content.selectAll("path")[0];
        let areaElement = content.select(".area")[0][0];
        let lineElement = content.select(".line")[0][0];
        assert.operator(paths.indexOf(areaElement), "<", paths.indexOf(lineElement), "area appended before line");
        svg.remove();
      });

      it("removes the plot svg elements when removing Datasets", () => {
        areaPlot.renderTo(svg);
        let paths = areaPlot.content().selectAll("path");
        let pathSize = paths.size();
        let dataset = areaPlot.datasets()[0];
        areaPlot.removeDataset(dataset);
        paths = areaPlot.content().selectAll("path");
        assert.strictEqual(paths.size(), pathSize - 2, "removing a Dataset cleans up both <path>s associated with it");
        svg.remove();
      });

      it("skips data points consisting of NaN and undefined x and y values", () => {
        let areaData = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 },
        ];

        let areaPath = areaPlot.content().select(".area");
        let dataset = areaPlot.datasets()[0];
        let dataWithNaN = areaData.slice();
        dataWithNaN[2] = { x: 0.4, y: NaN };
        dataset.data(dataWithNaN);

        let pointsInArea = getPointsInArea(areaPlot, dataWithNaN.slice(0, 2)).concat(getPointsInArea(areaPlot, dataWithNaN.slice(3, 5)));
        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        dataWithNaN[2] = { x: NaN, y: 0.4 };
        dataset.data(dataWithNaN);

        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        let dataWithUndefined = areaData.slice();
        dataWithUndefined[2] = { x: 0.4, y: undefined };
        dataset.data(dataWithUndefined);

        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        dataWithUndefined[2] = { x: undefined, y: 0.4 };
        dataset.data(dataWithUndefined);

        TestMethods.assertPathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        svg.remove();
      });

      it("retains the area class when setting css class via attr", () => {
        let cssClass = "pink";
        areaPlot.attr("class", cssClass);
        areaPlot.renderTo(svg);
        let areaPath = areaPlot.content().select(".area");
        assert.isTrue(areaPath.classed(cssClass), "it has css class set via attr");
        assert.isTrue(areaPath.classed("area"), "it has default css class");
        svg.remove();
      });
    });

    describe("Selections", () => {
      let svg: SimpleSelection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let areaPlot: Plottable.Plots.Area<number>;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        svg = TestMethods.generateSVG();
        let simpleDataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
        areaPlot = new Plottable.Plots.Area<number>();
        areaPlot.addDataset(simpleDataset);
        areaPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        areaPlot.y0(0)
                .attr("fill", "steelblue")
                .attr("stroke", (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString())
                .renderTo(svg);
      });

      it("retrieves all selections with no args", () => {
        let newTwoPointData = [{ x: 2, y: 1 }, { x: 3, y: 2 }];
        areaPlot.addDataset(new Plottable.Dataset(newTwoPointData));
        let allAreas = areaPlot.selections();
        assert.strictEqual(allAreas.filter(".line").size(), 2, "2 lines retrieved");
        assert.strictEqual(allAreas.filter(".area").size(), 2, "2 areas retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        let twoPointDataset = new Plottable.Dataset([{ x: 0, y: 1 }, { x: 1, y: 2 }]);
        areaPlot.addDataset(twoPointDataset);
        let allAreas = areaPlot.selections([twoPointDataset]);
        assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
        let selectionData = allAreas.data()[0];
        assert.deepEqual(selectionData, twoPointDataset.data(), "new dataset data in selection data");

        svg.remove();
      });
    });

    function getPointsInArea(plot: Plottable.Plots.Area<any>, points: Plottable.Point[]) {
      let y0Binding = plot.y0();
      let ds = plot.datasets()[0];
      let bottomPoints = points.map((d, i) => {
        let x = d.x;
        let y0 = y0Binding.accessor(d, i, ds);
        return { x: x, y: y0 };
      }).reverse();
      return points.concat(bottomPoints);
    };
  });
});
