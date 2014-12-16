///<reference path="../../testReference.ts" />

var assert = chai.assert;
class CountingPlot extends Plottable.Plot.AbstractPlot {
  public renders: number = 0;

  public _render() {
    ++this.renders;
    return super._render();
  }
}

describe("Plots", () => {
  describe("Abstract Plot", () => {

    it("Plots default correctly", () => {
      var r = new Plottable.Plot.AbstractPlot();
      assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
    });

    it("Base Plot functionality works", () => {
      var svg = generateSVG(400, 300);
      var r = new Plottable.Plot.AbstractPlot();
      r._anchor(svg);
      r._computeLayout();
      var renderArea = (<any> r)._content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      svg.remove();
    });

    it("Changes Dataset listeners when the Dataset is changed", () => {
      var dFoo = new Plottable.Dataset(["foo"], {cssClass: "bar"});
      var dBar = new Plottable.Dataset(["bar"], {cssClass: "boo"});
      var r = new CountingPlot();
      r.addDataset("foo", dFoo);

      assert.equal(1, r.renders, "initial render due to addDataset");

      dFoo.broadcaster.broadcast();
      assert.equal(2, r.renders, "we re-render when our dataset changes");


      r.addDataset("bar", dBar);
      assert.equal(3, r.renders, "we should redraw when we add a dataset");

      dFoo.broadcaster.broadcast();
      assert.equal(4, r.renders, "we should still listen to the first dataset");

      dBar.broadcaster.broadcast();
      assert.equal(5, r.renders, "we should listen to the new dataset");

      r.removeDataset("foo");
      assert.equal(6, r.renders, "we re-render on dataset removal");
      dFoo.broadcaster.broadcast();
      assert.equal(6, r.renders, "we don't listen to removed datasets");

    });

    it("Updates its projectors when the Dataset is changed", () => {
      var d1 = new Plottable.Dataset([{x: 5, y: 6}], {cssClass: "bar"});
      var r = new Plottable.Plot.AbstractPlot();
      r.addDataset("d1", d1);

      var xScaleCalls: number = 0;
      var yScaleCalls: number = 0;
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var metadataProjector = (d: any, i: number, m: any) => m.cssClass;
      r.project("x", "x", xScale);
      r.project("y", "y", yScale);
      r.project("meta", metadataProjector);
      xScale.broadcaster.registerListener(null, (listenable: Plottable.Core.Listenable) => {
        assert.equal(listenable, xScale, "Callback received the calling scale as the first argument");
        ++xScaleCalls;
      });
      yScale.broadcaster.registerListener(null, (listenable: Plottable.Core.Listenable) => {
        assert.equal(listenable, yScale, "Callback received the calling scale as the first argument");
        ++yScaleCalls;
      });

      assert.equal(0, xScaleCalls, "initially hasn't made any X callbacks");
      assert.equal(0, yScaleCalls, "initially hasn't made any Y callbacks");

      d1.broadcaster.broadcast();
      assert.equal(1, xScaleCalls, "X scale was wired up to datasource correctly");
      assert.equal(1, yScaleCalls, "Y scale was wired up to datasource correctly");

      var d2 = new Plottable.Dataset([{x: 7, y: 8}], {cssClass: "boo"});
      r.removeDataset("d1");
      r.addDataset(d2);
      assert.equal(3, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
      assert.equal(3, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");

      d1.broadcaster.broadcast();
      assert.equal(3, xScaleCalls, "X scale was unhooked from old datasource");
      assert.equal(3, yScaleCalls, "Y scale was unhooked from old datasource");

      d2.broadcaster.broadcast();
      assert.equal(4, xScaleCalls, "X scale was hooked into new datasource");
      assert.equal(4, yScaleCalls, "Y scale was hooked into new datasource");

    });

    it("Plot automatically generates a Dataset if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Plot.AbstractPlot().addDataset("foo", data);
      var dataset = r.datasets()[0];
      assert.isNotNull(dataset, "A Dataset was automatically generated");
      assert.deepEqual(dataset.data(), data, "The generated Dataset has the correct data");
    });

    it("Plot.project works as intended", () => {
      var r = new Plottable.Plot.AbstractPlot();
      var s = new Plottable.Scale.Linear().domain([0, 1]).range([0, 10]);
      r.project("attr", "a", s);
      var attrToProjector = (<any> r)._generateAttrToProjector();
      var projector = attrToProjector["attr"];
      assert.equal(projector({"a": 0.5}, 0, null, null), 5, "projector works as intended");
    });

    it("Changing Plot.dataset().data to [] causes scale to contract", () => {
      var ds1 = new Plottable.Dataset([0, 1, 2]);
      var ds2 = new Plottable.Dataset([1, 2, 3]);
      var s = new Plottable.Scale.Linear();
      var svg1 = generateSVG(100, 100);
      var svg2 = generateSVG(100, 100);
      var r1 = new Plottable.Plot.AbstractPlot()
                    .addDataset(ds1)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg1);
      var r2 = new Plottable.Plot.AbstractPlot()
                    .addDataset(ds2)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg2);
      assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
      ds1.data([]);
      assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
      svg1.remove();
      svg2.remove();
    });

    describe("Dataset removal", () => {
      var plot: Plottable.Plot.AbstractPlot;
      var d1: Plottable.Dataset;
      var d2: Plottable.Dataset;

      beforeEach(() => {
        plot = new Plottable.Plot.AbstractPlot();
        d1 = new Plottable.Dataset();
        d2 = new Plottable.Dataset();
        plot.addDataset("foo", d1);
        plot.addDataset("bar", d2);
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset can work on keys", () => {
        plot.removeDataset("bar");
        assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
        plot.removeDataset("foo");
        assert.deepEqual(plot.datasets(), [], "all datasets removed");
      });

      it("removeDataset can work on datasets", () => {
        plot.removeDataset(d2);
        assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
        plot.removeDataset(d1);
        assert.deepEqual(plot.datasets(), [], "all datasets removed");
      });

      it("removeDataset ignores inputs that do not correspond to a dataset", () => {
        var d3 = new Plottable.Dataset();
        plot.removeDataset(d3);
        plot.removeDataset("bad key");
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset functions on inputs that are data arrays, not datasets", () => {
        var a1 = ["foo", "bar"];
        var a2 = [1,2,3];
        plot.addDataset(a1);
        plot.addDataset(a2);
        assert.lengthOf(plot.datasets(), 4, "there are four datasets");
        assert.equal(plot.datasets()[3].data(), a2, "second array dataset correct");
        assert.equal(plot.datasets()[2].data(), a1, "first array dataset correct");
        plot.removeDataset(a2);
        plot.removeDataset(a1);
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset behaves appropriately when the key 'undefined' is used", () => {
        var a = [1,2,3];
        plot.addDataset("undefined", a);
        assert.lengthOf(plot.datasets(), 3, "there are three datasets initially");
        plot.removeDataset("foofoofoofoofoofoofoofoo");
        assert.lengthOf(plot.datasets(), 3, "there are three datasets after bad key removal");
        plot.removeDataset(undefined);
        assert.lengthOf(plot.datasets(), 3, "there are three datasets after removing `undefined`");
        plot.removeDataset([94,93,92]);
        assert.lengthOf(plot.datasets(), 3, "there are three datasets after removing random dataset");
        plot.removeDataset("undefined");
        assert.lengthOf(plot.datasets(), 2, "the dataset called 'undefined' could be removed");
      });
    });

    it("remove() disconnects plots from its scales", () => {
      var r = new Plottable.Plot.AbstractPlot();
      var s = new Plottable.Scale.Linear();
      r.project("attr", "a", s);
      r.remove();
      var key2callback = (<any> s).broadcaster._key2callback;
      assert.isUndefined(key2callback.get(r), "the plot is no longer attached to the scale");
    });

    it("extent registration works as intended", () => {
      var scale1 = new Plottable.Scale.Linear();
      var scale2 = new Plottable.Scale.Linear();

      var d1 = new Plottable.Dataset([1,2,3]);
      var d2 = new Plottable.Dataset([4,99,999]);
      var d3 = new Plottable.Dataset([-1, -2, -3]);

      var id = (d: number) => d;
      var plot1 = new Plottable.Plot.AbstractPlot();
      var plot2 = new Plottable.Plot.AbstractPlot();
      var svg = generateSVG(400, 400);
      plot1.attr("null", id, scale1);
      plot2.attr("null", id, scale1);
      plot1.renderTo(svg);
      plot2.renderTo(svg);

      function assertDomainIsClose(actualDomain: number[], expectedDomain: number[], msg: string) {
        // to avoid floating point issues :/
        assert.closeTo(actualDomain[0], expectedDomain[0], 0.01, msg);
        assert.closeTo(actualDomain[1], expectedDomain[1], 0.01, msg);
      }

      plot1.addDataset(d1);
      assertDomainIsClose(scale1.domain(), [1, 3], "scale includes plot1 projected data");

      plot2.addDataset(d2);
      assertDomainIsClose(scale1.domain(), [1, 999], "scale extent includes plot1 and plot2");

      plot2.addDataset(d3);
      assertDomainIsClose(scale1.domain(), [-3, 999], "extent widens further if we add more data to plot2");

      plot2.removeDataset(d3);
      assertDomainIsClose(scale1.domain(), [1, 999], "extent shrinks if we remove dataset");

      plot2.attr("null", id, scale2);
      assertDomainIsClose(scale1.domain(), [1, 3], "extent shrinks further if we project plot2 away");

      svg.remove();
    });

    it("additionalPaint timing works properly", () => {
      var animator = new Plottable.Animator.Base().delay(10).duration(10).maxIterativeDelay(0);
      var x = new Plottable.Scale.Linear();
      var y = new Plottable.Scale.Linear();
      var plot = new Plottable.Plot.VerticalBar(x, y).addDataset([]).animate(true);
      var recordedTime: number = -1;
      var additionalPaint = (x: number) => {
        recordedTime = Math.max(x, recordedTime);
      };
      (<any> plot)._additionalPaint = additionalPaint;
      plot.animator("bars", animator);
      var svg = generateSVG();
      plot.project("x", "x", x);
      plot.project("y", "y", y);
      plot.renderTo(svg);
      svg.remove();
      assert.equal(recordedTime, 20, "additionalPaint passed appropriate time argument");
    });

    it("extent calculation done in correct dataset order", () => {
      var animator = new Plottable.Animator.Base().delay(10).duration(10).maxIterativeDelay(0);
      var ordinalScale = new Plottable.Scale.Ordinal();
      var dataset1 = [{key: "A"}];
      var dataset2 = [{key: "B"}];
      var plot = new Plottable.Plot.AbstractPlot()
                                   .addDataset("b", dataset2)
                                   .addDataset("a", dataset1);
      plot.project("key", "key", ordinalScale);

      plot.datasetOrder(["a", "b"]);

      var svg = generateSVG();
      plot.renderTo(svg);

      assert.deepEqual(ordinalScale.domain(), ["A", "B"], "extent is in the right order");
      svg.remove();
    });
  });

  describe("Abstract XY Plot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var xAccessor: any;
    var yAccessor: any;
    var simpleDataset: Plottable.Dataset;
    var plot: Plottable.Plot.AbstractXYPlot<number, number>;

    before(() => {
      xAccessor = (d: any, i: number, u: any) => d.a + u.foo;
      yAccessor = (d: any, i: number, u: any) => d.b + u.foo;
    });

    beforeEach(() => {
      svg = generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset([{a: -5, b: 6}, {a: -2, b: 2}, {a: 2, b: -2}, {a: 5, b: -6}], {foo: 0});
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Linear();
      plot = new Plottable.Plot.AbstractXYPlot(xScale, yScale);
      plot.addDataset(simpleDataset)
          .project("x", xAccessor, xScale)
          .project("y", yAccessor, yScale)
          .renderTo(svg);
    });

    it("plot auto domain scale to visible points", () => {
      xScale.domain([-3, 3]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(false);
      plot.automaticallyAdjustXScaleOverVisiblePoints(true);
      yScale.domain([-6, 6]);
      assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to visible points");
      svg.remove();
    });

    it("no visible points", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been not been adjusted");
      svg.remove();
    });

    it("automaticallyAdjustYScaleOverVisiblePoints disables autoDomain", () => {
      xScale.domain([-2, 2]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been been adjusted");
      svg.remove();
    });

    it("show all data", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("show all data without auto adjust domain", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(false);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("no cycle in auto domain on plot", () => {
      var zScale = new Plottable.Scale.Linear().domain([-10, 10]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      var plot2 = new Plottable.Plot.AbstractXYPlot(zScale, yScale)
                                    .automaticallyAdjustXScaleOverVisiblePoints(true)
                                    .project("x", xAccessor, zScale)
                                    .project("y", yAccessor, yScale)
                                    .addDataset(simpleDataset);
      var plot3 = new Plottable.Plot.AbstractXYPlot(zScale, xScale)
                                    .automaticallyAdjustYScaleOverVisiblePoints(true)
                                    .project("x", xAccessor, zScale)
                                    .project("y", yAccessor, xScale)
                                    .addDataset(simpleDataset);
      plot2.renderTo(svg);
      plot3.renderTo(svg);

      xScale.domain([-2, 2]);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "y domain is adjusted by x domain using custom algorithm and domainer");
      assert.deepEqual(zScale.domain(), [-2.5, 2.5], "z domain is adjusted by y domain using custom algorithm and domainer");
      assert.deepEqual(xScale.domain(), [-2, 2],     "x domain is not adjusted using custom algorithm and domainer");

      svg.remove();
    });

    it("listeners are deregistered after removal", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.remove();
      var key2callback = (<any> xScale).broadcaster._key2callback;
      assert.isUndefined(key2callback.get("yDomainAdjustment" + plot.getID()), "the plot is no longer attached to the xScale");
      key2callback = (<any> yScale).broadcaster._key2callback;
      assert.isUndefined(key2callback.get("xDomainAdjustment" + plot.getID()), "the plot is no longer attached to the yScale");
      svg.remove();
    });

    it("listeners are deregistered for changed scale", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      var newScale = new Plottable.Scale.Linear().domain([-10, 10]);
      plot.project("x", xAccessor, newScale);
      xScale.domain([-2, 2]);
      assert.deepEqual(yScale.domain(), [-7, 7], "replaced xScale didn't adjust yScale");
      svg.remove();
    });

  });
});
