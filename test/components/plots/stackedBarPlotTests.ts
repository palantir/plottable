///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Stacked Bar Plot", () => {
    var svg: D3.Selection;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scale.Ordinal;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;
    var originalData1: any[];
    var originalData2: any[];

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal();
      yScale = new Plottable.Scale.Linear().domain([0, 3]);

      originalData1 = [
        {x: "A", y: 1},
        {x: "B", y: 2}
      ];
      originalData2 = [
        {x: "A", y: 2},
        {x: "B", y: 1}
      ];

      var data1 = [
        {x: "A", y: 1},
        {x: "B", y: 2}
      ];
      var data2 = [
        {x: "A", y: 2},
        {x: "B", y: 1}
      ];
      dataset1 = new Plottable.Dataset(data1);
      dataset2 = new Plottable.Dataset(data2);

      renderer = new Plottable.Plot.StackedBar(xScale, yScale);
      renderer.addDataset(dataset1);
      renderer.addDataset(dataset2);
      renderer.project("x", "x", xScale);
      renderer.project("y", "y", yScale);
      renderer.baseline(0);
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
      axisHeight = xAxis.height();
      bandWidth = xScale.rangeBand();
    });

    it("renders correctly", () => {
      var bars = (<any> renderer)._renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      var bar0X = bar0.data()[0].x;
      var bar1X = bar1.data()[0].x;
      var bar2X = bar2.data()[0].x;
      var bar3X = bar3.data()[0].x;
      // check widths
      assert.closeTo(numAttr(bar0, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar1, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar2, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar3, "width"), bandWidth, 2);
      // check heights
      assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar0");
      assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar1");
      assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar2");
      assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar3");
      // check that bar is aligned on the center of the scale
      assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) + bandWidth / 2, 0.01, "x pos correct for bar0");
      assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) + bandWidth / 2, 0.01, "x pos correct for bar1");
      assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + bandWidth / 2, 0.01, "x pos correct for bar2");
      assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + bandWidth / 2, 0.01, "x pos correct for bar3");
      // now check y values to ensure they do indeed stack
      assert.closeTo(numAttr(bar0, "y"), (400 - axisHeight) / 3 * 2, 0.01, "y is correct for bar0");
      assert.closeTo(numAttr(bar1, "y"), (400 - axisHeight) / 3, 0.01, "y is correct for bar1");
      assert.closeTo(numAttr(bar2, "y"), 0, 0.01, "y is correct for bar2");
      assert.closeTo(numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");

      assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified");
      assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified");
      svg.remove();
    });
  });

  describe("Stacked Bar Plot Negative Values", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Ordinal;
    var yScale: Plottable.Scale.Linear;
    var plot: Plottable.Plot.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal();
      yScale = new Plottable.Scale.Linear();

      var data1 = [
        {x: "A", y: -1},
        {x: "B", y: -4}
      ];
      var data2 = [
        {x: "A", y: -1},
        {x: "B", y: 4}
      ];
      var data3 = [
        {x: "A", y: -2},
        {x: "B", y: -4}
      ];
      var data4 = [
        {x: "A", y: -3},
        {x: "B", y: 4}
      ];

      plot = new Plottable.Plot.StackedBar(xScale, yScale);
      plot.addDataset(data1);
      plot.addDataset(data2);
      plot.addDataset(data3);
      plot.addDataset(data4);
      plot.project("x", "x", xScale);
      plot.project("y", "y", yScale);
      plot.baseline(0);
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
      var table = new Plottable.Component.Table([[plot], [xAxis]]).renderTo(svg);
      axisHeight = xAxis.height();
    });

    it("stacking done correctly for negative values", () => {
      var bars = (<any> plot)._renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      var bar4 = d3.select(bars[0][4]);
      var bar5 = d3.select(bars[0][5]);
      var bar6 = d3.select(bars[0][6]);
      var bar7 = d3.select(bars[0][7]);
      // check stacking order
      assert.operator(numAttr(bar0, "y"), "<", numAttr(bar2, "y"), "'A' bars added below the baseline in dataset order");
      assert.operator(numAttr(bar2, "y"), "<", numAttr(bar4, "y"), "'A' bars added below the baseline in dataset order");
      assert.operator(numAttr(bar4, "y"), "<", numAttr(bar6, "y"), "'A' bars added below the baseline in dataset order");

      assert.operator(numAttr(bar1, "y"), "<", numAttr(bar5, "y"), "'B' bars added below the baseline in dataset order");
      assert.operator(numAttr(bar3, "y"), ">", numAttr(bar7, "y"), "'B' bars added above the baseline in dataset order");

      svg.remove();
    });

    it("stacked extent is set correctly", () => {
      assert.deepEqual((<any> plot)._stackedExtent, [-8, 8], "stacked extent is updated accordingly");
      svg.remove();
    });
  });

  describe("Horizontal Stacked Bar Plot", () => {
    var svg: D3.Selection;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Ordinal;
    var renderer: Plottable.Plot.StackedBar<number, string>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var rendererWidth: number;
    var bandWidth = 0;

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([0, 6]);
      yScale = new Plottable.Scale.Ordinal();

      var data1 = [
        {name: "jon", y: 0, type: "q1"},
        {name: "dan", y: 2, type: "q1"}
      ];
      var data2 = [
        {name: "jon", y: 2, type: "q2"},
        {name: "dan", y: 4, type: "q2"}
      ];
      dataset1 = new Plottable.Dataset(data1);
      dataset2 = new Plottable.Dataset(data2);

      renderer = new Plottable.Plot.StackedBar(xScale, yScale, false);
      renderer.project("y", "name", yScale);
      renderer.project("x", "y", xScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.baseline(0);
      var yAxis = new Plottable.Axis.Category(yScale, "left");
      var table = new Plottable.Component.Table([[yAxis, renderer]]).renderTo(svg);
      rendererWidth = renderer.width();
      bandWidth = yScale.rangeBand();
    });

    it("renders correctly", () => {
      var bars = (<any> renderer)._renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      // check heights
      assert.closeTo(numAttr(bar0, "height"), bandWidth, 2);
      assert.closeTo(numAttr(bar1, "height"), bandWidth, 2);
      assert.closeTo(numAttr(bar2, "height"), bandWidth, 2);
      assert.closeTo(numAttr(bar3, "height"), bandWidth, 2);
      // check widths
      assert.closeTo(numAttr(bar0, "width"), 0, 0.01, "width is correct for bar0");
      assert.closeTo(numAttr(bar1, "width"), rendererWidth / 3, 0.01, "width is correct for bar1");
      assert.closeTo(numAttr(bar2, "width"), rendererWidth / 3, 0.01, "width is correct for bar2");
      assert.closeTo(numAttr(bar3, "width"), rendererWidth / 3 * 2, 0.01, "width is correct for bar3");

      var bar0Y = bar0.data()[0].name;
      var bar1Y = bar1.data()[0].name;
      var bar2Y = bar2.data()[0].name;
      var bar3Y = bar3.data()[0].name;

      // check that bar is aligned on the center of the scale
      assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y) + bandWidth / 2, 0.01, "y pos correct for bar0");
      assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y) + bandWidth / 2, 0.01, "y pos correct for bar1");
      assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + bandWidth / 2, 0.01, "y pos correct for bar2");
      assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + bandWidth / 2, 0.01, "y pos correct for bar3");
      // now check x values to ensure they do indeed stack
      assert.closeTo(numAttr(bar0, "x"), 0, 0.01, "x is correct for bar0");
      assert.closeTo(numAttr(bar1, "x"), 0, 0.01, "x is correct for bar1");
      assert.closeTo(numAttr(bar2, "x"), 0, 0.01, "x is correct for bar2");
      assert.closeTo(numAttr(bar3, "x"), rendererWidth / 3, 0.01, "x is correct for bar3");
      svg.remove();
    });
  });

  describe("Stacked Bar Plot Weird Values", () => {
    var svg: D3.Selection;
    var plot: Plottable.Plot.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var xScale = new Plottable.Scale.Ordinal();
      var yScale = new Plottable.Scale.Linear();

      var data1 = [
        {x: "A", y: 1, type: "a"},
        {x: "B", y: 2, type: "a"},
        {x: "C", y: 1, type: "a"}
      ];
      var data2 = [
        {x: "A", y: 2, type: "b"},
        {x: "B", y: 3, type: "b"}
      ];
      var data3 = [
        {x: "B", y: 1, type: "c"},
        {x: "C", y: 7, type: "c"}
      ];

      plot = new Plottable.Plot.StackedBar(xScale, yScale);
      plot.addDataset(data1);
      plot.addDataset(data2);
      plot.addDataset(data3);
      plot.project("x", "x", xScale);
      plot.project("y", "y", yScale);
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
      var table = new Plottable.Component.Table([[plot], [xAxis]]).renderTo(svg);
    });

    it("renders correctly", () => {
      var bars = (<any> plot)._renderArea.selectAll("rect");

      assert.lengthOf(bars[0], 7, "draws a bar for each datum");

      var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];

      var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];

      var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];

      assert.closeTo(numAttr(aBars[0], "x"), numAttr(aBars[1], "x"), 0.01, "A bars at same x position");
      assert.operator(numAttr(aBars[0], "y"), ">", numAttr(aBars[1], "y"), "first dataset A bar under second");

      assert.closeTo(numAttr(bBars[0], "x"), numAttr(bBars[1], "x"), 0.01, "B bars at same x position");
      assert.closeTo(numAttr(bBars[1], "x"), numAttr(bBars[2], "x"), 0.01, "B bars at same x position");
      assert.operator(numAttr(bBars[0], "y"), ">", numAttr(bBars[1], "y"), "first dataset B bar under second");
      assert.operator(numAttr(bBars[1], "y"), ">", numAttr(bBars[2], "y"), "second dataset B bar under third");

      assert.closeTo(numAttr(cBars[0], "x"), numAttr(cBars[1], "x"), 0.01, "C bars at same x position");
      assert.operator(numAttr(cBars[0], "y"), ">", numAttr(cBars[1], "y"), "first dataset C bar under second");

      svg.remove();
    });
  });
});
