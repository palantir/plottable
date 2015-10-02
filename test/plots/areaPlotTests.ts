///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("AreaPlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Area();
      plot.x((d: any) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("adds a padding exception to the y scale at the constant y0 value", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      yScale.padProportion(0.1);
      let constantY0 = 30;
      yScale.addIncludedValuesProvider((scale: Plottable.Scales.Linear) => [constantY0, constantY0 + 10]);
      let plot = new Plottable.Plots.Area();
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      plot.y0(constantY0);
      plot.addDataset(new Plottable.Dataset([{ x: 0, y: constantY0 + 5 }]));
      plot.renderTo(svg);
      assert.strictEqual(yScale.domain()[0], constantY0, "y Scale doesn't pad beyond 0 when used in a Plots.Area");
      svg.remove();
    });
  });

  describe("AreaPlot", () => {
    let svg: d3.Selection<void>;
    let xScale: Plottable.Scales.Linear;
    let yScale: Plottable.Scales.Linear;
    let xAccessor: any;
    let yAccessor: any;
    let y0Accessor: any;
    let colorAccessor: any;
    let fillAccessor: any;
    let twoPointData = [{foo: 0, bar: 0}, {foo: 1, bar: 1}];
    let simpleDataset: Plottable.Dataset;
    let areaPlot: Plottable.Plots.Area<number>;
    let renderArea: d3.Selection<void>;

    before(() => {
      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 1]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 1]);
      xAccessor = (d: any) => d.foo;
      yAccessor = (d: any) => d.bar;
      y0Accessor = () => 0;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
      fillAccessor = () => "steelblue";
    });

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset(twoPointData);
      areaPlot = new Plottable.Plots.Area<number>();
      areaPlot.addDataset(simpleDataset);
      areaPlot.x(xAccessor, xScale)
              .y(yAccessor, yScale);
      areaPlot.y0(y0Accessor)
              .attr("fill", fillAccessor)
              .attr("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = (<any> areaPlot)._renderArea;
    });

    it("draws area and line correctly", () => {
      let areaPath = renderArea.select(".area");
      assert.strictEqual(TestMethods.normalizePath(areaPath.attr("d")), "M0,500L500,0L500,500L0,500Z", "area d was set correctly");
      assert.strictEqual(areaPath.attr("fill"), "steelblue", "area fill was set correctly");
      let areaComputedStyle = window.getComputedStyle(<Element> areaPath.node());
      assert.strictEqual(areaComputedStyle.stroke, "none", "area stroke renders as \"none\"");

      let linePath = renderArea.select(".line");
      assert.strictEqual(TestMethods.normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
      assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
      let lineComputedStyle = window.getComputedStyle(<Element> linePath.node());
      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
      svg.remove();
    });

    it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", () => {
      areaPlot.y0((d) => d.bar / 2);
      areaPlot.renderTo(svg);
      renderArea = (<any> areaPlot)._renderArea;
      let areaPath = renderArea.select(".area");
      assert.strictEqual(TestMethods.normalizePath(areaPath.attr("d")), "M0,500L500,0L500,250L0,500Z");
      svg.remove();
    });

    it("area is appended before line", () => {
      let paths = renderArea.selectAll("path")[0];
      let areaSelection = renderArea.select(".area")[0][0];
      let lineSelection = renderArea.select(".line")[0][0];
      assert.operator(paths.indexOf(areaSelection), "<", paths.indexOf(lineSelection), "area appended before line");
      svg.remove();
    });

    it("cleans up correctly when removing Datasets", () => {
      areaPlot.renderTo(svg);
      areaPlot.removeDataset(simpleDataset);
      let paths = areaPlot.content().selectAll("path");
      assert.strictEqual(paths.size(), 0, "removing a Dataset cleans up all <path>s associated with it");
      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      let areaData = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      let expectedPath = "M0,500L100,400L100,500L0,500ZM300,200L400,100L400,500L300,500Z";
      let areaPath = renderArea.select(".area");

      let dataWithNaN = areaData.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      simpleDataset.data(dataWithNaN);

      let areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
      TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=NaN case)");

      dataWithNaN[2] = { foo: NaN, bar: 0.4 };
      simpleDataset.data(dataWithNaN);

      areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
      TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=NaN case)");

      let dataWithUndefined = areaData.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      simpleDataset.data(dataWithUndefined);

      areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
      TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=undefined case)");

      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      simpleDataset.data(dataWithUndefined);

      areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
      TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=undefined case)");

      svg.remove();
    });

    describe("selections()", () => {

      it("retrieves all selections with no args", () => {
        let newTwoPointData = [{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }];
        areaPlot.addDataset(new Plottable.Dataset(newTwoPointData));
        let allAreas = areaPlot.selections();
        assert.strictEqual(allAreas.filter(".line").size(), 2, "2 lines retrieved");
        assert.strictEqual(allAreas.filter(".area").size(), 2, "2 areas retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        let twoPointDataset = new Plottable.Dataset([{ foo: 0, bar: 1 }, { foo: 1, bar: 2 }]);
        areaPlot.addDataset(twoPointDataset);
        let allAreas = areaPlot.selections([twoPointDataset]);
        assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
        let selectionData = allAreas.data()[0];
        assert.deepEqual(selectionData, twoPointDataset.data(), "new dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datasets", () => {
        let twoPointDataset = new Plottable.Dataset([{ foo: 0, bar: 1 }, { foo: 1, bar: 2 }]);
        areaPlot.addDataset(twoPointDataset);
        let dummyDataset = new Plottable.Dataset([]);
        let allAreas = areaPlot.selections([twoPointDataset, dummyDataset]);
        assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
        let selectionData = allAreas.data()[0];
        assert.deepEqual(selectionData, twoPointDataset.data(), "new dataset data in selection data");

        svg.remove();
      });
    });

    it("retains original classes when class is projected", () => {
      let newClassProjector = () => "pink";
      areaPlot.attr("class", newClassProjector);
      areaPlot.renderTo(svg);
      let areaPath = renderArea.select(".area");
      assert.isTrue(areaPath.classed("pink"));
      assert.isTrue(areaPath.classed("area"));
      svg.remove();
    });
  });
});
