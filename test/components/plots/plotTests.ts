///<reference path="../../testReference.ts" />

var assert = chai.assert;
class CountingPlot extends Plottable.Abstract.Plot {
  public renders: number = 0;

  constructor(dataset: any) {
    super(dataset);
  }

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
      r.project("color", () => "testColor");
      var a2p = r._generateAttrToProjector();
      assert.isNotNull(a2p["fill"], "fill inserted in a2p");
      assert.equal(a2p["fill"](null, 0), "testColor", "color projector assigned to fill");
    });

    it("Base Plot functionality works", () => {
      var svg = generateSVG(400, 300);
      var d1 = new Plottable.Dataset(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);
      r._anchor(svg);
      r._computeLayout();
      var renderArea = r._content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      svg.remove();
    });

    it("Allows the Dataset to be changed", () => {
      var d1 = new Plottable.Dataset(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);
      assert.equal(d1, r.dataset(), "returns the original");

      var d2 = new Plottable.Dataset(["bar"], {cssClass: "boo"});
      r.dataset(d2);
      assert.equal(d2, r.dataset(), "returns new datasource");
    });

    it("Changes Dataset listeners when the Dataset is changed", () => {
      var d1 = new Plottable.Dataset(["foo"], {cssClass: "bar"});
      var r = new CountingPlot(d1);

      assert.equal(0, r.renders, "initially hasn't rendered anything");

      d1.broadcaster.broadcast();
      assert.equal(1, r.renders, "we re-render when our datasource changes");

      r.dataset();
      assert.equal(1, r.renders, "we shouldn't redraw when querying the datasource");

      var d2 = new Plottable.Dataset(["bar"], {cssClass: "boo"});
      r.dataset(d2);
      assert.equal(2, r.renders, "we should redraw when we change datasource");

      d1.broadcaster.broadcast();
      assert.equal(2, r.renders, "we shouldn't listen to the old datasource");

      d2.broadcaster.broadcast();
      assert.equal(3, r.renders, "we should listen to the new datasource");
    });

    it("Updates its projectors when the Dataset is changed", () => {
      var d1 = new Plottable.Dataset([{x: 5, y: 6}], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);

      var xScaleCalls: number = 0;
      var yScaleCalls: number = 0;
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var metadataProjector = (d: any, i: number, m: any) => m.cssClass;
      r.project("x", "x", xScale);
      r.project("y", "y", yScale);
      r.project("meta", metadataProjector);
      xScale.broadcaster.registerListener(null, (listenable: Plottable.Core.IListenable) => {
        assert.equal(listenable, xScale, "Callback received the calling scale as the first argument");
        ++xScaleCalls;
      });
      yScale.broadcaster.registerListener(null, (listenable: Plottable.Core.IListenable) => {
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
      r.dataset(d2);
      assert.equal(2, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
      assert.equal(2, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");

      d1.broadcaster.broadcast();
      assert.equal(2, xScaleCalls, "X scale was unhooked from old datasource");
      assert.equal(2, yScaleCalls, "Y scale was unhooked from old datasource");

      d2.broadcaster.broadcast();
      assert.equal(3, xScaleCalls, "X scale was hooked into new datasource");
      assert.equal(3, yScaleCalls, "Y scale was hooked into new datasource");

      metaProjector = r._generateAttrToProjector()["meta"];
      assert.equal(metaProjector(null, 0), "boo", "plot projector used the right metadata");

    });

    it("Plot automatically generates a Dataset if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Abstract.Plot(data);
      var dataset = r.dataset();
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
                    .dataset(ds1)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg1);
      var r2 = new Plottable.Abstract.Plot()
                    .dataset(ds2)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg2);
      assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
      ds1.data([]);
      assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
      svg1.remove();
      svg2.remove();
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
