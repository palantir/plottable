///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Rect Drawer", () => {
    it("getPixelPoint vertical", () => {
      var svg = TestMethods.generateSVG(300, 300);
      var data = [{a: "foo", b: 10}, {a: "bar", b: 24}];
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();
      var barPlot = new Plottable.Plots.Bar(xScale, yScale);

      var drawer = new Plottable.Drawers.Rect("_0", true); // HACKHACK #1984: Dataset keys are being removed, so this is the internal key
      (<any> barPlot)._getDrawer = () => drawer;

      barPlot.addDataset(new Plottable.Dataset(data));
      barPlot.x((d: any) => d.a, xScale);
      barPlot.y((d: any) => d.b, yScale);
      barPlot.renderTo(svg);

      barPlot.getAllSelections().each(function (datum: any, index: number) {
        var selection = d3.select(this);
        var pixelPoint = drawer._getPixelPoint(datum, index);
        assert.closeTo(pixelPoint.x, parseFloat(selection.attr("x")) + parseFloat(selection.attr("width")) / 2, 1, "x coordinate correct");
        assert.closeTo(pixelPoint.y, parseFloat(selection.attr("y")), 1, "y coordinate correct");
      });

      svg.remove();
    });

    it("getPixelPoint horizontal", () => {
      var svg = TestMethods.generateSVG(300, 300);
      var data = [{ a: "foo", b: 10 }, { a: "bar", b: 24 }];
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Category();
      var barPlot = new Plottable.Plots.Bar(xScale, yScale, false);

      var drawer = new Plottable.Drawers.Rect("_0", false); // HACKHACK #1984: Dataset keys are being removed, so this is the internal key
      (<any> barPlot)._getDrawer = () => drawer;

      barPlot.addDataset(new Plottable.Dataset(data));
      barPlot.x((d: any) => d.x, xScale);
      barPlot.y((d: any) => d.y, yScale);
      barPlot.renderTo(svg);

      barPlot.getAllSelections().each(function(datum: any, index: number) {
        var selection = d3.select(this);
        var pixelPoint = drawer._getPixelPoint(datum, index);
        assert.closeTo(pixelPoint.x, parseFloat(selection.attr("x")) + parseFloat(selection.attr("width")), 1, "x coordinate correct");
        assert.closeTo(pixelPoint.y, parseFloat(selection.attr("y")) + parseFloat(selection.attr("height")) / 2, 1, "y coordinate correct");
      });

      svg.remove();
    });
  });
});
