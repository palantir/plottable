///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("PiePlot", () => {
    var svg: D3.Selection;
    var simpleDataset: Plottable.Dataset;
    var piePlot: Plottable.Plot.Pie;
    var renderArea: D3.Selection;
    var verifier: MultiTestVerifier;
    // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
    var normalizePath = (s: string) => s.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");

    before(() => {
      svg = generateSVG(500, 500);
      verifier = new MultiTestVerifier();
      simpleDataset = new Plottable.Dataset([{value: 5}, {value: 10}]);
      piePlot = new Plottable.Plot.Pie();
      piePlot.addDataset(simpleDataset);
      piePlot.renderTo(svg);
      renderArea = piePlot._renderArea;
    });

    beforeEach(() => {
      verifier.start();
    });

    it("draws a line correctly", () => {
//      var linePath = renderArea.select(".line");
//      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
//      var lineComputedStyle = window.getComputedStyle(linePath.node());
//      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
//      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });
  });
});
