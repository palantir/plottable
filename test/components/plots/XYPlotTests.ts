///<reference path="../../testReference.ts" />
var assert = chai.assert;

describe("Plots", () => {
  describe("XY Plot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Linear;
    var plot: Plottable.XYPlot<number, number>;
    var simpleDataset = new Plottable.Dataset([
      { a: -6, b: 6 },
      { a: -2, b: 2 },
      { a: 2, b: -2 },
      { a: 6, b: -6 }
    ]);
    var xAccessor = (d: any) => d.a;
    var yAccessor = (d: any) => d.b;

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Linear();
      plot = new Plottable.XYPlot(xScale, yScale);
      plot.addDataset(simpleDataset)
          .project("x", xAccessor, xScale)
          .project("y", yAccessor, yScale)
          .renderTo(svg);
    });

    it("automatically adjusting Y domain over visible points", () => {
      xScale.domain([-3, 3]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(false);
      svg.remove();
    });

    it("automatically adjusting Y domain when no points are visible", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      assert.deepEqual(yScale.domain(), [-1, 1], "domain equivalent to that with empty dataset");
      svg.remove();
    });

    it("automatically adjusting X domain over visible points", () => {
      yScale.domain([-3, 3]);
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.automaticallyAdjustXScaleOverVisiblePoints(true);
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.automaticallyAdjustXScaleOverVisiblePoints(false);
      svg.remove();
    });

    it("automatically adjusting X domain when no points are visible", () => {
      plot.automaticallyAdjustXScaleOverVisiblePoints(true);
      yScale.domain([-0.5, 0.5]);
      assert.deepEqual(xScale.domain(), [-1, 1], "domain equivalent to that with empty dataset");
      svg.remove();
    });

    it("showAllData()", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("show all data without auto adjust domain", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(false);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("listeners are deregistered after removal", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.destroy();

      var xScaleCallbacks = (<any> xScale)._callbacks.values();
      assert.strictEqual(xScaleCallbacks.length, 0, "the plot is no longer attached to xScale");

      var yScaleCallbacks = (<any> yScale)._callbacks.values();
      assert.strictEqual(yScaleCallbacks.length, 0, "the plot is no longer attached to yScale");

      svg.remove();
    });

    it("listeners are deregistered for changed scale", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      var newScale = new Plottable.Scales.Linear().domain([-10, 10]);
      plot.project("x", xAccessor, newScale);
      xScale.domain([-2, 2]);
      assert.deepEqual(yScale.domain(), [-7, 7], "replaced xScale didn't adjust yScale");
      svg.remove();
    });

  });
});
