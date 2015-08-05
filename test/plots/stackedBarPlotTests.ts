///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Stacked Bar Plot", () => {
    var svg: d3.Selection<void>;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scales.Category;
    var yScale: Plottable.Scales.Linear;
    var renderer: Plottable.Plots.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;
    var originalData1: any[];
    var originalData2: any[];

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Category();
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 3]);

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

      renderer = new Plottable.Plots.StackedBar<string, number>();
      renderer.addDataset(dataset1);
      renderer.addDataset(dataset2);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
      renderer.baselineValue(0);
      var xAxis = new Plottable.Axes.Category(xScale, "bottom");
      new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
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
      assert.closeTo(TestMethods.numAttr(bar0, "width"), bandWidth, 2);
      assert.closeTo(TestMethods.numAttr(bar1, "width"), bandWidth, 2);
      assert.closeTo(TestMethods.numAttr(bar2, "width"), bandWidth, 2);
      assert.closeTo(TestMethods.numAttr(bar3, "width"), bandWidth, 2);
      // check heights
      assert.closeTo(TestMethods.numAttr(bar0, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar3");
      // check that bar is aligned on the center of the scale
      var centerX = (selection: d3.Selection<void>) => TestMethods.numAttr(selection, "x") + TestMethods.numAttr(selection, "width") / 2;
      assert.closeTo(centerX(bar0), xScale.scale(bar0X), 0.01, "x pos correct for bar0");
      assert.closeTo(centerX(bar1), xScale.scale(bar1X), 0.01, "x pos correct for bar1");
      assert.closeTo(centerX(bar2), xScale.scale(bar2X), 0.01, "x pos correct for bar2");
      assert.closeTo(centerX(bar3), xScale.scale(bar3X), 0.01, "x pos correct for bar3");
      // now check y values to ensure they do indeed stack
      assert.closeTo(TestMethods.numAttr(bar0, "y"), (400 - axisHeight) / 3 * 2, 0.01, "y is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "y"), (400 - axisHeight) / 3, 0.01, "y is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "y"), 0, 0.01, "y is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");

      assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified");
      assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified");
      svg.remove();
    });

    it("considers lying within a bar's y-range to mean it is closest", () => {
      var bars = (<any> renderer)._renderArea.selectAll("rect");

      var d0 = dataset1.data()[0];
      var d0Px = {
        x: xScale.scale(d0.x),
        y: yScale.scale(d0.y)
      };

      var d1 = dataset2.data()[0];
      var d1Px = {
        x: xScale.scale(d1.x),
        y: 0 // d1 is stacked above d0
      };

      var expected: Plottable.Plots.PlotEntity = {
        datum: d0,
        index: 0,
        dataset: dataset1,
        position: d0Px,
        selection: d3.selectAll([bars[0][0]]),
        component: renderer
      };

      var closest = renderer.entityNearest({ x: 0, y: d0Px.y + 1 });
      TestMethods.assertPlotEntitiesEqual(closest, expected, "bottom bar is closest when within its range");

      expected = {
        datum: d1,
        index: 0,
        dataset: dataset2,
        position: d1Px,
        selection: d3.selectAll([bars[0][2]]),
        component: renderer
      };
      closest = renderer.entityNearest({ x: 0, y: d0Px.y - 1 });
      TestMethods.assertPlotEntitiesEqual(closest, expected, "top bar is closest when within its range");

      svg.remove();
    });
  });

  describe("Stacked Bar Plot Negative Values", () => {
    var svg: d3.Selection<void>;
    var xScale: Plottable.Scales.Category;
    var yScale: Plottable.Scales.Linear;
    var plot: Plottable.Plots.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Category();
      yScale = new Plottable.Scales.Linear();

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

      plot = new Plottable.Plots.StackedBar<string, number>();
      plot.addDataset(new Plottable.Dataset(data1));
      plot.addDataset(new Plottable.Dataset(data2));
      plot.addDataset(new Plottable.Dataset(data3));
      plot.addDataset(new Plottable.Dataset(data4));
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      plot.baselineValue(0);
      var xAxis = new Plottable.Axes.Category(xScale, "bottom");
      new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
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
      assert.operator(TestMethods.numAttr(bar0, "y"), "<", TestMethods.numAttr(bar2, "y"), "'A' bars below baseline in dataset order");
      assert.operator(TestMethods.numAttr(bar2, "y"), "<", TestMethods.numAttr(bar4, "y"), "'A' bars below baseline in dataset order");
      assert.operator(TestMethods.numAttr(bar4, "y"), "<", TestMethods.numAttr(bar6, "y"), "'A' bars below baseline in dataset order");

      assert.operator(TestMethods.numAttr(bar1, "y"), "<", TestMethods.numAttr(bar5, "y"), "'B' bars below baseline in dataset order");
      assert.operator(TestMethods.numAttr(bar3, "y"), ">", TestMethods.numAttr(bar7, "y"), "'B' bars above baseline in dataset order");

      svg.remove();
    });

    it("stacked extent is set correctly", () => {
      assert.deepEqual((<any> plot)._stackedExtent, [-8, 8], "stacked extent is updated accordingly");
      svg.remove();
    });
  });

  describe("Stacked Bar Plot on ModifiedLog Scale", () => {
    it("stacks correctly on a ModifiedLog Scale (vertical)", () => {
      var data1 = [
        { x: "A", y: 10 },
        { x: "B", y: 100 }
      ];
      var data2 = [
        { x: "A", y: 10 },
        { x: "B", y: 100 }
      ];

      var dataset1 = new Plottable.Dataset(data1, { id: "dataset1" });
      var dataset2 = new Plottable.Dataset(data2, { id: "dataset2" });
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.ModifiedLog();
      var plot = new Plottable.Plots.StackedBar();
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      plot.attr("class", (d, i, dataset) => dataset.metadata().id);
      plot.addDataset(dataset1);
      plot.addDataset(dataset2);
      plot.renderTo(svg);

      var dataset1Rects = plot.content().selectAll("." + dataset1.metadata().id);
      dataset1Rects.each(function (datum, index) {
        var rect = d3.select(this);
        var expectedY = yScale.scale(data1[index].y);
        var actualY = TestMethods.numAttr(rect, "y");
        assert.closeTo(actualY, expectedY, 0.1, "y attribute set correctly (dataset 1, datum " + index + ")");
        var expectedHeight = yScale.scale(0) - expectedY;
        var actualHeight = TestMethods.numAttr(rect, "height");
        assert.closeTo(actualHeight, expectedHeight, 0.1, "height attribute set correctly (dataset 1, datum " + index + ")");
      });

      var dataset2Rects = plot.content().selectAll("." + dataset2.metadata().id);
      dataset2Rects.each(function (datum, index) {
        var rect = d3.select(this);
        var expectedY = yScale.scale(data2[index].y + data1[index].y);
        var actualY = TestMethods.numAttr(rect, "y");
        assert.closeTo(actualY, expectedY, 0.1, "y attribute set correctly (dataset 2, datum " + index + ")");
        var expectedHeight = yScale.scale(data1[index].y) - expectedY;
        var actualHeight = TestMethods.numAttr(rect, "height");
        assert.closeTo(actualHeight, expectedHeight, 0.1, "height attribute set correctly (dataset 2, datum " + index + ")");
      });

      svg.remove();
    });

    it("stacks correctly on a ModifiedLog Scale (horizontal)", () => {
      var data1 = [
        { y: "A", x: 10 },
        { y: "B", x: 100 }
      ];
      var data2 = [
        { y: "A", x: 10 },
        { y: "B", x: 100 }
      ];

      var dataset1 = new Plottable.Dataset(data1, { id: "dataset1" });
      var dataset2 = new Plottable.Dataset(data2, { id: "dataset2" });
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.ModifiedLog();
      var yScale = new Plottable.Scales.Category();
      var plot = new Plottable.Plots.StackedBar("horizontal");
      plot.y((d) => d.y, yScale);
      plot.x((d) => d.x, xScale);
      plot.attr("class", (d, i, dataset) => dataset.metadata().id);
      plot.addDataset(dataset1);
      plot.addDataset(dataset2);
      plot.renderTo(svg);

      var dataset1Rects = plot.content().selectAll("." + dataset1.metadata().id);
      dataset1Rects.each(function (datum, index) {
        var rect = d3.select(this);
        var expectedX = xScale.scale(0);
        var actualX = TestMethods.numAttr(rect, "x");
        assert.closeTo(actualX, expectedX, 0.1, "x attribute set correctly (dataset 1, datum " + index + ")");
        var expectedWidth = xScale.scale(data1[index].x) - expectedX;
        var actualWidth = TestMethods.numAttr(rect, "width");
        assert.closeTo(actualWidth, expectedWidth, 0.1, "width attribute set correctly (dataset 1, datum " + index + ")");
      });

      var dataset2Rects = plot.content().selectAll("." + dataset2.metadata().id);
      dataset2Rects.each(function (datum, index) {
        var rect = d3.select(this);
        var expectedX = xScale.scale(data1[index].x);
        var actualX = TestMethods.numAttr(rect, "x");
        assert.closeTo(actualX, expectedX, 0.1, "x attribute set correctly (dataset 2, datum " + index + ")");
        var expectedWidth = xScale.scale(data2[index].x + data1[index].x) - expectedX;
        var actualWidth = TestMethods.numAttr(rect, "width");
        assert.closeTo(actualWidth, expectedWidth, 0.1, "width attribute set correctly (dataset 2, datum " + index + ")");
      });

      svg.remove();
    });
  });

  describe("Horizontal Stacked Bar Plot", () => {
    var svg: d3.Selection<void>;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Category;
    var renderer: Plottable.Plots.StackedBar<number, string>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var rendererWidth: number;
    var bandWidth = 0;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 6]);
      yScale = new Plottable.Scales.Category();

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

      renderer = new Plottable.Plots.StackedBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
      renderer.y((d) => d.name, yScale);
      renderer.x((d) => d.y, xScale);
      renderer.addDataset(new Plottable.Dataset(data1));
      renderer.addDataset(new Plottable.Dataset(data2));
      renderer.baselineValue(0);
      var yAxis = new Plottable.Axes.Category(yScale, "left");
      new Plottable.Components.Table([[yAxis, renderer]]).renderTo(svg);
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
      assert.closeTo(TestMethods.numAttr(bar0, "height"), bandWidth, 2);
      assert.closeTo(TestMethods.numAttr(bar1, "height"), bandWidth, 2);
      assert.closeTo(TestMethods.numAttr(bar2, "height"), bandWidth, 2);
      assert.closeTo(TestMethods.numAttr(bar3, "height"), bandWidth, 2);
      // check widths
      assert.closeTo(TestMethods.numAttr(bar0, "width"), 0, 0.01, "width is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "width"), rendererWidth / 3, 0.01, "width is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "width"), rendererWidth / 3, 0.01, "width is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "width"), rendererWidth / 3 * 2, 0.01, "width is correct for bar3");

      var bar0Y = bar0.data()[0].name;
      var bar1Y = bar1.data()[0].name;
      var bar2Y = bar2.data()[0].name;
      var bar3Y = bar3.data()[0].name;

      // check that bar is aligned on the center of the scale
      var centerY = (selection: d3.Selection<void>) => TestMethods.numAttr(selection, "y") + TestMethods.numAttr(selection, "height") / 2;
      assert.closeTo(centerY(bar0), yScale.scale(bar0Y), 0.01, "y pos correct for bar0");
      assert.closeTo(centerY(bar1), yScale.scale(bar1Y), 0.01, "y pos correct for bar1");
      assert.closeTo(centerY(bar2), yScale.scale(bar2Y), 0.01, "y pos correct for bar2");
      assert.closeTo(centerY(bar3), yScale.scale(bar3Y), 0.01, "y pos correct for bar3");
      // now check x values to ensure they do indeed stack
      assert.closeTo(TestMethods.numAttr(bar0, "x"), 0, 0.01, "x is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "x"), 0, 0.01, "x is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "x"), 0, 0.01, "x is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "x"), rendererWidth / 3, 0.01, "x is correct for bar3");
      svg.remove();
    });
  });

  describe("Stacked Bar Plot Weird Values", () => {
    var svg: d3.Selection<void>;
    var plot: Plottable.Plots.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();

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

      plot = new Plottable.Plots.StackedBar<string, number>();
      plot.addDataset(new Plottable.Dataset(data1));
      plot.addDataset(new Plottable.Dataset(data2));
      plot.addDataset(new Plottable.Dataset(data3));
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      var xAxis = new Plottable.Axes.Category(xScale, "bottom");
      new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
    });

    it("renders correctly", () => {
      var bars = (<any> plot)._renderArea.selectAll("rect");

      assert.lengthOf(bars[0], 7, "draws a bar for each datum");

      var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];

      var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];

      var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];

      assert.closeTo(TestMethods.numAttr(aBars[0], "x"), TestMethods.numAttr(aBars[1], "x"), 0.01, "A bars at same x position");
      assert.operator(TestMethods.numAttr(aBars[0], "y"), ">", TestMethods.numAttr(aBars[1], "y"), "first dataset A bar under second");

      assert.closeTo(TestMethods.numAttr(bBars[0], "x"), TestMethods.numAttr(bBars[1], "x"), 0.01, "B bars at same x position");
      assert.closeTo(TestMethods.numAttr(bBars[1], "x"), TestMethods.numAttr(bBars[2], "x"), 0.01, "B bars at same x position");
      assert.operator(TestMethods.numAttr(bBars[0], "y"), ">", TestMethods.numAttr(bBars[1], "y"), "first dataset B bar under second");
      assert.operator(TestMethods.numAttr(bBars[1], "y"), ">", TestMethods.numAttr(bBars[2], "y"), "second dataset B bar under third");

      assert.closeTo(TestMethods.numAttr(cBars[0], "x"), TestMethods.numAttr(cBars[1], "x"), 0.01, "C bars at same x position");
      assert.operator(TestMethods.numAttr(cBars[0], "y"), ">", TestMethods.numAttr(cBars[1], "y"), "first dataset C bar under second");

      svg.remove();
    });
  });

  describe("Horizontal Stacked Bar Plot Non-Overlapping Datasets", () => {
    var svg: d3.Selection<void>;
    var plot: Plottable.Plots.StackedBar<number, string>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Category();

      var data1 = [
        {y: "A", x: 1, type: "a"},
        {y: "B", x: 2, type: "a"},
        {y: "C", x: 1, type: "a"}
      ];
      var data2 = [
        {y: "A", x: 2, type: "b"},
        {y: "B", x: 3, type: "b"}
      ];
      var data3 = [
        {y: "B", x: 1, type: "c"},
        {y: "C", x: 7, type: "c"}
      ];

      plot = new Plottable.Plots.StackedBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
      plot.addDataset(new Plottable.Dataset(data1));
      plot.addDataset(new Plottable.Dataset(data2));
      plot.addDataset(new Plottable.Dataset(data3));
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      plot.renderTo(svg);
    });

    it("renders correctly", () => {
      var bars = plot.selections();

      assert.strictEqual(bars.size(), 7, "draws a bar for each datum");

      var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];

      var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];

      var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];

      assert.closeTo(TestMethods.numAttr(aBars[0], "y"), TestMethods.numAttr(aBars[1], "y"), 0.01, "A bars at same y position");
      assert.operator(TestMethods.numAttr(aBars[0], "x"), "<", TestMethods.numAttr(aBars[1], "x"), "first dataset A bar under second");

      assert.closeTo(TestMethods.numAttr(bBars[0], "y"), TestMethods.numAttr(bBars[1], "y"), 0.01, "B bars at same y position");
      assert.closeTo(TestMethods.numAttr(bBars[1], "y"), TestMethods.numAttr(bBars[2], "y"), 0.01, "B bars at same y position");
      assert.operator(TestMethods.numAttr(bBars[0], "x"), "<", TestMethods.numAttr(bBars[1], "x"), "first dataset B bar under second");
      assert.operator(TestMethods.numAttr(bBars[1], "x"), "<", TestMethods.numAttr(bBars[2], "x"), "second dataset B bar under third");

      assert.closeTo(TestMethods.numAttr(cBars[0], "y"), TestMethods.numAttr(cBars[1], "y"), 0.01, "C bars at same y position");
      assert.operator(TestMethods.numAttr(cBars[0], "x"), "<", TestMethods.numAttr(cBars[1], "x"), "first dataset C bar under second");

      svg.remove();
    });
  });

  describe("fail safe tests", () => {

    it("conversion fails should be silent in Plot.StackedBar", () => {
      var data1 = [
          { x: "A", y: "s", fill: "blue" },
      ];
      var data2 = [
          { x: "A", y: 1, fill: "red"},
      ];
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();

      var plot = new Plottable.Plots.StackedBar<string, number>();
      var ds1 = new Plottable.Dataset(data1);
      var ds2 = new Plottable.Dataset(data2);
      plot.addDataset(ds1);
      plot.addDataset(ds2);
      plot.attr("fill", "fill");
      plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);

      var ds1FirstColumnOffset = (<any> plot)._stackingResult.get(ds1).get("A").offset;
      var ds2FirstColumnOffset = (<any> plot)._stackingResult.get(ds2).get("A").offset;

      assert.strictEqual(typeof ds1FirstColumnOffset, "number", "ds0 offset should be a number");
      assert.strictEqual(typeof ds2FirstColumnOffset, "number", "ds1 offset should be a number");

      assert.isFalse(Plottable.Utils.Math.isNaN(ds1FirstColumnOffset), "ds0 offset should not be NaN");
      assert.isFalse(Plottable.Utils.Math.isNaN(ds1FirstColumnOffset), "ds1 offset should not be NaN");
    });

    it("bad values on the primary axis should default to 0 (be ignored)", () => {
      var data1 = [
          { x: "A", y: 1, fill: "blue" },
      ];
      var data2 = [
          { x: "A", y: "s", fill: "red"},
      ];
      var data3 = [
          { x: "A", y: 2, fill: "green"},
      ];
      var data4 = [
          { x: "A", y: "0", fill: "purple"},
      ];
      var data5 = [
          { x: "A", y: 3, fill: "pink"},
      ];

      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();

      var plot = new Plottable.Plots.StackedBar<string, number>();
      var ds1 = new Plottable.Dataset(data1);
      var ds2 = new Plottable.Dataset(data2);
      var ds3 = new Plottable.Dataset(data3);
      var ds4 = new Plottable.Dataset(data4);
      var ds5 = new Plottable.Dataset(data5);
      plot.addDataset(ds1);
      plot.addDataset(ds2);
      plot.addDataset(ds3);
      plot.addDataset(ds4);
      plot.addDataset(ds5);
      plot.attr("fill", "fill");
      plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);

      var offset0 = (<any> plot)._stackingResult.get(ds1).get("A").offset;
      var offset2 = (<any> plot)._stackingResult.get(ds3).get("A").offset;
      var offset4 = (<any> plot)._stackingResult.get(ds5).get("A").offset;

      assert.strictEqual(offset0, 0,
        "Plot columns should start from offset 0 (at the very bottom)");
      assert.strictEqual(offset2, 1,
        "third bar should have offset 1, because second bar was not rendered");
      assert.strictEqual(offset4, 3,
        "fifth bar should have offset 3, because fourth bar was not rendered");
    });
  });
});
