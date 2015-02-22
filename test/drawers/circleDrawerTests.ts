///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Circle Drawer", () => {
    it("getPixelPoint", () => {
      var svg = generateSVG(300, 300);
      var data = [{a: 12, b: 10}, {a: 31, b: 24}, {a: 22, b: 21}, {a: 15, b: 14}];
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale);

      var drawer = new Plottable._Drawer.Circle("one");
      (<any> drawer)._svgElement = "circle";
      (<any> scatterPlot)._getDrawer = () => drawer;

      scatterPlot.addDataset("one", data);
      scatterPlot.project("x", "a", xScale);
      scatterPlot.project("y", "b", yScale);
      scatterPlot.renderTo(svg);

      data.forEach((datum: any, index: number) => {
        var pixelPoint = drawer._getPixelPoint(datum, index);
        assert.closeTo(pixelPoint.x, xScale.scale(datum.a), 1, "x coordinate correct");
        assert.closeTo(pixelPoint.y, yScale.scale(datum.b), 1, "y coordinate correct");
      });

      svg.remove();
    });
  });
});
