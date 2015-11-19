///<reference path="../testReference.ts" />

describe("Drawers", () => {
  describe("Area Drawer", () => {
    const data = [["A", "B", "C"]]; // area normally takes single array of data
    let svg: d3.Selection<void>;
    let drawer: Plottable.Drawers.Area;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      drawer = new Plottable.Drawers.Area(null);
      drawer.renderArea(svg);

      const drawSteps: Plottable.Drawers.DrawStep[] = [
        {
          attrToProjector: {},
          animator: new Plottable.Animators.Null()
        }
      ];
      drawer.draw(data, drawSteps);
    });

    afterEach(function() {
      if (this.currentTest.state === "passed") {
        svg.remove();
      }
    });

    it("has a stroke of \"none\"", () => {
      assert.strictEqual(drawer.selection().style("stroke"), "none");
    });

    it("retrieves the same path regardless of requested selection index", () => {
      const expectedSelection = svg.selectAll("path");
      data[0].forEach((datum, index) => {
        const selectionForIndex = drawer.selectionForIndex(index);
        assert.strictEqual(selectionForIndex.size(), 1, `selection for index ${index} contains only one element`);
        assert.strictEqual(selectionForIndex.node(), expectedSelection.node(), `selection for index ${index} contains the correct element`);
      });
    });
  });
});
