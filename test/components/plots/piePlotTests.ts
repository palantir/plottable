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
      simpleDataset = new Plottable.Dataset([{value: 5, label: "A"}, {value: 15, label: "B"}]);
      piePlot = new Plottable.Plot.Pie();
      piePlot.addDataset(simpleDataset);
      piePlot.renderTo(svg);
      renderArea = piePlot._renderArea;
    });

    beforeEach(() => {
      verifier.start();
    });

    it("sectors divided evenly", () => {
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");
      var arcPath0 = d3.select(arcPaths[0][0]);
      var pathPoints0 = normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints0 = pathPoints0[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");

      var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
      assert.operator(parseFloat(arcDestPoint0[0]), ">", 0, "arcs line to the right");
      assert.closeTo(parseFloat(arcDestPoint0[1]), 0, 1, "ends on same level of svg");

      var secondPathPoints0 = pathPoints0[2].split(",");
      assert.closeTo(parseFloat(secondPathPoints0[0]), 0, 1, "draws line to origin");
      assert.closeTo(parseFloat(secondPathPoints0[1]), 0, 1, "draws line to origin");

      var arcPath1 = d3.select(arcPaths[0][1]);
      var pathPoints1 = normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints1 = pathPoints1[0].split(",");
      assert.operator(parseFloat(firstPathPoints1[0]), ">", 0, "draws line to the right");
      assert.closeTo(parseFloat(firstPathPoints1[1]), 0, 1, "draws line horizontally");

      var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends at x origin");
      assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above 0");

      var secondPathPoints1 = pathPoints1[2].split(",");
      assert.closeTo(parseFloat(secondPathPoints1[0]), 0, 1, "draws line to origin");
      assert.closeTo(parseFloat(secondPathPoints1[1]), 0, 1, "draws line to origin");
      verifier.end();
    });

    it("labels show the percentage of the value out of the whole", () => {
      var labels = renderArea.selectAll(".pie-label");
      var label0 = d3.select(labels[0][0]);
      assert.strictEqual(label0.text(), "25.00%", "Label is the value percentage");
      var label1 = d3.select(labels[0][1]);
      assert.strictEqual(label1.text(), "75.00%", "Label is the value percentage");
      assert.closeTo(parseFloat(label0.text()) + parseFloat(label1.text()), 100, 1, "Labels add to 100%");
      verifier.end();
    });

    it("labels disabled when set to disabled", () => {
      piePlot.sectorLabelsEnabled(false);
      var labels = renderArea.selectAll(".pie-label");
      assert.lengthOf(labels[0], 0, "No labels should appear");
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });
  });
});
