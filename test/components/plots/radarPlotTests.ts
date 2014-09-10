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

    it("polygon is drawn correctly", () => {
      var polygon = renderArea.select("polygon");
      var points = polygon.attr("points").split(" ");

      var point0 = points[0].split(",");
      assert.closeTo(parseFloat(point0[0]), 325, 1, "Starts halfway between center and end of axis");
      assert.closeTo(parseFloat(point0[1]), 250, 1, "Starts at the same point vertically");

      var point1 = points[1].split(",");
      assert.closeTo(parseFloat(point1[0]), 175, 1, "Goes left to the second point");
      assert.closeTo(parseFloat(point1[1]), 120, 1, "Goes up to the second point");

      var point2 = points[2].split(",");
      assert.closeTo(parseFloat(point2[0]), 197.5, 1, "Goes right to the third point");
      assert.closeTo(parseFloat(point2[1]), 341, 1, "Goes down to the third point");
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });
  });

  describe("RadarPlot Metrics", () => {
    var radarPlot: Plottable.Plot.Radar<number>;
    // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"

    beforeEach(() => {
      var rScale = new Plottable.Scale.Linear();
      radarPlot = new Plottable.Plot.Radar(rScale)
                                    .addMetrics("attr0", "attr1", "attr2");
    });

    it("initial metrics are correct", () => {
      assert.deepEqual(radarPlot.metrics(), ["attr0", "attr1", "attr2"], "metrics is the same as ones initially added in same order");
    });

    it("adding metrics gives correct behavior", () => {
      radarPlot.addMetrics("attr3", "attr4");
      assert.deepEqual(radarPlot.metrics(), ["attr0", "attr1", "attr2", "attr3", "attr4"], "adding metrics appends them in the same order");

      radarPlot.addMetrics("attr0");
      assert.deepEqual(radarPlot.metrics(), ["attr0", "attr1", "attr2", "attr3", "attr4", "attr0"], "adding a duplicate metrics acts normally");
    });

    it("removing metrics gives correct behavior", () => {
      radarPlot.removeMetrics("attr0");
      assert.deepEqual(radarPlot.metrics(), ["attr1", "attr2"], "removing a metric acts normally");

      radarPlot.addMetrics("attr1");
      radarPlot.removeMetrics("attr1");
      assert.deepEqual(radarPlot.metrics(), ["attr2", "attr1"], "removing a metric removes the first if duplicates exist");

      assert.doesNotThrow(() => radarPlot.removeMetrics("attr0", "foo", "bar"), Error, "does not error if removing metrics that don't exist");
      assert.deepEqual(radarPlot.metrics(), ["attr2", "attr1"], "metrics aren't changed after calling remove on nonexistent metrics");
    });
  });
});
