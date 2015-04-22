///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("RectanglePlot", () => {
    var SVG_WIDTH  = 300;
    var SVG_HEIGHT = 300;
    var DATA       = [
      { x: 0, y: 0, x2: 1, y2: 1 },
      { x: 1, y: 1, x2: 2, y2: 2 },
      { x: 2, y: 2, x2: 3, y2: 3 },
      { x: 3, y: 3, x2: 4, y2: 4 },
      { x: 4, y: 4, x2: 5, y2: 5 }
    ];

    var VERIFY_CELLS = (cells: D3.Selection) => {
      assert.equal(cells[0].length, 5);
      cells.each(function(d: D3.Selection, i: number) {
        var cell = d3.select(this);
        assert.closeTo(+cell.attr("height"), 50, 0.5, "Cell height is correct");
        assert.closeTo(+cell.attr("width"), 50, 0.5, "Cell width is correct");
        assert.closeTo(+cell.attr("x"), 25 + 50 * i, 0.5, "Cell x coordinate is correct");
        assert.closeTo(+cell.attr("y"), 25 + 50 * (cells[0].length - i - 1), 0.5, "Cell y coordinate is correct");
      });
    };

    it("renders correctly", () => {
      var xScale        = new Plottable.Scale.Linear();
      var yScale        = new Plottable.Scale.Linear();
      var svg           = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var rectanglePlot = new Plottable.Plot.Rectangle(xScale, yScale);
      rectanglePlot.addDataset(DATA)
              .project("x", "x", xScale)
              .project("y", "y", yScale)
              .project("x1", "x", xScale)
              .project("y1", "y", yScale)
              .project("x2", "x2", xScale)
              .project("y2", "y2", yScale)
              .renderTo(svg);
      VERIFY_CELLS((<any> rectanglePlot)._renderArea.selectAll("rect"));
      svg.remove();
    });
  });

  describe("fail safe tests", () => {
    it("illegal rectangles don't get displayed", () => {
      var svg = generateSVG();

      var data1 = [
        { x: "A", y1: 1, y2: 2, v: 1 },
        { x: "B", y1: 2, y2: 3, v: 2 },
        { x: "C", y1: 3, y2: NaN, v: 3 },
        { x: "D", y1: 4, y2: 5, v: 4 },
        { x: "E", y1: 5, y2: 6, v: 5 },
        { x: "F", y1: 6, y2: 7, v: 6 }
      ];

      var xScale = new Plottable.Scale.Category();
      var yScale = new Plottable.Scale.Linear();

      var plot = new Plottable.Plot.Grid(xScale, yScale);
      plot
        .project("x", "x", xScale)
        .project("y", "y1", yScale)
        .project("y2", "y2", yScale);
      plot.addDataset(data1);

      plot.renderTo(svg);

      plot._element.selectAll(".bar-area rect").each(function(d: any, i: number) {
        var sel = d3.select(this);
        assert.isFalse(Plottable._Util.Methods.isNaN(sel.attr("x")),
          "x attribute should be valid for rectangle # " + i);
        assert.isFalse(Plottable._Util.Methods.isNaN(sel.attr("y")),
          "y attribute should be valid for rectangle # " + i);
        assert.isFalse(Plottable._Util.Methods.isNaN(sel.attr("height")),
          "height attribute should be valid for rectangle # " + i);
        assert.isFalse(Plottable._Util.Methods.isNaN(sel.attr("width")),
          "width attribute should be valid for rectangle # " + i);
      });

      var brokenRectHeight = d3.select(plot._element.selectAll(".bar-area rect")[0][2]).attr("height");

      assert.strictEqual(brokenRectHeight, "0",
        "the broken rectangle (third one) should have no height, hence not displayed");

      svg.remove();
    });
  });

});
