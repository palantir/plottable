///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("RadarPlot", () => {
    var svg: D3.Selection;
    var rScale: Plottable.Scale.Linear;
    var simpleDataset: Plottable.Dataset;
    var radarPlot: Plottable.Plot.Radar<number>;
    var renderArea: D3.Selection;
    var verifier: MultiTestVerifier;
    // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
    var normalizePath = (s: string) => s.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");

    before(() => {
      svg = generateSVG(500, 500);
      verifier = new MultiTestVerifier();
      rScale = new Plottable.Scale.Linear().domain([0, 10]);
      simpleDataset = new Plottable.Dataset([{attr0: 5, attr1: 10, attr2: 7}]);
      radarPlot = new Plottable.Plot.Radar(rScale)
                                   .addDataset(simpleDataset)
                                   .addMetrics("attr0", "attr1", "attr2");
      radarPlot.renderTo(svg);
      renderArea = radarPlot._renderArea;
    });

    beforeEach(() => {
      verifier.start();
    });

    it("draws area and line correctly", () => {
//      var areaPath = renderArea.select(".area");
//      assert.strictEqual(normalizePath(areaPath.attr("d")), "M0,500L500,0L500,500L0,500Z", "area d was set correctly");
//      assert.strictEqual(areaPath.attr("fill"), "steelblue", "area fill was set correctly");
//      var areaComputedStyle = window.getComputedStyle(areaPath.node());
//      assert.strictEqual(areaComputedStyle.stroke, "none", "area stroke renders as \"none\"");
//
//      var linePath = renderArea.select(".line");
//      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
//      assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
//      var lineComputedStyle = window.getComputedStyle(linePath.node());
//      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
//      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });
  });
});
