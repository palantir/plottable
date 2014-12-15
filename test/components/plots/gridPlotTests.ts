///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("GridPlot", () => {
    var SVG_WIDTH  = 400;
    var SVG_HEIGHT = 200;
    var DATA       = [
      {x: "A", y: "U", magnitude: 0},
      {x: "B", y: "U", magnitude: 2},
      {x: "A", y: "V", magnitude: 16},
      {x: "B", y: "V", magnitude: 8},
    ];

    var VERIFY_CELLS = (cells: any[]) => {
      assert.equal(cells.length, 4);

      var cellAU = d3.select(cells[0]);
      var cellBU = d3.select(cells[1]);
      var cellAV = d3.select(cells[2]);
      var cellBV = d3.select(cells[3]);

      assert.equal(cellAU.attr("height"), "100", "cell 'AU' height is correct");
      assert.equal(cellAU.attr("width"), "200", "cell 'AU' width is correct");
      assert.equal(cellAU.attr("x"), "0", "cell 'AU' x coord is correct");
      assert.equal(cellAU.attr("y"), "0", "cell 'AU' y coord is correct");
      assert.equal(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");

      assert.equal(cellBU.attr("height"), "100", "cell 'BU' height is correct");
      assert.equal(cellBU.attr("width"), "200", "cell 'BU' width is correct");
      assert.equal(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
      assert.equal(cellBU.attr("y"), "0", "cell 'BU' y coord is correct");
      assert.equal(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");

      assert.equal(cellAV.attr("height"), "100", "cell 'AV' height is correct");
      assert.equal(cellAV.attr("width"), "200", "cell 'AV' width is correct");
      assert.equal(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
      assert.equal(cellAV.attr("y"), "100", "cell 'AV' y coord is correct");
      assert.equal(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");

      assert.equal(cellBV.attr("height"), "100", "cell 'BV' height is correct");
      assert.equal(cellBV.attr("width"), "200", "cell 'BV' width is correct");
      assert.equal(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
      assert.equal(cellBV.attr("y"), "100", "cell 'BV' y coord is correct");
      assert.equal(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
    };

    it("renders correctly", () => {
      var xScale: Plottable.Scale.Ordinal = new Plottable.Scale.Ordinal();
      var yScale: Plottable.Scale.Ordinal = new Plottable.Scale.Ordinal();
      var colorScale: Plottable.Scale.InterpolatedColor = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      var svg: D3.Selection = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var gridPlot: Plottable.Plot.Grid = new Plottable.Plot.Grid(xScale, yScale, colorScale);
      gridPlot.addDataset(DATA)
              .project("fill", "magnitude", colorScale)
              .project("x", "x", xScale)
              .project("y", "y", yScale);
      gridPlot.renderTo(svg);
      VERIFY_CELLS((<any> gridPlot)._renderArea.selectAll("rect")[0]);
      svg.remove();
    });


    it("renders correctly when data is set after construction", () => {
      var xScale: Plottable.Scale.Ordinal = new Plottable.Scale.Ordinal();
      var yScale: Plottable.Scale.Ordinal = new Plottable.Scale.Ordinal();
      var colorScale: Plottable.Scale.InterpolatedColor = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      var svg: D3.Selection = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dataset = new Plottable.Dataset();
      var gridPlot: Plottable.Plot.Grid = new Plottable.Plot.Grid(xScale, yScale, colorScale);
      gridPlot.addDataset(dataset)
              .project("fill", "magnitude", colorScale)
              .project("x", "x", xScale)
              .project("y", "y", yScale)
              .renderTo(svg);
      dataset.data(DATA);
      VERIFY_CELLS((<any> gridPlot)._renderArea.selectAll("rect")[0]);
      svg.remove();
    });

    it("can invert y axis correctly", () => {
      var xScale: Plottable.Scale.Ordinal = new Plottable.Scale.Ordinal();
      var yScale: Plottable.Scale.Ordinal = new Plottable.Scale.Ordinal();
      var colorScale: Plottable.Scale.InterpolatedColor = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      var svg: D3.Selection = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var gridPlot: Plottable.Plot.Grid = new Plottable.Plot.Grid(xScale, yScale, colorScale);
      gridPlot.addDataset(DATA)
              .project("fill", "magnitude")
              .project("x", "x", xScale)
              .project("y", "y", yScale)
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
  });
});
