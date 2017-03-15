import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { SimpleSelection } from "../../src/core/interfaces";

import * as TestMethods from "../testMethods";

describe("Drawers", () => {
  describe("Line Drawer", () => {
    const data = [["A", "B", "C"]]; // line normally takes single array of data
    let svg: SimpleSelection<void>;
    let drawer: Plottable.Drawers.Line;

    const drawSteps: Plottable.Drawers.DrawStep[] = [
      {
        attrToProjector: {},
        animator: new Plottable.Animators.Null(),
      },
    ];

    let d3LineFactorySpy: sinon.SinonSpy;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      drawer = new Plottable.Drawers.Line(null, () => d3.line());
      d3LineFactorySpy = sinon.spy(drawer, "_d3LineFactory");
      drawer.renderArea(svg);
    });

    afterEach(function() {
      if (this.currentTest.state === "passed") {
        svg.remove();
      }
    });

    it("has a fill of \"none\"", () => {
      drawer.draw(data, drawSteps);
      assert.strictEqual(drawer.selection().style("fill"), "none");
    });

    it("retrieves the same path regardless of requested selection index", () => {
      drawer.draw(data, drawSteps);
      const expectedSelection = svg.selectAll<Element, any>("path");
      data[0].forEach((datum, index) => {
        const selectionForIndex = drawer.selectionForIndex(index);
        assert.strictEqual(selectionForIndex.size(), 1, `selection for index ${index} contains only one element`);
        assert.strictEqual(selectionForIndex.node(), expectedSelection.node(), `selection for index ${index} contains the correct element`);
      });
    });

    it("uses the line factory during canvas drawing", () => {
      const canvas = d3.select(document.createElement("canvas"));
      drawer.canvas(canvas);

      drawer.draw(data, drawSteps);
      assert.isTrue(d3LineFactorySpy.called, "got a line factory");
    });
  });
});
