///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Stacked Area Plot", () => {
    var svg: d3.Selection<void>;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Linear;
    var renderer: Plottable.Plots.StackedArea<number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Linear();
      xScale.domain([1, 3]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 4]);
      var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);

      var data1 = [
        {x: 1, y: 1, type: "a"},
        {x: 3, y: 2, type: "a"}
      ];
      var data2 = [
        {x: 1, y: 3, type: "b"},
        {x: 3, y: 1, type: "b"}
      ];
      dataset1 = new Plottable.Dataset(data1);
      dataset2 = new Plottable.Dataset(data2);

      renderer = new Plottable.Plots.StackedArea<number>();
      renderer.addDataset(dataset1);
      renderer.addDataset(dataset2);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
      renderer.attr("fill", "type", colorScale);
      var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
      new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
    });

    it("renders correctly", () => {
      var areas = (<any> renderer)._renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      var d0 = TestMethods.normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
      var d0Ys = d0.slice(1, d0.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");

      var area1 = d3.select(areas[0][1]);
      var d1 = TestMethods.normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
      var d1Ys = d1.slice(1, d1.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");

      var domain = yScale.domain();
      assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
      assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
      svg.remove();
    });

    it("pixel positions account for stack offsets", () => {
      var dataYs = renderer.entities().map((entity) => yScale.invert(entity.position.y));
      var dataset1Ys = dataset1.data().map((d) => d.y);
      var dataset2Ys = dataset2.data().map((d, i) => d.y + dataset1.data()[i].y);
      assert.includeMembers(dataYs, dataset1Ys, "all dataset1 points found");
      assert.includeMembers(dataYs, dataset2Ys, "all dataset2 points found");
      svg.remove();
    });

  });

  describe("Stacked Area Plot no data", () => {
    var svg: d3.Selection<void>;
    var renderer: Plottable.Plots.StackedArea<number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var xScale = new Plottable.Scales.Linear();
      xScale.domain([1, 3]);
      var yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 4]);
      var colorScale = new Plottable.Scales.Color("10");

      var data1: any[] = [
      ];
      var data2 = [
        {x: 1, y: 3, type: "b"},
        {x: 3, y: 1, type: "b"}
      ];

      renderer = new Plottable.Plots.StackedArea<number>();
      renderer.addDataset(new Plottable.Dataset(data1));
      renderer.addDataset(new Plottable.Dataset(data2));
      renderer.attr("fill", "type", colorScale);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
      new Plottable.Components.Table([[renderer]]).renderTo(svg);
    });

    it("path elements rendered correctly", () => {
      var areas = (<any> renderer)._renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      assert.strictEqual(area0.attr("d"), null, "no path string on an empty dataset");

      var area1 = d3.select(areas[0][1]);
      assert.notEqual(area1.attr("d"), "", "path string has been created");
      assert.strictEqual(area1.attr("fill"), "#1f77b4", "fill attribute is correct");

      svg.remove();
    });

  });

  describe("Stacked Area Plot Stacking", () => {
    var svg: d3.Selection<void>;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Linear;
    var renderer: Plottable.Plots.StackedArea<number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Linear();
      xScale.domain([1, 3]);
      yScale = new Plottable.Scales.Linear();
      var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);

      var data1 = [
        {x: 1, y: 1, type: "a"},
        {x: 3, y: 2, type: "a"}
      ];
      var data2 = [
        {x: 1, y: 5, type: "b"},
        {x: 3, y: 1, type: "b"}
      ];

      renderer = new Plottable.Plots.StackedArea<number>();
      renderer.addDataset(new Plottable.Dataset(data1));
      renderer.addDataset(new Plottable.Dataset(data2));
      renderer.attr("fill", "type", colorScale);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
      renderer.renderTo(svg);
    });

    it("stacks correctly on adding datasets", () => {

      assert.closeTo(0, yScale.domain()[0], 1, "0 is close to lower bound");
      assert.closeTo(6, yScale.domain()[1], 1, "6 is close to upper bound");

      var oldLowerBound = yScale.domain()[0];
      var oldUpperBound = yScale.domain()[1];
      renderer.detach();
      var data = [
        {x: 1, y: 0, type: "c"},
        {x: 3, y: 0, type: "c"}
      ];
      var datasetA = new Plottable.Dataset(data);
      renderer.addDataset(datasetA);
      renderer.renderTo(svg);

      assert.strictEqual(oldLowerBound, yScale.domain()[0], "lower bound doesn't change with 0 added");
      assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't change with 0 added");

      oldLowerBound = yScale.domain()[0];
      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      data = [
        {x: 1, y: 10, type: "d"},
        {x: 3, y: 3, type: "d"}
      ];
      var datasetB = new Plottable.Dataset(data);
      renderer.addDataset(datasetB);
      renderer.renderTo(svg);

      assert.closeTo(oldLowerBound, yScale.domain()[0], 2, "lower bound doesn't change on positive addition");
      assert.closeTo(oldUpperBound + 10, yScale.domain()[1], 2, "upper bound increases");

      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      data = [
        {x: 1, y: 0, type: "e"},
        {x: 3, y: 1, type: "e"}
      ];
      var datasetC = new Plottable.Dataset(data);
      renderer.addDataset(datasetC);
      renderer.renderTo(svg);

      assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't increase since maximum doesn't increase");

      renderer.removeDataset(datasetA);
      renderer.removeDataset(datasetB);
      renderer.removeDataset(datasetC);
      svg.remove();
    });

    it("stacks correctly on removing datasets", () => {
      renderer.detach();

      var data = [
        {x: 1, y: 0, type: "c"},
        {x: 3, y: 0, type: "c"}
      ];
      var datasetA = new Plottable.Dataset(data);
      renderer.addDataset(datasetA);

      data = [
        {x: 1, y: 10, type: "d"},
        {x: 3, y: 3, type: "d"}
      ];
      var datasetB = new Plottable.Dataset(data);
      renderer.addDataset(datasetB);

      data = [
        {x: 1, y: 0, type: "e"},
        {x: 3, y: 1, type: "e"}
      ];
      var datasetC = new Plottable.Dataset(data);
      renderer.addDataset(datasetC);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);

      renderer.renderTo(svg);

      assert.closeTo(16, yScale.domain()[1], 2, "Initially starts with around 14 at highest extent");

      renderer.detach();
      renderer.removeDataset(datasetA);
      renderer.renderTo(svg);

      assert.closeTo(16, yScale.domain()[1], 2, "Remains with around 14 at highest extent");

      var oldUpperBound = yScale.domain()[1];
      renderer.detach();
      renderer.removeDataset(datasetB);
      renderer.renderTo(svg);

      assert.closeTo(oldUpperBound - 10, yScale.domain()[1], 2, "Highest extent decreases by around 10");

      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      renderer.removeDataset(datasetC);
      renderer.renderTo(svg);

      assert.strictEqual(oldUpperBound, yScale.domain()[1], "Extent doesn't change if maximum doesn't change");
      svg.remove();
    });

    it("stacks correctly on modifying a dataset", () => {
      assert.closeTo(0, yScale.domain()[0], 1, "0 is close to lower bound");
      assert.closeTo(6, yScale.domain()[1], 1, "6 is close to upper bound");

      var oldLowerBound = yScale.domain()[0];
      var oldUpperBound = yScale.domain()[1];
      renderer.detach();
      var data = [
        {x: 1, y: 0, type: "c"},
        {x: 3, y: 0, type: "c"}
      ];
      var dataset = new Plottable.Dataset(data);
      renderer.addDataset(dataset);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
      renderer.renderTo(svg);

      assert.strictEqual(oldLowerBound, yScale.domain()[0], "lower bound doesn't change with 0 added");
      assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't change with 0 added");

      oldLowerBound = yScale.domain()[0];
      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      data = [
        {x: 1, y: 10, type: "c"},
        {x: 3, y: 3, type: "c"}
      ];
      dataset.data(data);
      renderer.renderTo(svg);

      assert.closeTo(oldLowerBound, yScale.domain()[0], 2, "lower bound doesn't change on positive addition");
      assert.closeTo(oldUpperBound + 10, yScale.domain()[1], 2, "upper bound increases");

      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      data = [
        {x: 1, y: 8, type: "c"},
        {x: 3, y: 3, type: "c"}
      ];
      dataset.data(data);
      renderer.renderTo(svg);

      assert.closeTo(oldUpperBound - 2, yScale.domain()[1], 1, "upper bound decreases by 2");

      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      data = [
        {x: 1, y: 8, type: "c"},
        {x: 3, y: 1, type: "c"}
      ];
      dataset.data(data);
      renderer.renderTo(svg);

      assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound does not change");
      svg.remove();
    });

    it("warning is thrown when datasets are updated with different domains", () => {
      var flag = false;
      var oldWarn = Plottable.Utils.Window.warn;
      Plottable.Utils.Window.warn = (msg: string) => {
        if (msg.indexOf("domain") > -1) { flag = true; }
      };

      var missingDomainData = [
        { x: 1, y: 0, type: "c" }
      ];
      var dataset = new Plottable.Dataset(missingDomainData);
      renderer.addDataset(dataset);

      Plottable.Utils.Window.warn = oldWarn;
      assert.isTrue(flag, "warning has been issued about differing domains");

      svg.remove();
    });
  });

  describe("Stacked Area Plot Project", () => {
    var svg: d3.Selection<void>;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Linear;
    var renderer: Plottable.Plots.StackedArea<number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Linear();
      xScale.domain([1, 3]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 4]);
      var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);

      var data1 = [
        {x: 1, yTest: 1, type: "a"},
        {x: 3, yTest: 2, type: "a"}
      ];
      var data2 = [
        {x: 1, yTest: 3, type: "b"},
        {x: 3, yTest: 1, type: "b"}
      ];

      renderer = new Plottable.Plots.StackedArea<number>();
      renderer.y((d) => d.yTest, yScale);
      renderer.x((d) => d.x, xScale);
      renderer.addDataset(new Plottable.Dataset(data1));
      renderer.addDataset(new Plottable.Dataset(data2));
      renderer.attr("fill", (d) => d.type, colorScale);
      var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
      new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
    });

    it("renders correctly", () => {
      var areas = (<any> renderer)._renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      var d0 = TestMethods.normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
      var d0Ys = d0.slice(1, d0.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");

      var area1 = d3.select(areas[0][1]);
      var d1 = TestMethods.normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
      var d1Ys = d1.slice(1, d1.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");

      var domain = yScale.domain();
      assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
      assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
      svg.remove();
    });

    it("project works correctly", () => {
      renderer.attr("check", (d) => d.type);
      var areas = (<any> renderer)._renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      assert.strictEqual(area0.attr("check"), "a", "projector has been applied to first area");

      var area1 = d3.select(areas[0][1]);
      assert.strictEqual(area1.attr("check"), "b", "projector has been applied to second area");
      svg.remove();
    });

  });

  describe("fail safe tests", () => {
    it("0 as a string coerces correctly and is not subject to off by one errors", () => {
      var data0 = [
        { x: 1, y: 1, fill: "blue" },
        { x: 2, y: 2, fill: "blue" },
        { x: 3, y: 3, fill: "blue" },
      ];
      var data1 = [
        { x: 1, y: 1, fill: "red" },
        { x: 2, y: "0", fill: "red" },
        { x: 3, y: 3, fill: "red" },
      ];
      var data2 = [
        { x: 1, y: 1, fill: "green" },
        { x: 2, y: 2, fill: "green" },
        { x: 3, y: 3, fill: "green" },
      ];
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();

      var plot = new Plottable.Plots.StackedArea<number>();
      var dataset0 = new Plottable.Dataset(data0);
      plot.addDataset(dataset0);
      var dataset1 = new Plottable.Dataset(data1);
      plot.addDataset(dataset1);
      var dataset2 = new Plottable.Dataset(data2);
      plot.addDataset(dataset2);
      plot.attr("fill", "fill");
      plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);

      var ds0Point2Offset = (<any> plot)._stackingResult.get(dataset0).get("2").offset;
      var ds1Point2Offset = (<any> plot)._stackingResult.get(dataset1).get("2").offset;
      var ds2Point2Offset = (<any> plot)._stackingResult.get(dataset2).get("2").offset;

      assert.strictEqual(ds0Point2Offset, 0,
        "dataset0 (blue) sh1uld have no offset on middle point");
      assert.strictEqual(ds1Point2Offset, 2,
        "dataset1 (red) should have this offset and be on top of blue dataset");
      assert.strictEqual(ds2Point2Offset, 2,
        "dataset2 (green) should have this offset because the red dataset has no height in this point");
    });

    it("null defaults to 0", () => {
      var data0 = [
        { x: 1, y: 1, fill: "blue" },
        { x: 2, y: 2, fill: "blue" },
        { x: 3, y: 3, fill: "blue" },
      ];
      var data1 = [
        { x: 1, y: 1, fill: "red" },
        { x: 2, y: "0", fill: "red" },
        { x: 3, y: 3, fill: "red" },
      ];
      var data2 = [
        { x: 1, y: 1, fill: "green" },
        { x: 2, y: 2, fill: "green" },
        { x: 3, y: 3, fill: "green" },
      ];
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();

      var plot = new Plottable.Plots.StackedArea<number>();
      var dataset0 = new Plottable.Dataset(data0);
      plot.addDataset(dataset0);
      var dataset1 = new Plottable.Dataset(data1);
      plot.addDataset(dataset1);
      var dataset2 = new Plottable.Dataset(data2);
      plot.addDataset(dataset2);
      plot.attr("fill", "fill");
      plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);

      var ds0Point2Offset = (<any> plot)._stackingResult.get(dataset0).get("2").offset;
      var ds1Point2Offset = (<any> plot)._stackingResult.get(dataset1).get("2").offset;
      var ds2Point2Offset = (<any> plot)._stackingResult.get(dataset2).get("2").offset;

      assert.strictEqual(ds0Point2Offset, 0,
        "dataset0 (blue) should have no offset on middle point");
      assert.strictEqual(ds1Point2Offset, 2,
        "dataset1 (red) should have this offset and be on top of blue dataset");
      assert.strictEqual(ds2Point2Offset, 2,
        "dataset2 (green) should have this offset because the red dataset has no height in this point");
    });

  });
});
