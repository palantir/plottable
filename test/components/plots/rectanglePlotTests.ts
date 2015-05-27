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
                   .x2((d) => d.x2, xScale)
                   .y2((d) => d.y2, yScale)
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
        .y2((d: any) => d.y2, yScale);
      plot.addDataset(new Plottable.Dataset(data1));

      plot.renderTo(svg);

      var rectanglesSelection = (<any> plot)._element.selectAll(".bar-area rect");

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
});
