///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Clustered Bar Plot", () => {
    var svg: d3.Selection<void>;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scales.Category;
    var yScale: Plottable.Scales.Linear;
    var renderer: Plottable.Plots.ClusteredBar<string, number>;
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
      yScale.domain([0, 2]);

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

      renderer = new Plottable.Plots.ClusteredBar<string, number>();
      renderer.addDataset(dataset1);
      renderer.addDataset(dataset2);
      renderer.baselineValue(0);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
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
      assert.closeTo(TestMethods.numAttr(bar0, "width"), 40, 2);
      assert.closeTo(TestMethods.numAttr(bar1, "width"), 40, 2);
      assert.closeTo(TestMethods.numAttr(bar2, "width"), 40, 2);
      assert.closeTo(TestMethods.numAttr(bar3, "width"), 40, 2);

      // check heights
      assert.closeTo(TestMethods.numAttr(bar0, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "height"), (400 - axisHeight), 0.01, "height is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "height"), (400 - axisHeight), 0.01, "height is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar3");

      // check that clustering is correct
      var innerScale = (<any>renderer)._makeInnerScale();
      var off = innerScale.scale("0");
      var width = xScale.rangeBand() / 2;
      assert.closeTo(TestMethods.numAttr(bar0, "x") + TestMethods.numAttr(bar0, "width") / 2, xScale.scale(bar0X) - width + off, 0.01
          , "x pos correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "x") + TestMethods.numAttr(bar1, "width") / 2, xScale.scale(bar1X) - width + off, 0.01
          , "x pos correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "x") + TestMethods.numAttr(bar2, "width") / 2, xScale.scale(bar2X) + width - off, 0.01
          , "x pos correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "x") + TestMethods.numAttr(bar3, "width") / 2, xScale.scale(bar3X) + width - off, 0.01
          , "x pos correct for bar3");

      assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified");
      assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified");
      svg.remove();
    });
  });

  describe("Horizontal Clustered Bar Plot", () => {
    var svg: d3.Selection<void>;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var yScale: Plottable.Scales.Category;
    var xScale: Plottable.Scales.Linear;
    var renderer: Plottable.Plots.ClusteredBar<number, string>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var rendererWidth: number;
    var bandWidth = 0;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      yScale = new Plottable.Scales.Category();
      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 2]);

      var data1 = [
        {y: "A", x: 1},
        {y: "B", x: 2}
      ];
      var data2 = [
        {y: "A", x: 2},
        {y: "B", x: 1}
      ];
      dataset1 = new Plottable.Dataset(data1);
      dataset2 = new Plottable.Dataset(data2);

      renderer = new Plottable.Plots.ClusteredBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
      renderer.addDataset(new Plottable.Dataset(data1));
      renderer.addDataset(new Plottable.Dataset(data2));
      renderer.baselineValue(0);
      renderer.x((d) => d.x, xScale);
      renderer.y((d) => d.y, yScale);
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

      // check widths
      assert.closeTo(TestMethods.numAttr(bar0, "height"), 26, 2, "height is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "height"), 26, 2, "height is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "height"), 26, 2, "height is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "height"), 26, 2, "height is correct for bar3");

      // check heights
      assert.closeTo(TestMethods.numAttr(bar0, "width"), rendererWidth / 2, 0.01, "width is correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "width"), rendererWidth, 0.01, "width is correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "width"), rendererWidth, 0.01, "width is correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "width"), rendererWidth / 2, 0.01, "width is correct for bar3");

      var bar0Y = bar0.data()[0].y;
      var bar1Y = bar1.data()[0].y;
      var bar2Y = bar2.data()[0].y;
      var bar3Y = bar3.data()[0].y;

      // check that clustering is correct
      var innerScale = (<any>renderer)._makeInnerScale();
      var off = innerScale.scale("0");
      var width = yScale.rangeBand() / 2;
      assert.closeTo(TestMethods.numAttr(bar0, "y") + TestMethods.numAttr(bar0, "height") / 2, yScale.scale(bar0Y) - width + off, 0.01
            , "y pos correct for bar0");
      assert.closeTo(TestMethods.numAttr(bar1, "y") + TestMethods.numAttr(bar1, "height") / 2, yScale.scale(bar1Y) - width + off, 0.01
            , "y pos correct for bar1");
      assert.closeTo(TestMethods.numAttr(bar2, "y") + TestMethods.numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + width - off, 0.01
            , "y pos correct for bar2");
      assert.closeTo(TestMethods.numAttr(bar3, "y") + TestMethods.numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + width - off, 0.01
            , "y pos correct for bar3");
      svg.remove();
    });
  });

  describe("Clustered Bar Plot Missing Values", () => {
    var svg: d3.Selection<void>;
    var plot: Plottable.Plots.ClusteredBar<string, number>;

    beforeEach(() => {
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();

      var data1 = [{x: "A", y: 1}, {x: "B", y: 2}, {x: "C", y: 1}];
      var data2 = [{x: "A", y: 2}, {x: "B", y: 4}];
      var data3 = [{x: "B", y: 15}, {x: "C", y: 15}];

      plot = new Plottable.Plots.ClusteredBar<string, number>();
      plot.addDataset(new Plottable.Dataset(data1));
      plot.addDataset(new Plottable.Dataset(data2));
      plot.addDataset(new Plottable.Dataset(data3));
      plot.baselineValue(0);
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      var xAxis = new Plottable.Axes.Category(xScale, "bottom");
      new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
    });

    it("renders correctly", () => {
      var bars = (<any> plot)._renderArea.selectAll("rect");

      assert.lengthOf(bars[0], 7, "Number of bars should be equivalent to number of datum");

      var aBar0 = d3.select(bars[0][0]);
      var aBar1 = d3.select(bars[0][3]);

      var bBar0 = d3.select(bars[0][1]);
      var bBar1 = d3.select(bars[0][4]);
      var bBar2 = d3.select(bars[0][5]);

      var cBar0 = d3.select(bars[0][2]);
      var cBar1 = d3.select(bars[0][6]);

      // check bars are in domain order
      assert.operator(TestMethods.numAttr(aBar0, "x"), "<", TestMethods.numAttr(bBar0, "x"), "first dataset bars ordered correctly");
      assert.operator(TestMethods.numAttr(bBar0, "x"), "<", TestMethods.numAttr(cBar0, "x"), "first dataset bars ordered correctly");

      assert.operator(TestMethods.numAttr(aBar1, "x"), "<", TestMethods.numAttr(bBar1, "x"), "second dataset bars ordered correctly");

      assert.operator(TestMethods.numAttr(bBar2, "x"), "<", TestMethods.numAttr(cBar1, "x"), "third dataset bars ordered correctly");

      // check that clustering is correct
      assert.operator(TestMethods.numAttr(aBar0, "x"), "<", TestMethods.numAttr(aBar1, "x"), "A bars clustered in dataset order");

      assert.operator(TestMethods.numAttr(bBar0, "x"), "<", TestMethods.numAttr(bBar1, "x"), "B bars clustered in dataset order");
      assert.operator(TestMethods.numAttr(bBar1, "x"), "<", TestMethods.numAttr(bBar2, "x"), "B bars clustered in dataset order");

      assert.operator(TestMethods.numAttr(cBar0, "x"), "<", TestMethods.numAttr(cBar1, "x"), "C bars clustered in dataset order");

      svg.remove();
    });
  });

  describe("Horizontal Clustered Bar Plot Missing Values", () => {
    var svg: d3.Selection<void>;
    var plot: Plottable.Plots.ClusteredBar<number, string>;

    beforeEach(() => {
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Category();

      var data1 = [{y: "A", x: 1}, {y: "B", x: 2}, {y: "C", x: 1}];
      var data2 = [{y: "A", x: 2}, {y: "B", x: 4}];
      var data3 = [{y: "B", x: 15}, {y: "C", x: 15}];

      plot = new Plottable.Plots.ClusteredBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
      plot.addDataset(new Plottable.Dataset(data1));
      plot.addDataset(new Plottable.Dataset(data2));
      plot.addDataset(new Plottable.Dataset(data3));
      plot.x((d) => d.x, xScale);
      plot.y((d) => d.y, yScale);
      plot.renderTo(svg);
    });

    it("renders correctly", () => {
      var bars = plot.selections();

      assert.strictEqual(bars.size(), 7, "Number of bars should be equivalent to number of datum");

      var aBar0 = d3.select(bars[0][0]);
      var aBar1 = d3.select(bars[0][3]);

      var bBar0 = d3.select(bars[0][1]);
      var bBar1 = d3.select(bars[0][4]);
      var bBar2 = d3.select(bars[0][5]);

      var cBar0 = d3.select(bars[0][2]);
      var cBar1 = d3.select(bars[0][6]);

      // check bars are in domain order
      assert.operator(TestMethods.numAttr(aBar0, "y"), "<", TestMethods.numAttr(bBar0, "y"), "first dataset bars ordered correctly");
      assert.operator(TestMethods.numAttr(bBar0, "y"), "<", TestMethods.numAttr(cBar0, "y"), "first dataset bars ordered correctly");

      assert.operator(TestMethods.numAttr(aBar1, "y"), "<", TestMethods.numAttr(bBar1, "y"), "second dataset bars ordered correctly");

      assert.operator(TestMethods.numAttr(bBar2, "y"), "<", TestMethods.numAttr(cBar1, "y"), "third dataset bars ordered correctly");

      // check that clustering is correct
      assert.operator(TestMethods.numAttr(aBar0, "y"), "<", TestMethods.numAttr(aBar1, "y"), "A bars clustered in dataset order");

      assert.operator(TestMethods.numAttr(bBar0, "y"), "<", TestMethods.numAttr(bBar1, "y"), "B bars clustered in dataset order");
      assert.operator(TestMethods.numAttr(bBar1, "y"), "<", TestMethods.numAttr(bBar2, "y"), "B bars clustered in dataset order");

      assert.operator(TestMethods.numAttr(cBar0, "y"), "<", TestMethods.numAttr(cBar1, "y"), "C bars clustered in dataset order");

      svg.remove();
    });
  });
});
