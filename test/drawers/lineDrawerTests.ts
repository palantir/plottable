///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Line Drawer", () => {
    it("retrieves the same line regardless of requested selection index", () => {
      const svg = TestMethods.generateSVG();
      const drawer = new Plottable.Drawers.Line(null);
      drawer.renderArea(svg);

      const data = [["A", "B", "C"]]; // line normally takes single array of data
      const drawSteps: Plottable.Drawers.DrawStep[] = [
        {
          attrToProjector: {},
          animator: new Plottable.Animators.Null()
        }
      ];
      drawer.draw(data, drawSteps);

      const expectedSelection = svg.selectAll("path");
      data[0].forEach((datum, index) => {
        const selectionForIndex = drawer.selectionForIndex(index);
        assert.strictEqual(selectionForIndex.size(), 1, `selection for index ${index} contains only one element`);
        assert.strictEqual(selectionForIndex.node(), expectedSelection.node(), `selection for index ${index} contains the correct element`);
      });

      svg.remove();
    });
  });
});
