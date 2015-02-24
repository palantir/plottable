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
        var radius = 75;
        var angle = Math.PI / 4 + ((Math.PI * index) / 2);
        var expectedX = radius * Math.sin(angle);
        var expectedY = radius * Math.cos(angle);
        assert.closeTo(pixelPoint.x, expectedX, 1, "x coordinate correct");
        assert.closeTo(pixelPoint.y, expectedY, 1, "y coordinate correct");
      });

      svg.remove();
    });

    it("getSelectionDistance", () => {
      var svg = generateSVG(300, 300);
      var data = [{value: 10}, {value: 10}, {value: 10}, {value: 10}];
      var piePlot = new Plottable.Plot.Pie();

      var drawer = new Plottable._Drawer.Arc("one");
      (<any> piePlot)._getDrawer = () => drawer;

      piePlot.addDataset("one", data);
      piePlot.project("value", "value");
      piePlot.renderTo(svg);

      var queryPoint = {x: 150, y: 150};

      piePlot.getAllSelections().each(function (datum: any, index: number) {
        var selection = d3.select(this);
        var selectionDistance = drawer._getSelectionDistance(selection, queryPoint);
        var expectedDistance: number;
        switch(index) {
          case 0:
            expectedDistance = 150;
            break;
          case 1:
            expectedDistance = 150 * (Math.SQRT2 - 1);
            break;
          case 2:
            expectedDistance = 150;
            break;
          case 3:
            expectedDistance = 150 * Math.SQRT2;
            break;
          default:
            expectedDistance = 0;
        }
        assert.closeTo(selectionDistance, expectedDistance, 1, "works for arc " + index);
      });

      svg.remove();
    });
  });
});
