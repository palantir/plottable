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
      var rectanglePlot = new Plottable.Plots.Rectangle(xScale, yScale);
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
});
