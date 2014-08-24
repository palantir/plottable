///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Grid<string, string>Plot", () => {
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
      assert.equal(cellAU.attr("y"), "100", "cell 'AU' x coord is correct");
      assert.equal(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");

      assert.equal(cellBU.attr("height"), "100", "cell 'BU' height is correct");
      assert.equal(cellBU.attr("width"), "200", "cell 'BU' width is correct");
      assert.equal(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
      assert.equal(cellBU.attr("y"), "100", "cell 'BU' x coord is correct");
      assert.equal(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");

      assert.equal(cellAV.attr("height"), "100", "cell 'AV' height is correct");
      assert.equal(cellAV.attr("width"), "200", "cell 'AV' width is correct");
      assert.equal(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
      assert.equal(cellAV.attr("y"), "0", "cell 'AV' x coord is correct");
      assert.equal(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");

      assert.equal(cellBV.attr("height"), "100", "cell 'BV' height is correct");
      assert.equal(cellBV.attr("width"), "200", "cell 'BV' width is correct");
      assert.equal(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
      assert.equal(cellBV.attr("y"), "0", "cell 'BV' x coord is correct");
      assert.equal(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
    };

    it("renders correctly", () => {
      var xScale = new Plottable.Scale.Ordinal<string>();
      var yScale = new Plottable.Scale.Ordinal<string>();
      var colorScale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var renderer = new Plottable.Plot.Grid<string, string, number>(DATA, xScale, yScale, colorScale)
                                                          .project("fill", "magnitude", colorScale);
      renderer.renderTo(svg);
      VERIFY_CELLS(renderer.renderArea.selectAll("rect")[0]);
      svg.remove();
    });


    it("renders correctly when data is set after construction", () => {
      var xScale = new Plottable.Scale.Ordinal<string>();
      var yScale = new Plottable.Scale.Ordinal<string>();
      var colorScale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var renderer = new Plottable.Plot.Grid<string, string, number>(null, xScale, yScale, colorScale)
                                                          .project("fill", "magnitude", colorScale);
      renderer.renderTo(svg);
      renderer.dataSource().data(DATA);
      VERIFY_CELLS(renderer.renderArea.selectAll("rect")[0]);
      svg.remove();
    });

    it("can invert y axis correctly", () => {
      var xScale = new Plottable.Scale.Ordinal<string>();
      var yScale = new Plottable.Scale.Ordinal<string>();
      var colorScale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var renderer = new Plottable.Plot.Grid<string, string, number>([], xScale, yScale, colorScale)
                                                          .project("fill", "magnitude");
      renderer.renderTo(svg);

      yScale.domain(["U", "V"]);
      renderer.dataSource().data(DATA);

      var cells = renderer.renderArea.selectAll("rect")[0];
      var cellAU = d3.select(cells[0]);
      var cellAV = d3.select(cells[2]);
      cellAU.attr("fill", "#000000");
      cellAU.attr("x", "0");
      cellAU.attr("y", "100");

      cellAV.attr("fill", "#ffffff");
      cellAV.attr("x", "0");
      cellAV.attr("y", "0");

      yScale.domain(["V", "U"]);
      cells = renderer.renderArea.selectAll("rect")[0];
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
