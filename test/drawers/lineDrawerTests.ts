import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { SimpleSelection } from "../../src/core/interfaces";

import * as TestMethods from "../testMethods";
import { makeLineCanvasDrawStep } from "../../src/drawers/lineDrawer";

describe("SVGDrawers", () => {
  describe("Line Drawer", () => {
    const data = [["A", "B", "C"]]; // line normally takes single array of data
    let svg: d3.Selection<SVGElement, any, any, any>;
    let drawer: Plottable.Drawers.LineSVGDrawer;

    const drawSteps: Plottable.Drawers.AppliedDrawStep[] = [
      {
        attrToAppliedProjector: {},
        animator: new Plottable.Animators.Null(),
      },
    ];

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      drawer = new Plottable.Drawers.LineSVGDrawer();
    });

    afterEach(function() {
      if (this.currentTest.state === "passed") {
        svg.remove();
      }
    });

    it("has a fill of \"none\"", () => {
      drawer.draw(svg, data, drawSteps);
      assert.strictEqual(drawer.selection().style("fill"), "none");
    });

    it("retrieves the same path regardless of requested selection index", () => {
      drawer.draw(svg, data, drawSteps);
      const expectedSelection = svg.selectAll<Element, any>("path");
      data[0].forEach((datum, index) => {
        const selectionForIndex = drawer.selectionForIndex(index);
        assert.strictEqual(selectionForIndex.size(), 1, `selection for index ${index} contains only one element`);
        assert.strictEqual(selectionForIndex.node(), expectedSelection.node(), `selection for index ${index} contains the correct element`);
      });
    });
  });
});

describe("LineCanvasDrawStep", () => {
  const data = [["A", "B", "C"]]; // line normally takes single array of data
  it("uses the line factory during canvas drawing", () => {
    const line = d3.line();
    const lineDrawStep = makeLineCanvasDrawStep(() => line);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    lineDrawStep(context, data, {});
    assert.strictEqual(line.context(), context, "line's context is set");
  });
})
