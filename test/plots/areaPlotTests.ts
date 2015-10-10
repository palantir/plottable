///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("AreaPlot", () => {
    describe("Basic Usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Area<{}>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Area();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("renders correctly with no data", () => {
        assert.doesNotThrow(() => plot.renderTo(svg), Error);
        assert.strictEqual(plot.width(), SVG_WIDTH, "was allocated width");
        assert.strictEqual(plot.height(), SVG_HEIGHT, "was allocated height");
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
      let svg: d3.Selection<void>;
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

      it("draws area and line correctly", () => {
        let content = areaPlot.content();
        let areaPath = content.select(".area");
        let data = areaPlot.datasets()[0].data();
        let pointsInArea = getPointsInArea(areaPlot, data);
        TestMethods.assertLinePathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);
        assert.strictEqual(areaPath.attr("fill"), fill, "area fill was set correctly");
        assert.strictEqual(areaPath.style("stroke"), "none", "area stroke renders as \"none\"");

        let linePath = content.select(".line");
        TestMethods.assertLinePathEqualToDataPoints(linePath.attr("d"), data, xScale, yScale);
        assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
        assert.strictEqual(linePath.style("fill"), "none", "line fill renders as \"none\"");
        svg.remove();
      });

      it("fills for non-zero floor values appropriately", () => {
        areaPlot.y0((d) => d.y / 2);
        areaPlot.renderTo(svg);
        let data = areaPlot.datasets()[0].data();
        let areaPath = areaPlot.content().select(".area");
        let pointsInArea = getPointsInArea(areaPlot, data);
        TestMethods.assertLinePathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);
        svg.remove();
      });

      it("places the area before line", () => {
        let content = areaPlot.content();
        let paths = content.selectAll("path")[0];
        let areaSelection = content.select(".area")[0][0];
        let lineSelection = content.select(".line")[0][0];
        assert.operator(paths.indexOf(areaSelection), "<", paths.indexOf(lineSelection), "area appended before line");
        svg.remove();
      });

      it("cleans up correctly when removing Datasets", () => {
        areaPlot.renderTo(svg);
        let dataset = areaPlot.datasets()[0];
        areaPlot.removeDataset(dataset);
        let paths = areaPlot.content().selectAll("path");
        assert.strictEqual(paths.size(), 0, "removing a Dataset cleans up all <path>s associated with it");
        svg.remove();
      });

      it("correctly handles NaN and undefined x and y values", () => {
        let areaData = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 }
        ];

        let areaPath = areaPlot.content().select(".area");
        let dataset = areaPlot.datasets()[0];
        let dataWithNaN = areaData.slice();
        dataWithNaN[2] = { x: 0.4, y: NaN };
        dataset.data(dataWithNaN);

        let pointsInArea = getPointsInArea(areaPlot, dataWithNaN.slice(0, 2)).concat(getPointsInArea(areaPlot, dataWithNaN.slice(3, 5)));
        TestMethods.assertLinePathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        dataWithNaN[2] = { x: NaN, y: 0.4 };
        dataset.data(dataWithNaN);

        TestMethods.assertLinePathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        let dataWithUndefined = areaData.slice();
        dataWithUndefined[2] = { x: 0.4, y: undefined };
        dataset.data(dataWithUndefined);

        TestMethods.assertLinePathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        dataWithUndefined[2] = { x: undefined, y: 0.4 };
        dataset.data(dataWithUndefined);

        TestMethods.assertLinePathEqualToDataPoints(areaPath.attr("d"), pointsInArea, xScale, yScale);

        svg.remove();
      });

      it("retains original classes when setting css class via attr", () => {
        areaPlot.attr("class", () => "pink");
        areaPlot.renderTo(svg);
        let areaPath = areaPlot.content().select(".area");
        assert.isTrue(areaPath.classed("pink"));
        assert.isTrue(areaPath.classed("area"));
        svg.remove();
      });
    });

    describe("Selections", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let areaPlot: Plottable.Plots.Area<number>;
      let renderArea: d3.Selection<void>;

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
        renderArea = areaPlot.content();
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
      let firstPoint = points[0];
      let lastPoint = points[points.length - 1];
      let ds = plot.datasets()[0];
      let lasty0 = y0Binding.accessor(lastPoint, points.length - 1, ds);
      let firsty0 = y0Binding.accessor(firstPoint, 0, ds);
      return points.concat([{ x: lastPoint.x, y: lasty0 }, { x: firstPoint.x, y: firsty0 }]);
    };
  });
});
