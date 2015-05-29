///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("RectanglePlot", () => {
    var SVG_WIDTH = 300;
    var SVG_HEIGHT = 300;
    var DATA = [
      { x: 0, y: 0, x2: 1, y2: 1 },
      { x: 1, y: 1, x2: 2, y2: 2 },
      { x: 2, y: 2, x2: 3, y2: 3 },
      { x: 3, y: 3, x2: 4, y2: 4 },
      { x: 4, y: 4, x2: 5, y2: 5 }
    ];

    var VERIFY_CELLS = (cells: D3.Selection) => {
      assert.strictEqual(cells[0].length, 5);
      cells.each(function(d: D3.Selection, i: number) {
        var cell = d3.select(this);
        assert.closeTo(+cell.attr("height"), 50, 0.5, "Cell height is correct");
        assert.closeTo(+cell.attr("width"), 50, 0.5, "Cell width is correct");
        assert.closeTo(+cell.attr("x"), 25 + 50 * i, 0.5, "Cell x coordinate is correct");
        assert.closeTo(+cell.attr("y"), 25 + 50 * (cells[0].length - i - 1), 0.5, "Cell y coordinate is correct");
      });
    };

    it("renders correctly", () => {
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var rectanglePlot = new Plottable.Plots.Rectangle();
      rectanglePlot.addDataset(new Plottable.Dataset(DATA));
      rectanglePlot.x((d) => d.x, xScale)
                   .y((d) => d.y, yScale)
                   .x2((d) => d.x2)
                   .y2((d) => d.y2)
                   .renderTo(svg);
      VERIFY_CELLS((<any> rectanglePlot)._renderArea.selectAll("rect"));
      svg.remove();
    });
  });

  describe("fail safe tests", () => {
    it("illegal rectangles don't get displayed", () => {
      var svg = TestMethods.generateSVG();

      var data1 = [
        { x: "A", y: 1, y2: 2, v: 1 },
        { x: "B", y: 2, y2: 3, v: 2 },
        { x: "C", y: 3, y2: NaN, v: 3 },
        { x: "D", y: 4, y2: 5, v: 4 },
        { x: "E", y: 5, y2: 6, v: 5 },
        { x: "F", y: 6, y2: 7, v: 6 }
      ];

      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();

      var plot = new Plottable.Plots.Rectangle();
      plot
        .x((d: any) => d.x, xScale)
        .y((d: any) => d.y, yScale)
        .y2((d: any) => d.y2);
      plot.addDataset(new Plottable.Dataset(data1));

      plot.renderTo(svg);

      var rectanglesSelection = plot.getAllSelections();

      assert.strictEqual(rectanglesSelection.size(), 5,
        "only 5 rectangles should be displayed");

      rectanglesSelection.each(function(d: any, i: number) {
        var sel = d3.select(this);
        assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("x")),
          "x attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("x"));
        assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("y")),
          "y attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("y"));
        assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("height")),
          "height attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("height"));
        assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("width")),
          "width attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("width"));
      });

      svg.remove();
    });
  });

  describe("RectanglePlot - Grids", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 200;
    var DATA = [
      {x: "A", y: "U", magnitude: 0},
      {x: "B", y: "U", magnitude: 2},
      {x: "A", y: "V", magnitude: 16},
      {x: "B", y: "V", magnitude: 8},
    ];

    var VERIFY_CELLS = (cells: any[]) => {
      assert.strictEqual(cells.length, 4);

      var cellAU = d3.select(cells[0]);
      var cellBU = d3.select(cells[1]);
      var cellAV = d3.select(cells[2]);
      var cellBV = d3.select(cells[3]);

      assert.strictEqual(cellAU.attr("height"), "100", "cell 'AU' height is correct");
      assert.strictEqual(cellAU.attr("width"), "200", "cell 'AU' width is correct");
      assert.strictEqual(cellAU.attr("x"), "0", "cell 'AU' x coord is correct");
      assert.strictEqual(cellAU.attr("y"), "0", "cell 'AU' y coord is correct");
      assert.strictEqual(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");

      assert.strictEqual(cellBU.attr("height"), "100", "cell 'BU' height is correct");
      assert.strictEqual(cellBU.attr("width"), "200", "cell 'BU' width is correct");
      assert.strictEqual(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
      assert.strictEqual(cellBU.attr("y"), "0", "cell 'BU' y coord is correct");
      assert.strictEqual(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");

      assert.strictEqual(cellAV.attr("height"), "100", "cell 'AV' height is correct");
      assert.strictEqual(cellAV.attr("width"), "200", "cell 'AV' width is correct");
      assert.strictEqual(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
      assert.strictEqual(cellAV.attr("y"), "100", "cell 'AV' y coord is correct");
      assert.strictEqual(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");

      assert.strictEqual(cellBV.attr("height"), "100", "cell 'BV' height is correct");
      assert.strictEqual(cellBV.attr("width"), "200", "cell 'BV' width is correct");
      assert.strictEqual(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
      assert.strictEqual(cellBV.attr("y"), "100", "cell 'BV' y coord is correct");
      assert.strictEqual(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
    };

    it("renders correctly", () => {
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Category();
      var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(new Plottable.Dataset(DATA))
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale);
      gridPlot.renderTo(svg);
      VERIFY_CELLS((<any> gridPlot)._renderArea.selectAll("rect")[0]);
      svg.remove();
    });

    it("renders correctly when data is set after construction", () => {
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Category();
      var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dataset = new Plottable.Dataset();
      var gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(dataset)
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale)
              .renderTo(svg);
      dataset.data(DATA);
      VERIFY_CELLS((<any> gridPlot)._renderArea.selectAll("rect")[0]);
      svg.remove();
    });

    it("renders correctly when there isn't data for every spot", () => {
      var CELL_HEIGHT = 50;
      var CELL_WIDTH = 100;
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Category();
      var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dataset = new Plottable.Dataset();
      var gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(dataset)
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale)
              .renderTo(svg);
      var data = [
        {x: "A", y: "W", magnitude: 0},
        {x: "B", y: "X", magnitude: 8},
        {x: "C", y: "Y", magnitude: 16},
        {x: "D", y: "Z", magnitude: 24}
      ];
      dataset.data(data);
      var cells = (<any> gridPlot)._renderArea.selectAll("rect")[0];
      assert.strictEqual(cells.length, data.length);
      for (var i = 0; i < cells.length; i++) {
        var cell = d3.select(cells[i]);
        assert.strictEqual(cell.attr("x"), String(i * CELL_WIDTH), "Cell x coord is correct");
        assert.strictEqual(cell.attr("y"), String(i * CELL_HEIGHT), "Cell y coord is correct");
        assert.strictEqual(cell.attr("width"), String(CELL_WIDTH), "Cell width is correct");
        assert.strictEqual(cell.attr("height"), String(CELL_HEIGHT), "Cell height is correct");
      }
      svg.remove();
    });

    it("can invert y axis correctly", () => {
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Category();
      var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(new Plottable.Dataset(DATA))
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale)
              .renderTo(svg);

      yScale.domain(["U", "V"]);

      var cells = (<any> gridPlot)._renderArea.selectAll("rect")[0];
      var cellAU = d3.select(cells[0]);
      var cellAV = d3.select(cells[2]);
      cellAU.attr("fill", "#000000");
      cellAU.attr("x", "0");
      cellAU.attr("y", "100");

      cellAV.attr("fill", "#ffffff");
      cellAV.attr("x", "0");
      cellAV.attr("y", "0");

      yScale.domain(["V", "U"]);
      cells = (<any> gridPlot)._renderArea.selectAll("rect")[0];
      cellAU = d3.select(cells[0]);
      cellAV = d3.select(cells[2]);
      cellAU.attr("fill", "#000000");
      cellAU.attr("x", "0");
      cellAU.attr("y", "0");

      cellAV.attr("fill", "#ffffff");
      cellAV.attr("x", "0");
      cellAV.attr("y", "100");

      svg.remove();
    });

    describe("getAllSelections()", () => {

      it("retrieves all selections with no args", () => {
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Category();
        var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var gridPlot = new Plottable.Plots.Rectangle();
        var dataset = new Plottable.Dataset(DATA);
        gridPlot.addDataset(dataset)
                .attr("fill", (d) => d.magnitude, colorScale);
        gridPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        gridPlot.renderTo(svg);

        var allCells = gridPlot.getAllSelections();
        assert.strictEqual(allCells.size(), 4, "all cells retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Category();
        var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var gridPlot = new Plottable.Plots.Rectangle();
        var dataset = new Plottable.Dataset(DATA);
        gridPlot.addDataset(dataset)
                .attr("fill", (d) => d.magnitude, colorScale);
        gridPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        gridPlot.renderTo(svg);

        var allCells = gridPlot.getAllSelections([dataset]);
        assert.strictEqual(allCells.size(), 4, "all cells retrieved");
        var selectionData = allCells.data();
        assert.includeMembers(selectionData, DATA, "data in selection data");

        svg.remove();
      });

      it("skips invalid Datasets", () => {
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Category();
        var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var gridPlot = new Plottable.Plots.Rectangle();
        var dataset = new Plottable.Dataset(DATA);
        gridPlot.addDataset(dataset)
          .attr("fill", (d) => d.magnitude, colorScale);
         gridPlot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale);
        gridPlot.renderTo(svg);

        var dummyDataset = new Plottable.Dataset([]);
        var allCells = gridPlot.getAllSelections([dataset, dummyDataset]);
        assert.strictEqual(allCells.size(), 4, "all cells retrieved");
        var selectionData = allCells.data();
        assert.includeMembers(selectionData, DATA, "data in selection data");

        svg.remove();
      });

    });

  });
});
