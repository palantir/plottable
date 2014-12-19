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

      stackedPlot.addDataset("d1", data1);
      stackedPlot.addDataset("d2", data2);
      stackedPlot.addDataset("d3", data3);
      stackedPlot.addDataset("d4", data4);
      stackedPlot.addDataset("d5", data5);

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

      stackedPlot.addDataset("d1", data1);
      stackedPlot.addDataset("d2", data2);
      stackedPlot.addDataset("d3", data3);
      stackedPlot.addDataset("d4", data4);

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

      stackedPlot.addDataset("d1", data1);
      stackedPlot.addDataset("d2", data2);
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

      stackedPlot.addDataset("d1", data1);
      stackedPlot.addDataset("d2", data2);
      stackedPlot.addDataset("d3", data3);
      stackedPlot.addDataset("d4", data4);
      stackedPlot.addDataset("d5", data5);
      stackedPlot.addDataset("d6", data6);

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

      stackedPlot.addDataset("a", data1);
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

});
