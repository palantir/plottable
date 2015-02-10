///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {

  describe("Stacked Plot Stacking", () => {
    var stackedPlot: Plottable.Plot.AbstractStacked<number, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      stackedPlot = new Plottable.Plot.AbstractStacked(xScale, yScale);
      stackedPlot.project("x", "x", xScale);
      stackedPlot.project("y", "y", yScale);

      (<any> stackedPlot)._getDrawer = (key: string) => new Plottable._Drawer.AbstractDrawer(key);
      (<any> stackedPlot)._isVertical = true;
    });

    it("uses positive offset on stacking the 0 value", () => {
      var data1 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data2 = [
        {x: 1, y: 0},
        {x: 3, y: 1}
      ];
      var data3 = [
        {x: 1, y: -1},
        {x: 3, y: 1}
      ];
      var data4 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data5 = [
        {x: 1, y: 0},
        {x: 3, y: 1}
      ];

      stackedPlot.addDataset(data1, "d1");
      stackedPlot.addDataset(data2, "d2");
      stackedPlot.addDataset(data3, "d3");
      stackedPlot.addDataset(data4, "d4");
      stackedPlot.addDataset(data5, "d5");

      var ds2PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d2").plotMetadata;
      var ds5PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d5").plotMetadata;
      assert.strictEqual(ds2PlotMetadata.offsets.get("1"), 1, "positive offset was used");
      assert.strictEqual(ds5PlotMetadata.offsets.get("1"), 2, "positive offset was used");
    });

    it("uses negative offset on stacking the 0 value on all negative/0 valued data", () => {
      var data1 = [
        {x: 1, y: -2}
      ];
      var data2 = [
        {x: 1, y: 0}
      ];
      var data3 = [
        {x: 1, y: -1}
      ];
      var data4 = [
        {x: 1, y: 0}
      ];

      stackedPlot.addDataset(data1, "d1");
      stackedPlot.addDataset(data2, "d2");
      stackedPlot.addDataset(data3, "d3");
      stackedPlot.addDataset(data4, "d4");

      var ds2PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d2").plotMetadata;
      var ds4PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d4").plotMetadata;
      assert.strictEqual(ds2PlotMetadata.offsets.get("1"), -2, "positive offset was used");
      assert.strictEqual(ds4PlotMetadata.offsets.get("1"), -3, "positive offset was used");
    });

    it("project can be called after addDataset", () => {
      var data1 = [
        { a: 1, b: 2 }
      ];
      var data2 = [
        { a: 1, b: 4 }
      ];

      stackedPlot.addDataset(data1, "d1");
      stackedPlot.addDataset(data2, "d2");
      var ds1PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d1").plotMetadata;
      var ds2PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d2").plotMetadata;

      assert.isTrue(isNaN(ds1PlotMetadata.offsets.get("1")), "stacking is initially incorrect");

      stackedPlot.project("x", "a");
      stackedPlot.project("y", "b");

      assert.strictEqual(ds2PlotMetadata.offsets.get("1"), 2, "stacking was done correctly");
    });

    it("strings are coerced to numbers for stacking", () => {
      var data1 = [
        { x: 1, y: "-2" }
      ];
      var data2 = [
        { x: 1, y: "3" }
      ];
      var data3 = [
        { x: 1, y: "-1" }
      ];
      var data4 = [
        { x: 1, y: "5" }
      ];
      var data5 = [
        { x: 1, y: "1" }
      ];
      var data6 = [
        { x: 1, y: "-1" }
      ];

      stackedPlot.addDataset(data1, "d1");
      stackedPlot.addDataset(data2, "d2");
      stackedPlot.addDataset(data3, "d3");
      stackedPlot.addDataset(data4, "d4");
      stackedPlot.addDataset(data5, "d5");
      stackedPlot.addDataset(data6, "d6");

      var ds3PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d3").plotMetadata;
      var ds4PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d4").plotMetadata;
      var ds5PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d5").plotMetadata;
      var ds6PlotMetadata = <Plottable.Plot.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get("d6").plotMetadata;

      assert.strictEqual(ds3PlotMetadata.offsets.get("1"), -2, "stacking on data1 numerical y value");
      assert.strictEqual(ds4PlotMetadata.offsets.get("1"), 3, "stacking on data2 numerical y value");
      assert.strictEqual(ds5PlotMetadata.offsets.get("1"), 8, "stacking on data1 + data3 numerical y values");
      assert.strictEqual(ds6PlotMetadata.offsets.get("1"), -3, "stacking on data2 + data4 numerical y values");

      assert.deepEqual((<any> stackedPlot)._stackedExtent, [-4, 9], "stacked extent is as normal");
    });

    it("stacks correctly on empty data", () => {
      var data1: any[] = [
      ];
      var data2: any[] = [
      ];

      stackedPlot.addDataset(data1);
      stackedPlot.addDataset(data2);

      assert.deepEqual(data1, [], "empty data causes no stacking to happen");
      assert.deepEqual(data2, [], "empty data causes no stacking to happen");
    });

    it("does not crash on stacking no datasets", () => {
      var data1 = [
        {x: 1, y: -2}
      ];

      stackedPlot.addDataset(data1, "a");
      assert.doesNotThrow(() => stackedPlot.removeDataset("a"), Error);
    });
  });

  describe("auto scale domain on numeric", () => {
    var svg: D3.Selection;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var yScale: Plottable.Scale.Linear;
    var xScale: Plottable.Scale.Linear;
    var data1: any[];
    var data2: any[];

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([1, 2]);;
      yScale = new Plottable.Scale.Linear();

      data1 = [
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 8}
      ];

      data2 = [
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 3}
      ];
    });

    it("auto scales correctly on stacked area", () => {
      var plot = new Plottable.Plot.StackedArea(xScale, yScale)
                               .addDataset(data1)
                               .addDataset(data2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });

    it("auto scales correctly on stacked bar", () => {
      var plot = new Plottable.Plot.StackedBar(xScale, yScale)
                               .addDataset(data1)
                               .addDataset(data2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });
  });

  describe("auto scale domain on ordinal", () => {
    var svg: D3.Selection;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var yScale: Plottable.Scale.Linear;
    var xScale: Plottable.Scale.Ordinal;
    var data1: any[];
    var data2: any[];

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal().domain(["a", "b"]);;
      yScale = new Plottable.Scale.Linear();

      data1 = [
        {x: "a", y: 1},
        {x: "b", y: 2},
        {x: "c", y: 8}
      ];

      data2 = [
        {x: "a", y: 2},
        {x: "b", y: 2},
        {x: "c", y: 3}
      ];
    });

    it("auto scales correctly on stacked area", () => {
      var plot = new Plottable.Plot.StackedArea(yScale, yScale)
                               .addDataset(data1)
                               .addDataset(data2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });

    it("auto scales correctly on stacked bar", () => {
      var plot = new Plottable.Plot.StackedBar(xScale, yScale)
                               .addDataset(data1)
                               .addDataset(data2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });
  });

  describe("scale extent updates", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Ordinal;
    var yScale: Plottable.Scale.Linear;
    var stackedBarPlot: Plottable.Plot.StackedBar<string, number>;

    beforeEach(() => {
      svg = generateSVG(600, 400);

      xScale = new Plottable.Scale.Ordinal();
      yScale = new Plottable.Scale.Linear();

      stackedBarPlot = new Plottable.Plot.StackedBar(xScale, yScale);
      stackedBarPlot.project("x", "key", xScale);
      stackedBarPlot.project("y", "value", yScale);

      stackedBarPlot.renderTo(svg);
    });

    afterEach(() => {
      svg.remove();
    });

    it("extents are updated as datasets are updated", () => {
      var data1 = [
        { key: "a", value: 1 },
        { key: "b", value: -2 }
      ];
      var data2 = [
        { key: "a", value: 3 },
        { key: "b", value: -4 }
      ];
      var data2_b = [
        { key: "a", value: 1 },
        { key: "b", value: -2 }
      ];

      var dataset2 = new Plottable.Dataset(data2);
      stackedBarPlot.addDataset(data1);
      stackedBarPlot.addDataset(dataset2);

      assert.closeTo(yScale.domain()[0], -6, 1, "min stacked extent is as normal");
      assert.closeTo(yScale.domain()[1], 4, 1, "max stacked extent is as normal");

      dataset2.data(data2_b);

      assert.closeTo(yScale.domain()[0], -4, 1, "min stacked extent decreases in magnitude");
      assert.closeTo(yScale.domain()[1], 2, 1, "max stacked extent decreases in magnitude");
    });

  });

});
