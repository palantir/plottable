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
      plot = new Plottable.XYPlot<number, number>();
      plot.addDataset(simpleDataset);
      plot.x(xAccessor, xScale)
          .y(yAccessor, yScale)
          .renderTo(svg);
    });

    it("automatically adjusting Y domain over visible points", () => {
      xScale.domain([-3, 3]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.adjustingScaleType("y");
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.adjustingScaleType("none");
      svg.remove();
    });

    it("automatically adjusting Y domain when no points are visible", () => {
      plot.adjustingScaleType("y");
      xScale.domain([-0.5, 0.5]);
      assert.deepEqual(yScale.domain(), [0, 1], "scale uses default domain");
      svg.remove();
    });

    it("automatically adjusting Y domain when X scale is replaced", () => {
      plot.adjustingScaleType("y");
      var newXScale = new Plottable.Scales.Linear().domain([-3, 3]);
      plot.x(xAccessor, newXScale);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points on new X scale domain");
      xScale.domain([-2, 2]);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "changing domain of original X scale doesn't affect Y scale's domain");
      svg.remove();
    });

    it("automatically adjusting X domain over visible points", () => {
      yScale.domain([-3, 3]);
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.adjustingScaleType("x");
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.adjustingScaleType("none");
      svg.remove();
    });

    it("automatically adjusting X domain when no points are visible", () => {
      plot.adjustingScaleType("x");
      yScale.domain([-0.5, 0.5]);
      assert.deepEqual(xScale.domain(), [0, 1], "scale uses default domain");
      svg.remove();
    });

    it("automatically adjusting X domain when Y scale is replaced", () => {
      plot.adjustingScaleType("x");
      var newYScale = new Plottable.Scales.Linear().domain([-3, 3]);
      plot.y(yAccessor, newYScale);
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points on new Y scale domain");
      yScale.domain([-2, 2]);
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "changing domain of original Y scale doesn't affect X scale's domain");
      svg.remove();
    });

    it("showAllData()", () => {
      plot.adjustingScaleType("y");
      xScale.domain([-0.5, 0.5]);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("show all data without auto adjust domain", () => {
      plot.adjustingScaleType("y");
      xScale.domain([-0.5, 0.5]);
      plot.adjustingScaleType("none");
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("listeners are deregistered after removal", () => {
      plot.adjustingScaleType("y");
      plot.destroy();

      var xScaleCallbacks = (<any> xScale)._callbacks.values();
      assert.strictEqual(xScaleCallbacks.length, 0, "the plot is no longer attached to xScale");

      var yScaleCallbacks = (<any> yScale)._callbacks.values();
      assert.strictEqual(yScaleCallbacks.length, 0, "the plot is no longer attached to yScale");

      svg.remove();
    });
  });
});
