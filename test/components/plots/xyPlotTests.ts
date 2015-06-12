///<reference path="../../testReference.ts" />
var assert = chai.assert;

describe("Plots", () => {
  describe("XY Plot", () => {
    var svg: d3.Selection<void>;
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
      (<any> plot)._getDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      plot.addDataset(simpleDataset);
      plot.x(xAccessor, xScale)
          .y(yAccessor, yScale)
          .renderTo(svg);
    });

    it("autorangeMode() getter", () => {
      assert.strictEqual(plot.autorangeMode(), "none");
      assert.strictEqual(plot.autorangeMode("x"), plot, "autorangeMode() setter did not return the original object");
      assert.strictEqual(plot.autorangeMode(), "x");
      plot.autorangeMode("y");
      assert.strictEqual(plot.autorangeMode(), "y");
      plot.autorangeMode("none");
      assert.strictEqual(plot.autorangeMode(), "none");
      svg.remove();
    });

    it("autorangeMode() invalid inputs", () => {
      assert.throws(() => {
        plot.autorangeMode("foobar");
      });
      svg.remove();
    });

    it("automatically adjusting Y domain over visible points", () => {
      xScale.domain([-3, 3]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.autorangeMode("y");
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.autorangeMode("none");
      svg.remove();
    });

    it("automatically adjusting Y domain when no points are visible", () => {
      plot.autorangeMode("y");
      xScale.domain([-0.5, 0.5]);
      assert.deepEqual(yScale.domain(), [0, 1], "scale uses default domain");
      svg.remove();
    });

    it("automatically adjusting Y domain when X scale is replaced", () => {
      plot.autorangeMode("y");
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
      plot.autorangeMode("x");
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.autorangeMode("none");
      svg.remove();
    });

    it("automatically adjusting X domain when no points are visible", () => {
      plot.autorangeMode("x");
      yScale.domain([-0.5, 0.5]);
      assert.deepEqual(xScale.domain(), [0, 1], "scale uses default domain");
      svg.remove();
    });

    it("automatically adjusting X domain when Y scale is replaced", () => {
      plot.autorangeMode("x");
      var newYScale = new Plottable.Scales.Linear().domain([-3, 3]);
      plot.y(yAccessor, newYScale);
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points on new Y scale domain");
      yScale.domain([-2, 2]);
      assert.deepEqual(xScale.domain(), [-2.5, 2.5], "changing domain of original Y scale doesn't affect X scale's domain");
      svg.remove();
    });

    it("showAllData()", () => {
      plot.autorangeMode("y");
      xScale.domain([-0.5, 0.5]);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("show all data without auto adjust domain", () => {
      plot.autorangeMode("y");
      xScale.domain([-0.5, 0.5]);
      plot.autorangeMode("none");
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("listeners are deregistered after removal", () => {
      plot.autorangeMode("y");
      plot.destroy();

      assert.strictEqual((<any> xScale)._callbacks.size, 0, "the plot is no longer attached to xScale");
      assert.strictEqual((<any> yScale)._callbacks.size, 0, "the plot is no longer attached to yScale");

      svg.remove();
    });
  });
});
