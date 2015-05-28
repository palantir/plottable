///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("PiePlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var plot = new Plottable.Plots.Pie();
      plot.sectorValue((d) => d.value);
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
    var piePlot: Plottable.Plots.Pie;
    var renderArea: D3.Selection;

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      simpleData = [{value: 5, value2: 10, type: "A"}, {value: 15, value2: 10, type: "B"}];
      simpleDataset = new Plottable.Dataset(simpleData);
      piePlot = new Plottable.Plots.Pie();
      piePlot.addDataset(simpleDataset);
      piePlot.sectorValue((d) => d.value);
      piePlot.renderTo(svg);
      renderArea = (<any> piePlot)._renderArea;
    });

    it("sectors divided evenly", () => {
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");
      var arcPath0 = d3.select(arcPaths[0][0]);
      var pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

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
      var pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

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
      piePlot.sectorValue((d) => d.value2);

      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");
      var arcPath0 = d3.select(arcPaths[0][0]);
      var pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints0 = pathPoints0[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");

      var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint0[0]), 0, 1, "ends on a line vertically from beginning");
      assert.operator(parseFloat(arcDestPoint0[1]), ">", 0, "ends below the center");

      var arcPath1 = d3.select(arcPaths[0][1]);
      var pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints1 = pathPoints1[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints1[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints1[1]), ">", 0, "draws line downwards");

      var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends on a line vertically from beginning");
      assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above the center");

      piePlot.sectorValue((d) => d.value);
      svg.remove();
    });

    it("innerRadius", () => {
      piePlot.innerRadius(5);
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");

      var pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

      var radiusPath0 = pathPoints0[2].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(radiusPath0[0], 5, 1, "stops line at innerRadius point");
      assert.closeTo(radiusPath0[1], 0, 1, "stops line at innerRadius point");

      var innerArcPath0 = pathPoints0[3].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(innerArcPath0[0], 5, 1, "makes inner arc of radius 5");
      assert.closeTo(innerArcPath0[1], 5, 1, "makes inner arc of radius 5");
      assert.closeTo(innerArcPath0[5], 0, 1, "make inner arc to center");
      assert.closeTo(innerArcPath0[6], -5, 1, "makes inner arc to top of inner circle");

      piePlot.innerRadius(0);
      svg.remove();
    });

    it("outerRadius", () => {
      piePlot.outerRadius(() => 150);
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");

      var pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

      var radiusPath0 = pathPoints0[0].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(radiusPath0[0], 0, 1, "starts at outerRadius point");
      assert.closeTo(radiusPath0[1], -150, 1, "starts at outerRadius point");

      var outerArcPath0 = pathPoints0[1].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(outerArcPath0[0], 150, 1, "makes outer arc of radius 150");
      assert.closeTo(outerArcPath0[1], 150, 1, "makes outer arc of radius 150");
      assert.closeTo(outerArcPath0[5], 150, 1, "makes outer arc to right edge");
      assert.closeTo(outerArcPath0[6], 0, 1, "makes outer arc to right edge");

      piePlot.outerRadius(() => 250);
      svg.remove();
    });

    describe("getAllSelections", () => {
      it("retrieves all dataset selections with no args", () => {
        var allSectors = piePlot.getAllSelections();
        assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        var allSectors = piePlot.getAllSelections([simpleDataset]);
        assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
        assert.includeMembers(allSectors.data(), simpleData, "dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datsets", () => {
        var allSectors = piePlot.getAllSelections([new Plottable.Dataset([])]);
        assert.strictEqual(allSectors.size(), 0, "no sectors retrieved");

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
        piePlot.attr("fill", (d: any, i: number) => String(i), new Plottable.Scales.Color("10"));

        var arcPaths = renderArea.selectAll(".arc");

        var arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");

        var arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#ff7f0e", "second sector filled appropriately");

        piePlot.attr("fill", (d) => d.type, new Plottable.Scales.Color("20"));

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
      var oldWarn = Plottable.Utils.Methods.warn;
      Plottable.Utils.Methods.warn = (warn) => message = warn;
      piePlot.removeDataset(simpleDataset);
      var negativeDataset = new Plottable.Dataset([{value: -5}, {value: 15}]);
      piePlot.addDataset(negativeDataset);
      assert.strictEqual(message, "Negative values will not render correctly in a pie chart.");
      Plottable.Utils.Methods.warn = oldWarn;
      svg.remove();
    });
  });

  describe("fail safe tests", () => {
    it("undefined, NaN and non-numeric strings not be represented in a Pie Chart", () => {
      var svg = TestMethods.generateSVG();

      var data1 = [
        { v: 1 },
        { v: undefined },
        { v: 1 },
        { v: NaN },
        { v: 1 },
        { v: "Bad String" },
        { v: 1 },
      ];

      var plot = new Plottable.Plots.Pie();
      plot.addDataset(new Plottable.Dataset(data1));
      plot.sectorValue((d) => d.v);

      plot.renderTo(svg);

      var elementsDrawnSel = (<any> plot)._element.selectAll(".arc");

      assert.strictEqual(elementsDrawnSel.size(), 4,
        "There should be exactly 4 slices in the pie chart, representing the valid values");

      svg.remove();

    });
  });
});
