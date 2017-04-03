import { assert } from "chai";
import * as d3 from "d3";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SVGDrawers", () => {
  describe("Arc Drawer", () => {
    it("has a stroke of \"none\"", () => {
      const drawer = new Plottable.Drawers.ArcSVGDrawer();
      const svg = TestMethods.generateSVG();
      drawer.attachTo(svg);

      const data = [["A", "B", "C"]]; // arc normally takes single array of data
      const drawSteps: Plottable.Drawers.AppliedDrawStep[] = [
        {
          attrToAppliedProjector: {},
          animator: new Plottable.Animators.Null(),
        },
      ];
      drawer.draw(data, drawSteps);

      assert.strictEqual(d3.selectAll(drawer.getVisualPrimitives()).style("stroke"), "none");

      svg.remove();
    });
  });
});
