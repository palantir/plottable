///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("selectionForIndex()", () => {
      var svg = TestMethods.generateSVG(300, 300);
      var data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      var dataset = new Plottable.Dataset(data);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var linePlot = new Plottable.Plots.Line();

      var drawer = new Plottable.Drawers.Line(dataset);
      (<any> linePlot)._getDrawer = () => drawer;

      linePlot.addDataset(dataset);
      linePlot.x((d: any) => d.a, xScale);
      linePlot.y((d: any) => d.b, yScale);
      linePlot.renderTo(svg);

      var lineSelection = linePlot.getAllSelections();
      data.forEach((datum: any, index: number) => {
        var selection = drawer.selectionForIndex(index);
        assert.strictEqual(selection.node(), lineSelection.node(), "line selection retrieved");
      });

      svg.remove();
    });
  });
});
