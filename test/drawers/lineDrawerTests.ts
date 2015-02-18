///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("getPixelPoint", () => {
      var svg = generateSVG(300, 300);
      var data = [{a: "foo", b: 10}, {a: "bar", b: 24}, {a: "baz", b: 21}, {a: "garply", b: 14}];
      var xScale = new Plottable.Scale.Ordinal();
      var yScale = new Plottable.Scale.Linear();
      var linePlot = new Plottable.Plot.Bar(xScale, yScale);

      var drawer = new Plottable._Drawer.Rect("one", true);
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset("one", data);
      linePlot.project("x", "a", xScale);
      linePlot.project("y", "b", yScale);
      linePlot.renderTo(svg);

      data.forEach((datum: any, index: number) => {
        var pixelPoint = drawer._getPixelPoint(datum, index);
        assert.closeTo(pixelPoint.x, xScale.scale(datum.a), 1, "x coordinate correct");
        assert.closeTo(pixelPoint.y, yScale.scale(datum.b), 1, "y coordinate correct");
      });

      svg.remove();
    });
  });
});
