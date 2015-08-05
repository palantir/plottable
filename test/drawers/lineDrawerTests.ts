///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("selectionForIndex()", () => {
      const svg = TestMethods.generateSVG(300, 300);
      const data = [{a: 12, b: 10}, {a: 13, b: 24}, {a: 14, b: 21}, {a: 15, b: 14}];
      const dataset = new Plottable.Dataset(data);
      const xScale = new Plottable.Scales.Linear();
      const yScale = new Plottable.Scales.Linear();
      const linePlot = new Plottable.Plots.Line();

      const drawer = new Plottable.Drawers.Line(dataset);
      (<any> linePlot)._createDrawer = () => drawer;

      linePlot.addDataset(dataset);
      linePlot.x((d: any) => d.a, xScale);
      linePlot.y((d: any) => d.b, yScale);
      linePlot.renderTo(svg);

      const lineSelection = linePlot.selections();
      data.forEach((datum: any, index: number) => {
        const selection = drawer.selectionForIndex(index);
        assert.strictEqual(selection.node(), lineSelection.node(), "line selection retrieved");
      });

      svg.remove();
    });
  });
});
