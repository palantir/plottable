///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Arc Drawer", () => {
    it("getPixelPoint", () => {
      var svg = generateSVG(300, 300);
      var data = [{value: 10}, {value: 10}, {value: 10}, {value: 10}];
      var piePlot = new Plottable.Plot.Pie();

      var drawer = new Plottable._Drawer.Arc("one");
      (<any> piePlot)._getDrawer = () => drawer;

      piePlot.addDataset("one", data);
      piePlot.project("value", "value");
      piePlot.renderTo(svg);

      piePlot.getAllSelections().each(function (datum: any, index: number) {
        var selection = d3.select(this);
        var pixelPoint = drawer._getPixelPoint(datum, index);
        var expectedX = index < 2 ? 0.75 * 300 : 0.25 * 300;
        var expectedY = index === 1 || index === 2 ? 0.75 * 300 : 0.25 * 300;
        assert.closeTo(pixelPoint.x, expectedX, 1, "x coordinate correct");
        assert.closeTo(pixelPoint.y, expectedY, 1, "y coordinate correct");
      });

      svg.remove();
    });
  });
});
