import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import { makeLineCanvasDrawStep } from "../../src/drawers/lineDrawer";
import * as TestMethods from "../testMethods";

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
      drawer.attachTo(svg);
    });

    afterEach(() => {
      svg.remove();
    });

    it("has a fill of \"none\"", () => {
      drawer.draw(data, drawSteps);
      assert.strictEqual(d3.selectAll(drawer.getVisualPrimitives()).style("fill"), "none");
    });

    it("retrieves the same path regardless of requested selection index", () => {
      drawer.draw(data, drawSteps);
      const expectedSelection = drawer.getRoot().selectAll<Element, any>("path");
      assert.strictEqual(expectedSelection.size(), 1, "only one path");
      data[0].forEach((datum, index) => {
        const selectionForIndex = drawer.getVisualPrimitiveAtIndex(index);
        assert.strictEqual(selectionForIndex, expectedSelection.node(), `selection for index ${index} contains the correct element`);
      });
    });
  });
});

describe("LineCanvasDrawStep", () => {
  const data = [["A", "B", "C"]]; // line normally takes single array of data
  const collapsableData = [[
    // start
    [0, 10],
    // bucket 1
    [1,   7],
    [1.1, 5],
    [1,   7],
    [1.1, 5],
    [1,   7],
    [1.1, 5],
    [1,   7],
    [1.1, 5],
    // bucket 2
    [4,   8],
    [4.1, 2],
    [4,   8],
    [4.1, 2],
    [4,   8],
    [4.1, 2],
    // end
    [10, 10],
  ]]; // data that should be collapsed

  it("uses the line factory during canvas drawing", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const line = d3.line();
    const lineDrawStep = makeLineCanvasDrawStep(() => line, () => false);
    lineDrawStep(context, data, {});
    assert.strictEqual(line.context(), context, "line's context is set");
  });

  it("collapses lines when enabled", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const lineToSpy = sinon.spy(context, "lineTo");
    const line = d3.line().x((d) => d[0]).y((d) => d[1]);
    const lineDrawStep = makeLineCanvasDrawStep(() => line, () => true);
    lineDrawStep(context, collapsableData, {});
    assert.equal(lineToSpy.callCount, 9, "line was collapsed");
  });
});
