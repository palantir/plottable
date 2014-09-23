///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Stacked Area Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedArea<number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([1, 3]);
      yScale = new Plottable.Scale.Linear().domain([0, 4]);
      var colorScale = new Plottable.Scale.Color("10").domain(["a", "b"]);

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

      renderer = new Plottable.Plot.StackedArea(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.project("fill", "type", colorScale);
      var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
    });

    beforeEach(() => {
      verifier.start();
    });

    afterEach(() => {
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });

    it("renders correctly", () => {
      var areas = renderer._renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      var d0 = normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
      var d0Ys = d0.slice(1, d0.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");

      var area1 = d3.select(areas[0][1]);
      var d1 = normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
      var d1Ys = d1.slice(1, d1.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");

      var domain = yScale.domain();
      assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
      assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
    });

  });

  describe("Stacked Area Plot Stacking", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedArea<number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([1, 3]);
      yScale = new Plottable.Scale.Linear();
      var colorScale = new Plottable.Scale.Color("10").domain(["a", "b"]);

      var data1 = [
        {x: 1, y: 1, type: "a"},
        {x: 3, y: 2, type: "a"}
      ];
      var data2 = [
        {x: 1, y: 5, type: "b"},
        {x: 3, y: 1, type: "b"}
      ];

      renderer = new Plottable.Plot.StackedArea(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.project("fill", "type", colorScale);
      renderer.renderTo(svg);
    });

    beforeEach(() => {
      verifier.start();
    });

    afterEach(() => {
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
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
      renderer.addDataset("a", new Plottable.Dataset(data));
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
      renderer.addDataset("b", new Plottable.Dataset(data));
      renderer.renderTo(svg);

      assert.closeTo(oldLowerBound, yScale.domain()[0], 2, "lower bound doesn't change on positive addition");
      assert.closeTo(oldUpperBound + 10, yScale.domain()[1], 2, "upper bound increases");

      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      data = [
        {x: 1, y: 0, type: "e"},
        {x: 3, y: 1, type: "e"}
      ];
      renderer.addDataset("c", new Plottable.Dataset(data));
      renderer.renderTo(svg);

      assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't increase since maximum doesn't increase");

      renderer.removeDataset("a");
      renderer.removeDataset("b");
      renderer.removeDataset("c");
    });

    it("stacks correctly on removing datasets", () => {
      renderer.detach();

      var data = [
        {x: 1, y: 0, type: "c"},
        {x: 3, y: 0, type: "c"}
      ];
      renderer.addDataset("a", new Plottable.Dataset(data));

      data = [
        {x: 1, y: 10, type: "d"},
        {x: 3, y: 3, type: "d"}
      ];
      renderer.addDataset("b", new Plottable.Dataset(data));

      data = [
        {x: 1, y: 0, type: "e"},
        {x: 3, y: 1, type: "e"}
      ];
      renderer.addDataset("c", new Plottable.Dataset(data));

      renderer.renderTo(svg);

      assert.closeTo(16, yScale.domain()[1], 2, "Initially starts with around 14 at highest extent");

      renderer.detach();
      renderer.removeDataset("a");
      renderer.renderTo(svg);

      assert.closeTo(16, yScale.domain()[1], 2, "Remains with around 14 at highest extent");

      var oldUpperBound = yScale.domain()[1];
      renderer.detach();
      renderer.removeDataset("b");
      renderer.renderTo(svg);

      assert.closeTo(oldUpperBound - 10, yScale.domain()[1], 2, "Highest extent decreases by around 10");

      oldUpperBound = yScale.domain()[1];
      renderer.detach();
      renderer.removeDataset("c");
      renderer.renderTo(svg);

      assert.strictEqual(oldUpperBound, yScale.domain()[1], "Extent doesn't change if maximum doesn't change");
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
    });
  });
});
