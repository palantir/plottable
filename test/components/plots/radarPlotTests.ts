///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("RadarPlot", () => {
    var svg: D3.Selection;
    var radarPlot: Plottable.Plot.Radar<number>;

    before(() => {
      svg = generateSVG(500, 500);
      var rScale = new Plottable.Scale.Linear().domain([0, 10]);
      var thetaScale = new Plottable.Scale.Ordinal().domain(["attr0", "attr1", "attr2"]);
      var dataset = new Plottable.Dataset([{metric: "attr0", value: 5},
                                           {metric: "attr1", value: 10},
                                           {metric: "attr2", value: 7}]);
      radarPlot = new Plottable.Plot.Radar(rScale, thetaScale)
                                    .addDataset(dataset);
      radarPlot.renderTo(svg);
    });

    it("polygon is drawn correctly", () => {
      var renderArea = radarPlot._renderArea;
      var polygon = renderArea.select("polygon");
      var points = polygon.attr("points").split(" ");

      var point0 = points[0].split(",").map((coordinate) => parseFloat(coordinate));
      assert.closeTo(point0[0], 0, 1, "Starts above the center point");
      assert.closeTo(point0[1], -125, 1, "Starts above the center point halfway to the top");

      var point1 = points[1].split(",").map((coordinate) => parseFloat(coordinate));
      assert.closeTo(point1[0], 216.5, 1, "Goes right to the second point");
      assert.closeTo(point1[1], 125, 1, "Goes down to the second point");

      var point2 = points[2].split(",").map((coordinate) => parseFloat(coordinate));
      assert.closeTo(point2[0], -151.55, 1, "Goes left to the third point");
      assert.closeTo(point2[1], 87.5, 1, "Goes up to the third point");
      svg.remove();
    });
  });

  describe("RadarPlot Metrics", () => {
    var radarPlot: Plottable.Plot.Radar<number>;

    beforeEach(() => {
      var rScale = new Plottable.Scale.Linear();
      var thetaScale = new Plottable.Scale.Ordinal().domain(["attr0", "attr1", "attr2"]);
      var dataset = new Plottable.Dataset([{metric: "attr0", value: 5},
                                           {metric: "attr1", value: 10},
                                           {metric: "attr2", value: 7}]);
      radarPlot = new Plottable.Plot.Radar(rScale, thetaScale)
                                    .addDataset(dataset);
    });

    it("initial metrics are correct", () => {
      assert.deepEqual(radarPlot.metrics(), ["attr0", "attr1", "attr2"], "metrics is the same as ones initially added in same order");
    });

  });
});
