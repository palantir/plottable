///<reference path="../../testReference.ts" />

var assert = chai.assert;
class CountingPlot extends Plottable.Abstract.Plot {
  public renders: number = 0;

  public _render() {
    ++this.renders;
    return super._render();
  }
}

describe("Plots", () => {
  describe("Abstract Plot", () => {

    it("Plots default correctly", () => {
      var r = new Plottable.Abstract.Plot();
      assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
    });

    it("Base Plot functionality works", () => {
      var svg = generateSVG(400, 300);
      var r = new Plottable.Abstract.Plot();
      r._anchor(svg);
      r._computeLayout();
      var renderArea = r._content.select(".render-area");
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
      var r = new Plottable.Abstract.Plot();
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

      var metaProjector = r._generateAttrToProjector()["meta"];
      assert.equal(metaProjector(null, 0), "bar", "plot projector used the right metadata");

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

      metaProjector = r._generateAttrToProjector()["meta"];
      assert.equal(metaProjector(null, 0), "boo", "plot projector used the right metadata");

    });

    it("Plot automatically generates a Dataset if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Abstract.Plot().addDataset("foo", data);
      var dataset = r.datasets()[0];
      assert.isNotNull(dataset, "A Dataset was automatically generated");
      assert.deepEqual(dataset.data(), data, "The generated Dataset has the correct data");
    });

    it("Plot.project works as intended", () => {
      var r = new Plottable.Abstract.Plot();
      var s = new Plottable.Scale.Linear().domain([0, 1]).range([0, 10]);
      r.project("attr", "a", s);
      var attrToProjector = r._generateAttrToProjector();
      var projector = attrToProjector["attr"];
      assert.equal(projector({"a": 0.5}, 0), 5, "projector works as intended");
    });

    it("Changing Plot.dataset().data to [] causes scale to contract", () => {
      var ds1 = new Plottable.Dataset([0, 1, 2]);
      var ds2 = new Plottable.Dataset([1, 2, 3]);
      var s = new Plottable.Scale.Linear();
      var svg1 = generateSVG(100, 100);
      var svg2 = generateSVG(100, 100);
      var r1 = new Plottable.Abstract.Plot()
                    .addDataset(ds1)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg1);
      var r2 = new Plottable.Abstract.Plot()
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
      var plot: Plottable.Abstract.Plot;
      var d1: Plottable.Dataset;
      var d2: Plottable.Dataset;

      beforeEach(() => {
        plot = new Plottable.Abstract.Plot();
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
    });

    it("remove() disconnects plots from its scales", () => {
      var r = new Plottable.Abstract.Plot();
      var s = new Plottable.Scale.Linear();
      r.project("attr", "a", s);
      r.remove();
      var key2callback = (<any> s).broadcaster.key2callback;
      assert.isUndefined(key2callback.get(r), "the plot is no longer attached to the scale");
    });
  });
});
