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
    });

    it("Base Plot functionality works", () => {
      var svg = generateSVG(400, 300);
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);
      r._anchor(svg)._computeLayout();
      var renderArea = r.content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      svg.remove();
    });

    it("Allows the DataSource to be changed", () => {
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);
      assert.equal(d1, r.dataSource(), "returns the original");

      var d2 = new Plottable.DataSource(["bar"], {cssClass: "boo"});
      r.dataSource(d2);
      assert.equal(d2, r.dataSource(), "returns new datasource");
    });

    it("Changes DataSource listeners when the DataSource is changed", () => {
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new CountingPlot(d1);

      assert.equal(0, r.renders, "initially hasn't rendered anything");

      d1.broadcaster.broadcast();
      assert.equal(1, r.renders, "we re-render when our datasource changes");

      r.dataSource();
      assert.equal(1, r.renders, "we shouldn't redraw when querying the datasource");

      var d2 = new Plottable.DataSource(["bar"], {cssClass: "boo"});
      r.dataSource(d2);
      assert.equal(2, r.renders, "we should redraw when we change datasource");

      d1.broadcaster.broadcast();
      assert.equal(2, r.renders, "we shouldn't listen to the old datasource");

      d2.broadcaster.broadcast();
      assert.equal(3, r.renders, "we should listen to the new datasource");
    });

    it("Updates its projectors when the DataSource is changed", () => {
      var d1 = new Plottable.DataSource([{x: 5, y: 6}], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);

      var xScaleCalls: number = 0;
      var yScaleCalls: number = 0;
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      r.project("x", "x", xScale);
      r.project("y", "y", yScale);
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

      var d2 = new Plottable.DataSource([{x: 7, y: 8}], {cssClass: "boo"});
      r.dataSource(d2);
      assert.equal(2, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
      assert.equal(2, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");

      d1.broadcaster.broadcast();
      assert.equal(2, xScaleCalls, "X scale was unhooked from old datasource");
      assert.equal(2, yScaleCalls, "Y scale was unhooked from old datasource");

      d2.broadcaster.broadcast();
      assert.equal(3, xScaleCalls, "X scale was hooked into new datasource");
      assert.equal(3, yScaleCalls, "Y scale was hooked into new datasource");
    });

    it("Plot automatically generates a DataSource if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Abstract.Plot(data);
      var dataSource = r.dataSource();
      assert.isNotNull(dataSource, "A DataSource was automatically generated");
      assert.deepEqual(dataSource.data(), data, "The generated DataSource has the correct data");
    });

    it("Plot.project works as intended", () => {
      var r = new Plottable.Abstract.Plot();
      var s = new Plottable.Scale.Linear().domain([0, 1]).range([0, 10]);
      r.project("attr", "a", s);
      var attrToProjector = r._generateAttrToProjector();
      var projector = attrToProjector["attr"];
      assert.equal(projector({"a": 0.5}, 0), 5, "projector works as intended");
    });

    it("Changing Plot.dataSource().data to [] causes scale to contract", () => {
      var ds1 = new Plottable.DataSource([0, 1, 2]);
      var ds2 = new Plottable.DataSource([1, 2, 3]);
      var s = new Plottable.Scale.Linear();
      var svg1 = generateSVG(100, 100);
      var svg2 = generateSVG(100, 100);
      var r1 = new Plottable.Abstract.Plot()
                    .dataSource(ds1)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg1);
      var r2 = new Plottable.Abstract.Plot()
                    .dataSource(ds2)
                    .project("x", (x: number) => x, s)
                    .renderTo(svg2);
      assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
      ds1.data([]);
      assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
      svg1.remove();
      svg2.remove();
    });
  });
});
