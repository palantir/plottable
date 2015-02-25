///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("getPixelPoint", () => {
      var svg = generateSVG(300, 300);
      var data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var linePlot = new Plottable.Plot.Line(xScale, yScale);

      var drawer = new Plottable._Drawer.Line("one");
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset("one", data);
      linePlot.project("x", "a", xScale);
      linePlot.project("y", "b", yScale);
      linePlot.renderTo(svg);

      data.forEach((datum: any, index: number) => {
        var pixelPoint = drawer._getPixelPoint(datum, index);
        assert.closeTo(pixelPoint.x, xScale.scale(datum.a), 1, "x coordinate correct for index " + index);
        assert.closeTo(pixelPoint.y, yScale.scale(datum.b), 1, "y coordinate correct for index " + index);
      });

      svg.remove();
    });

    it("getSelection", () => {
      var svg = generateSVG(300, 300);
      var data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var linePlot = new Plottable.Plot.Line(xScale, yScale);

      var drawer = new Plottable._Drawer.Line("one");
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset("one", data);
      linePlot.project("x", "a", xScale);
      linePlot.project("y", "b", yScale);
      linePlot.renderTo(svg);

      var lineSelection = linePlot.getAllSelections();
      data.forEach((datum: any, index: number) => {
        var selection = drawer._getSelection(index);
        assert.strictEqual(selection.node(), lineSelection.node(), "line selection retrieved");
      });

      svg.remove();
    });

    it("getSelectionDistance", () => {
      var svg = generateSVG(300, 300);
      var data = [{a: 12, b: 15}, {a: 13, b: 18}, {a: 14, b: 10}, {a: 15, b: 20}];
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var linePlot = new Plottable.Plot.Line(xScale, yScale);

      var drawer = new Plottable._Drawer.Line("one");
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset("one", data);
      linePlot.project("x", "a", xScale);
      linePlot.project("y", "b", yScale);
      linePlot.renderTo(svg);

      var queryPoint = {x: xScale.scale(14), y: yScale.scale(10) + 10};

      var lineSelection = linePlot.getAllSelections();
      data.forEach((datum: any, index: number) => {
        var selection = drawer._getSelection(index);
        var selectionDistance = drawer._getSelectionDistance(selection, queryPoint);
        assert.closeTo(selectionDistance, 10, 1, "correct distance calculated");
      });

      svg.remove();
    });
  });
});
