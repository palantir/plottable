///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("PiePlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      var svg = generateSVG(400, 400);
      var plot = new Plottable.Plot.Pie();
      plot.project("value", (d: any) => d.value);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });
  });

  describe("PiePlot", () => {
    var svg: D3.Selection;
    var simpleDataset: Plottable.Dataset;
    var simpleData: any[];
    var piePlot: Plottable.Plot.Pie;
    var renderArea: D3.Selection;

    beforeEach(() => {
      svg = generateSVG(500, 500);
      simpleData = [{value: 5, value2: 10, type: "A"}, {value: 15, value2: 10, type: "B"}];
      simpleDataset = new Plottable.Dataset(simpleData);
      piePlot = new Plottable.Plot.Pie();
      piePlot.addDataset("simpleDataset", simpleDataset);
      piePlot.project("value", "value");
      piePlot.renderTo(svg);
      renderArea = (<any> piePlot)._renderArea;
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
      svg.remove();
    });

    it("project value onto different attribute", () => {
      piePlot.project("value", "value2");

      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");
      var arcPath0 = d3.select(arcPaths[0][0]);
      var pathPoints0 = normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints0 = pathPoints0[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");

      var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint0[0]), 0, 1, "ends on a line vertically from beginning");
      assert.operator(parseFloat(arcDestPoint0[1]), ">", 0, "ends below the center");

      var arcPath1 = d3.select(arcPaths[0][1]);
      var pathPoints1 = normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints1 = pathPoints1[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints1[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints1[1]), ">", 0, "draws line downwards");

      var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends on a line vertically from beginning");
      assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above the center");

      piePlot.project("value", "value");
      svg.remove();
    });

    it("innerRadius project", () => {
      piePlot.project("inner-radius", () => 5);
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");

      var pathPoints0 = normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

      var radiusPath0 = pathPoints0[2].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(radiusPath0[0], 5, 1, "stops line at innerRadius point");
      assert.closeTo(radiusPath0[1], 0, 1, "stops line at innerRadius point");

      var innerArcPath0 = pathPoints0[3].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(innerArcPath0[0], 5, 1, "makes inner arc of radius 5");
      assert.closeTo(innerArcPath0[1], 5, 1, "makes inner arc of radius 5");
      assert.closeTo(innerArcPath0[5], 0, 1, "make inner arc to center");
      assert.closeTo(innerArcPath0[6], -5, 1, "makes inner arc to top of inner circle");

      piePlot.project("inner-radius", () => 0);
      svg.remove();
    });

    it("outerRadius project", () => {
      piePlot.project("outer-radius", () => 150);
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");

      var pathPoints0 = normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

      var radiusPath0 = pathPoints0[0].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(radiusPath0[0], 0, 1, "starts at outerRadius point");
      assert.closeTo(radiusPath0[1], -150, 1, "starts at outerRadius point");

      var outerArcPath0 = pathPoints0[1].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(outerArcPath0[0], 150, 1, "makes outer arc of radius 150");
      assert.closeTo(outerArcPath0[1], 150, 1, "makes outer arc of radius 150");
      assert.closeTo(outerArcPath0[5], 150, 1, "makes outer arc to right edge");
      assert.closeTo(outerArcPath0[6], 0, 1, "makes outer arc to right edge");

      piePlot.project("outer-radius", () => 250);
      svg.remove();
    });

    describe("getAllSelections", () => {

      it("retrieves all dataset selections with no args",() => {
        var allSectors = piePlot.getAllSelections();
        var allSectors2 = piePlot.getAllSelections((<any> piePlot)._datasetKeysInOrder);
        assert.deepEqual(allSectors, allSectors2, "all sectors retrieved");

        svg.remove();
      });

      it("retrieves correct selections (array arg)",() => {
        var allSectors = piePlot.getAllSelections(["simpleDataset"]);
        assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
        var selectionData = allSectors.data();
        assert.includeMembers(selectionData.map((datum) => datum.data), simpleData, "dataset data in selection data");

        svg.remove();
      });

      it("retrieves correct selections (string arg)",() => {
        var allSectors = piePlot.getAllSelections("simpleDataset");
        assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
        var selectionData = allSectors.data();
        assert.includeMembers(selectionData.map((datum) => datum.data), simpleData, "dataset data in selection data");

        svg.remove();
      });

      it("skips invalid keys",() => {
        var allSectors = piePlot.getAllSelections(["whoo"]);
        assert.strictEqual(allSectors.size(), 0, "all sectors retrieved");

        svg.remove();
      });

    });

    describe("Fill", () => {

      it("sectors are filled in according to defaults", () => {
        var arcPaths = renderArea.selectAll(".arc");

        var arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#5279c7", "first sector filled appropriately");

        var arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#fd373e", "second sector filled appropriately");
        svg.remove();
      });

      it("project fill", () => {
        piePlot.project("fill", (d: any, i: number) => String(i), new Plottable.Scale.Color("10"));

        var arcPaths = renderArea.selectAll(".arc");

        var arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");

        var arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#ff7f0e", "second sector filled appropriately");

        piePlot.project("fill", "type", new Plottable.Scale.Color("20"));

        arcPaths = renderArea.selectAll(".arc");

        arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");

        arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#aec7e8", "second sector filled appropriately");
        svg.remove();
      });

    });

    it("throws warnings on negative data", () => {
      var message: String;
      var oldWarn = Plottable._Util.Methods.warn;
      Plottable._Util.Methods.warn = (warn) => message = warn;
      piePlot.removeDataset("simpleDataset");
      var negativeDataset = new Plottable.Dataset([{value: -5}, {value: 15}]);
      piePlot.addDataset("negativeDataset", negativeDataset);
      assert.equal(message, "Negative values will not render correctly in a pie chart.");
      Plottable._Util.Methods.warn = oldWarn;
      svg.remove();
    });
  });
});
