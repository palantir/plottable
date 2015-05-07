///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("getPixelPoint", () => {
      var svg = TestMethods.generateSVG(300, 300);
      var data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var linePlot = new Plottable.Plots.Line(xScale, yScale);

      var drawer = new Plottable.Drawers.Line("_0"); // HACKHACK #1984: Dataset keys are being removed, so this is the internal key
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset(new Plottable.Dataset(data));
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
      var svg = TestMethods.generateSVG(300, 300);
      var data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var linePlot = new Plottable.Plots.Line(xScale, yScale);

      var drawer = new Plottable.Drawers.Line("_0"); // HACKHACK #1984: Dataset keys are being removed, so this is the internal key
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset(new Plottable.Dataset(data));
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
  });
});
