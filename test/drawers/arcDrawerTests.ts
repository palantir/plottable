import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SVGDrawers", () => {
  describe("Arc Drawer", () => {
    it("has a stroke of \"none\"", () => {
      const drawer = new Plottable.Drawers.ArcSVGDrawer();
      const svg = TestMethods.generateSVG();

      const data = [["A", "B", "C"]]; // arc normally takes single array of data
      const drawSteps: Plottable.Drawers.AppliedDrawStep[] = [
        {
          attrToAppliedProjector: {},
          animator: new Plottable.Animators.Null(),
        },
      ];
      drawer.draw(svg, data, drawSteps);

      assert.strictEqual(drawer.selection().style("stroke"), "none");

      svg.remove();
    });
  });
});
