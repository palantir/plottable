///<reference path="../testReference.ts" />

describe("Plots", () => {
  // HACKHACK #1798: beforeEach being used below
  describe("LinePlot", () => {
    it("entities() with NaN in data", () => {
      let svg = TestMethods.generateSVG(500, 500);
      let dataWithNaN = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: NaN },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];

      let xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 1]);
      let yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 1]);

      let linePlot = new Plottable.Plots.Line();
      linePlot.addDataset(new Plottable.Dataset(dataWithNaN));
      linePlot.x((d: any) => d.foo, xScale);
      linePlot.y((d: any) => d.bar, yScale);
      linePlot.renderTo(svg);

      let entities = linePlot.entities();

      let expectedLength = dataWithNaN.length - 1;
      assert.lengthOf(entities, expectedLength, "NaN data was not returned");

      svg.remove();
    });

    describe("interpolation", () => {
      it("interpolator() get / set", () => {
        let linePlot = new Plottable.Plots.Line();
        assert.strictEqual(linePlot.interpolator(), "linear", "the default interpolation mode is linear");
        assert.strictEqual(linePlot.interpolator("step"), linePlot, "setting an interpolation mode returns the plot");
        assert.strictEqual(linePlot.interpolator(), "step", "setting an interpolation mode works");
      });

      it("interpolator() behavior for the step function", () => {
        let svg = TestMethods.generateSVG(400, 400);
        let data = [
          {"x": 0.0, "y": 0},
          {"x": 0.8, "y": 0.717},
          {"x": 1.6, "y": 0.999},
          {"x": 2.4, "y": 0.675},
          {"x": 3.2, "y": -0.058},
          {"x": 4.0, "y": -0.756},
          {"x": 4.8, "y": -0.996},
          {"x": 5.6, "y": -0.631},
        ];

        let xScale = new Plottable.Scales.Linear();
        let yScale = new Plottable.Scales.Linear();
        let linePlot = new Plottable.Plots.Line();
        linePlot.addDataset(new Plottable.Dataset(data));
        linePlot.x((d) => d.x, xScale);
        linePlot.y((d) => d.y, yScale);

        linePlot.renderTo(svg);

        let svgPath: string;
        svgPath = linePlot.content().select("path").attr("d");
        assert.lengthOf(svgPath.match(/L/g), data.length - 1, "one line for each pair of consecutive points");
        assert.isNull(svgPath.match(/V/g), "no vertical lines");
        assert.isNull(svgPath.match(/H/g), "no horizontal lines");

        linePlot.interpolator("step");

        svgPath = linePlot.content().select("path").attr("d");
        assert.lengthOf(svgPath.match(/V/g), data.length - 1, "one vertical line for each pair of consecutive points");
        assert.lengthOf(svgPath.match(/H/g), data.length, "one horizontal line for each point");
        assert.isNull(svgPath.match(/L/g), "no other lines");

        svg.remove();
      });
    });
  });

  describe("LinePlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Line();
      plot.x((d: any) => d.x, xScale);
      plot.y((d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });
  });

  describe("LinePlot", () => {
    let svg: d3.Selection<void>;
    let xScale: Plottable.Scales.Linear;
    let yScale: Plottable.Scales.Linear;
    let xAccessor: any;
    let yAccessor: any;
    let colorAccessor: any;
    let twoPointData = [{foo: 0, bar: 0}, {foo: 1, bar: 1}];
    let simpleDataset: Plottable.Dataset;
    let linePlot: Plottable.Plots.Line<number>;
    let renderArea: d3.Selection<void>;

    before(() => {
      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 1]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 1]);
      xAccessor = (d: any) => d.foo;
      yAccessor = (d: any) => d.bar;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
    });

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset(twoPointData);
      linePlot = new Plottable.Plots.Line<number>();
      linePlot.addDataset(simpleDataset);
      linePlot.x(xAccessor, xScale)
              .y(yAccessor, yScale)
              .attr("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = (<any> linePlot)._renderArea;
    });

    it("draws a line correctly", () => {
      let linePath = renderArea.select(".line");
      assert.strictEqual(TestMethods.normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
      assert.strictEqual(linePath.style("fill"), "none", "line fill renders as \"none\"");
      svg.remove();
    });

    it("attributes set appropriately from accessor", () => {
      let areaPath = renderArea.select(".line");
      assert.strictEqual(areaPath.attr("stroke"), "#000000", "stroke set correctly");
      svg.remove();
    });

    it("attributes can be changed by projecting new accessor and re-render appropriately", () => {
      let newColorAccessor = () => "pink";
      linePlot.attr("stroke", newColorAccessor);
      linePlot.renderTo(svg);
      let linePath = renderArea.select(".line");
      assert.strictEqual(linePath.attr("stroke"), "pink", "stroke changed correctly");
      svg.remove();
    });

    it("attributes can be changed by projecting attribute accessor (sets to first datum attribute)", () => {
      let data = JSON.parse(JSON.stringify(twoPointData)); // deep copy to not affect other tests
      data.forEach(function(d: any) { d.stroke = "pink"; });
      simpleDataset.data(data);
      linePlot.attr("stroke", (d) => d.stroke);
      let linePath = renderArea.select(".line");
      assert.strictEqual(linePath.attr("stroke"), "pink", "stroke set to uniform stroke color");

      data[0].stroke = "green";
      simpleDataset.data(data);
      assert.strictEqual(linePath.attr("stroke"), "green", "stroke set to first datum stroke color");
      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      let lineData = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      simpleDataset.data(lineData);
      let linePath = renderArea.select(".line");
      let dOriginal = TestMethods.normalizePath(linePath.attr("d"));

      function assertCorrectPathSplitting(msgPrefix: string) {
        let d = TestMethods.normalizePath(linePath.attr("d"));
        let pathSegements = d.split("M").filter((segment) => segment !== "");
        assert.lengthOf(pathSegements, 2, msgPrefix + " split path into two segments");
        let firstSegmentContained = dOriginal.indexOf(pathSegements[0]) >= 0;
        assert.isTrue(firstSegmentContained, "first path segment is a subpath of the original path");
        let secondSegmentContained = dOriginal.indexOf(pathSegements[1]) >= 0;
        assert.isTrue(secondSegmentContained, "second path segment is a subpath of the original path");
      }

      let dataWithNaN = lineData.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      simpleDataset.data(dataWithNaN);
      assertCorrectPathSplitting("y=NaN");
      dataWithNaN[2] = { foo: NaN, bar: 0.4 };
      simpleDataset.data(dataWithNaN);
      assertCorrectPathSplitting("x=NaN");

      let dataWithUndefined = lineData.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      simpleDataset.data(dataWithUndefined);
      assertCorrectPathSplitting("y=undefined");
      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      simpleDataset.data(dataWithUndefined);
      assertCorrectPathSplitting("x=undefined");

      svg.remove();
    });

    describe("selections()", () => {
      it("retrieves all dataset selections with no args", () => {
        let dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);

        let allLines = linePlot.selections();
        assert.strictEqual(allLines.size(), 2, "all lines retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        let dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);

        let allLines = linePlot.selections([dataset3]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        let selectionData = allLines.data();
        assert.include(selectionData, dataset3.data(), "third dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Dataset", () => {
        let dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);
        let dummyDataset = new Plottable.Dataset([]);

        let allLines = linePlot.selections([dataset3, dummyDataset]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        let selectionData = allLines.data();
        assert.include(selectionData, dataset3.data(), "third dataset data in selection data");

        svg.remove();
      });

    });

    describe("entities()", () => {
      it("retrieves correct data", () => {
        let dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);

        let nodes = linePlot.entities().map((entity) => entity.selection.node());
        let uniqueNodes: EventTarget[] = [];
        nodes.forEach((node) => {
          if (uniqueNodes.indexOf(node) === -1) {
            uniqueNodes.push(node);
          }
        });
        assert.lengthOf(uniqueNodes, linePlot.datasets().length, "one Element per Dataset");
        svg.remove();
      });
    });

    describe("entityNearest()", () => {
      let lines: d3.Selection<void>;
      let d0: any, d1: any;
      let d0Px: Plottable.Point, d1Px: Plottable.Point;
      let dataset2: Plottable.Dataset;

      beforeEach(() => {
        dataset2 = new Plottable.Dataset([
          { foo: 0, bar: 0.75 },
          { foo: 1, bar: 0.25 }
        ]);

        linePlot.addDataset(dataset2);

        lines = d3.selectAll(".line-plot .line");
        d0 = dataset2.data()[0];
        d0Px = {
          x: xScale.scale(xAccessor(d0)),
          y: yScale.scale(yAccessor(d0))
        };

        d1 = dataset2.data()[1];
        d1Px = {
          x: xScale.scale(xAccessor(d1)),
          y: yScale.scale(yAccessor(d1))
        };
      });

      it("returns nearest Entity", () => {
        let expected: Plottable.Plots.PlotEntity = {
          datum: d0,
          index: 0,
          dataset: dataset2,
          position: d0Px,
          selection: d3.selectAll([lines[0][1]]),
          component: linePlot
        };

        let closest = linePlot.entityNearest({x: d0Px.x, y: d0Px.y - 1});
        TestMethods.assertPlotEntitiesEqual(closest, expected, "if above a point, it is closest");

        closest = linePlot.entityNearest({x: d0Px.x, y: d0Px.y + 1});
        TestMethods.assertPlotEntitiesEqual(closest, expected, "if below a point, it is closest");

        closest = linePlot.entityNearest({x: d0Px.x + 1, y: d0Px.y + 1});
        TestMethods.assertPlotEntitiesEqual(closest, expected, "if right of a point, it is closest");

        expected = {
          datum: d1,
          index: 1,
          dataset: dataset2,
          position: d1Px,
          selection: d3.selectAll([lines[0][1]]),
          component: linePlot
        };

        closest = linePlot.entityNearest({x: d1Px.x - 1, y: d1Px.y});
        TestMethods.assertPlotEntitiesEqual(closest, expected, "if left of a point, it is closest");

        svg.remove();
      });

      it("considers only in-view points", () => {
        xScale.domain([0.25, 1]);

        let expected: Plottable.Plots.PlotEntity = {
          datum: d1,
          index: 1,
          dataset: dataset2,
          position: {
            x: xScale.scale(xAccessor(d1)),
            y: yScale.scale(yAccessor(d1))
          },
          selection: d3.selectAll([lines[0][1]]),
          component: linePlot
        };

        let closest = linePlot.entityNearest({ x: xScale.scale(0.25), y: d1Px.y });
        TestMethods.assertPlotEntitiesEqual(closest, expected, "only in-view points are considered");

        svg.remove();
      });

      it("returns undefined if no Entities are visible", () => {
        linePlot = new Plottable.Plots.Line<number>();
        let closest = linePlot.entityNearest({ x: d0Px.x, y: d0Px.y });
        assert.isUndefined(closest, "returns undefined if no Entity can be found");
        svg.remove();
      });
    });

    it("retains original classes when class is projected", () => {
      let newClassProjector = () => "pink";
      linePlot.attr("class", newClassProjector);
      linePlot.renderTo(svg);
      let linePath = renderArea.select(".line");
      assert.isTrue(linePath.classed("pink"), "'pink' class is applied");
      assert.isTrue(linePath.classed("line"), "'line' class is retained");
      svg.remove();
    });
  });

  describe("Line Plot", () => {
    describe("smooth autoranging", () => {

      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
      });

      afterEach(() => {
        svg.remove();
      });

      it("smooth autoranging works", () => {
        xScale.domain([0.1, 1.1]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("y");

        xScale.padProportion(0);
        yScale.padProportion(0);
        line.renderTo(svg);

        assert.deepEqual(yScale.domain(), [0, 1], "when there are no visible points in the view, the y-scale domain defaults to [0, 1]");

        line.autorangeSmooth(true);

        let base = data[0].y;
        let x1 = xScale.domain()[1] - data[0].x;
        let x2 = data[1].x - data[0].x;
        let y2 = data[1].y - data[0].y;
        let expectedBottom = base + y2 * x1 / x2;

        x1 = xScale.domain()[0] - data[0].x;
        let expectedTop = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        line.autorangeSmooth(false);
        assert.deepEqual(yScale.domain(), [0, 1], "resetting the smooth autorange works");

        xScale.domain([data[0].x, data[1].x]);
        assert.deepEqual(yScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge poitns (no smooth)");

        line.autorangeSmooth(true);
        assert.deepEqual(yScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge points (smooth)");
      });

      it("smooth autoranging works (called before accessors)", () => {
        xScale.domain([0.1, 1.1]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.autorangeSmooth(true);
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("y");

        line.renderTo(svg);

        let base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let x2 = data[1].x - data[0].x;
        let y2 = data[1].y - data[0].y;
        let expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");
      });

      it("smooth autoranging works (called before autorangeMode)", () => {
        xScale.domain([0.1, 1.1]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeSmooth(true);
        line.autorangeMode("y");

        line.renderTo(svg);

        let base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let x2 = data[1].x - data[0].x;
        let y2 = data[1].y - data[0].y;
        let expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");
      });

      it("smooth autoranging works (called before rendering)", () => {
        xScale.domain([0.1, 1.1]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("y");

        line.autorangeSmooth(true);
        line.renderTo(svg);

        let base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let x2 = data[1].x - data[0].x;
        let y2 = data[1].y - data[0].y;
        let expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");
      });

      it("smooth autoranging works (called after rendering)", () => {
        xScale.domain([0.1, 1.1]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("y");

        line.renderTo(svg);
        line.autorangeSmooth(true);

        let base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let x2 = data[1].x - data[0].x;
        let y2 = data[1].y - data[0].y;
        let expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");
      });

      it("smooth autoranging works (called after rendering, before autorangeMode)", () => {
        xScale.domain([0.1, 1.1]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));

        line.renderTo(svg);

        line.autorangeSmooth(true);
        line.autorangeMode("y");

        let base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let x2 = data[1].x - data[0].x;
        let y2 = data[1].y - data[0].y;
        let expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        let expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");
      });

      it("autoDomaining works with smooth autoranging (before rendering)", () => {
        xScale.domain([-0.1, 0.2]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("y");

        line.autorangeSmooth(true);
        xScale.autoDomain();
        line.renderTo(svg);

        assert.deepEqual(xScale.domain(), [-0.2, 2], "autoDomain works even when autoranging is done smoothly");

        line.autorangeSmooth(false);
        assert.deepEqual(xScale.domain(), [-0.2, 2], "autoDomain works when smooth autoranging is disabled back");
      });

      it("autoDomaining works with smooth autoranging (after rendering)", () => {
        xScale.domain([-0.1, 0.2]);

        let data = [
          {"x": 0.0, "y": -1},
          {"x": 1.8, "y": -2}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("y");

        line.renderTo(svg);

        line.autorangeSmooth(true);
        xScale.autoDomain();

        assert.deepEqual(xScale.domain(), [-0.2, 2], "autoDomain works even when autoranging is done smoothly");

        line.autorangeSmooth(false);
        assert.deepEqual(xScale.domain(), [-0.2, 2], "autoDomain works when smooth autoranging is disabled back");
      });

      it("smooth autoranging works for vertical lines", () => {
        yScale.domain([0.1, 1.1]);

        let data = [
          {"x": -2, "y": 1.8},
          {"x": -1, "y": 0.0}
        ];

        let line = new Plottable.Plots.Line();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(new Plottable.Dataset(data));
        line.autorangeMode("x");

        xScale.padProportion(0);
        yScale.padProportion(0);
        line.renderTo(svg);

        assert.deepEqual(xScale.domain(), [0, 1], "when there are no visible points in the view, the x-scale domain defaults to [0, 1]");

        line.autorangeSmooth(true);

        let base = data[0].x;
        let x1 = (yScale.domain()[1] - data[0].y);
        let x2 = data[1].y - data[0].y;
        let y2 = data[1].x - data[0].x;
        let expectedTop = base + y2 * x1 / x2;

        x1 = (yScale.domain()[0] - data[0].y);
        let expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(xScale.domain()[0], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(xScale.domain()[1], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (right)");

        line.autorangeSmooth(false);
        assert.deepEqual(xScale.domain(), [0, 1], "resetting the smooth autorange works");

        yScale.domain([data[0].y, data[1].y]);
        assert.deepEqual(xScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge poitns (no smooth)");

        line.autorangeSmooth(true);
        assert.deepEqual(xScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge points (smooth)");
      });

    });
  });
});
