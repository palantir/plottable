///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("selectionForIndex()", () => {
      let svg = TestMethods.generateSVG(300, 300);
      let data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      let dataset = new Plottable.Dataset(data);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let linePlot = new Plottable.Plots.Line();

      let drawer = new Plottable.Drawers.Line(dataset);
      (<any> linePlot)._createDrawer = () => drawer;

      linePlot.addDataset(dataset);
      linePlot.x((d: any) => d.a, xScale);
      linePlot.y((d: any) => d.b, yScale);
      linePlot.renderTo(svg);

      let lineSelection = linePlot.selections();
      data.forEach((datum: any, index: number) => {
        let selection = drawer.selectionForIndex(index);
        assert.strictEqual(selection.node(), lineSelection.node(), "line selection retrieved");
      });

      svg.remove();
    });
  });
});
