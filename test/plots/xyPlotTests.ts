///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("XY Plot", () => {
    describe("Basic functionality", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.XYPlot<number, number>;
      let simpleDataset = new Plottable.Dataset([
        { a: -6, b: 6 },
        { a: -2, b: 2 },
        { a: 2, b: -2 },
        { a: 6, b: -6 }
      ]);
      let xAccessor = (d: any) => d.a;
      let yAccessor = (d: any) => d.b;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.XYPlot<number, number>();
        (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
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
        let newXScale = new Plottable.Scales.Linear().domain([-3, 3]);
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
        let newYScale = new Plottable.Scales.Linear().domain([-3, 3]);
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

    describe("Automatic domain and range adjustment for X and Y Scales", () => {
      let SVG_HEIGHT = 400;
      let SVG_WIDTH = 400;
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.XYPlot<number, number>;
      let dataset: Plottable.Dataset;
      let defaultInterval = [0, 1];

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        dataset = new Plottable.Dataset([
          { a: -6, b: 6 },
          { a: -2, b: 2 },
          { a: 2, b: -2 },
          { a: 6, b: -6 }
        ]);
        plot = new Plottable.XYPlot<number, number>();
        (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
        plot.addDataset(dataset);
      });

      it("automatically adjusts domain and range after rendering to DOM", () => {
        plot.x((d: any) => d.a, xScale)
            .y((d: any) => d.b, yScale);
        assert.deepEqual(xScale.domain(), defaultInterval, "X domain is not changed before rendering");
        assert.deepEqual(xScale.range(), defaultInterval, "X range is not changed before rendering");
        assert.deepEqual(yScale.domain(), defaultInterval, "Y domain is not changed before rendering");
        assert.deepEqual(yScale.range(), defaultInterval, "Y range is not changed before rendering");

        plot.renderTo(svg);
        assert.deepEqual(xScale.domain(), [-7, 7], "X domain has been set automatically after rendering");
        assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "X range has been set automatically after rendering");
        assert.deepEqual(yScale.domain(), [-7, 7], "Y domain has been set automatically after rendering");
        assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "Y range has been set automatically after rendering");
        svg.remove();
      });

      it("automatically adjusts range when a Scale is attached after rendering", () => {
        plot.x((d: any) => d.a)
            .y((d: any) => d.b);

        plot.renderTo(svg);
        plot.x((d: any) => d.a, xScale)
            .y((d: any) => d.b, yScale);

        assert.deepEqual(xScale.domain(), [-7, 7], "X domain has been set automatically");
        assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "X range has been set automatically");
        assert.deepEqual(yScale.domain(), [-7, 7], "Y domain has been set automatically");
        assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "Y range has been set automatically");
        svg.remove();
      });
    });

    describe("Deferred Rendering", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.XYPlot<number, number>;

      let nativeTimeout: Function;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.XYPlot<number, number>();
        (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);

        // Replacing timeout with instant invocation to avoid waiting for the deferred rendering
        nativeTimeout = (<any>window).setTimeout;
        (<any>window).setTimeout = function(fn: Function) {
          fn.call(this);
        };
      });

      afterEach(() => {
        (<any>window).setTimeout = nativeTimeout;
        svg.remove();
      });

      it("deferredRendering() setter/getter", () => {
        assert.strictEqual(plot.deferredRendering(), false, "deferred rendering is false by default");
        assert.strictEqual(plot.deferredRendering(true), plot, "setting the deferred rendering option returns the plot");
        assert.strictEqual(plot.deferredRendering(), true, "deferred rendering can be turned on");
        plot.deferredRendering(false);
        assert.strictEqual(plot.deferredRendering(), false, "deferred rendering can be turned off");
      });

      it("deferredRendering() caches domains properly", () => {
        xScale.domain([5, 6]);
        yScale.domain([6, 7]);
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.renderTo(svg);
        assert.deepEqual((<any>plot)._cachedDomainX, [null, null], "the x domain is not cached when deferredRendering is disabled");
        assert.deepEqual((<any>plot)._cachedDomainY, [null, null], "the y domain is not cached when deferredRendering is disabled");
        plot.deferredRendering(true);

        assert.deepEqual((<any>plot)._cachedDomainX, [5, 6], "The correct x domain is cached");
        assert.deepEqual((<any>plot)._cachedDomainY, [6, 7], "The correct y domain is cached");
      });

      it("deferredRendering() caches domains properly when setup before rendering", () => {
        xScale.domain([5, 6]);
        yScale.domain([6, 7]);
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.deferredRendering(true);
        assert.deepEqual((<any>plot)._cachedDomainX, [null, null], "The x domain is still not cached until the timeout expires");
        assert.deepEqual((<any>plot)._cachedDomainY, [null, null], "The y domain is still not cached until the timeout expires");

        plot.renderTo(svg);

        assert.deepEqual((<any>plot)._cachedDomainX, [5, 6], "The correct x domain is cached");
        assert.deepEqual((<any>plot)._cachedDomainY, [6, 7], "The correct y domain is cached");
      });

      it("deferredRendering() caches domains properly setup before scales", () => {
        xScale.domain([5, 6]);
        yScale.domain([6, 7]);
        plot.deferredRendering(true);
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        assert.deepEqual((<any>plot)._cachedDomainX, [null, null], "The x domain is still not cached until the timeout expires");
        assert.deepEqual((<any>plot)._cachedDomainY, [null, null], "The y domain is still not cached until the timeout expires");

        plot.renderTo(svg);

        assert.deepEqual((<any>plot)._cachedDomainX, [5, 6], "The x domain is still not cached until the timeout expires");
        assert.deepEqual((<any>plot)._cachedDomainY, [6, 7], "The y domain is still not cached until the timeout expires");
      });

    });
  });
});
