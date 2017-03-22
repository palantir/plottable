import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SVGDrawers", () => {
  describe("Arc Outline Drawer", () => {
    it("has a fill of \"none\"", () => {
      const drawer = new Plottable.Drawers.ArcOutlineSVGDrawer();
      const svg = TestMethods.generateSVG();

      const data = [["A", "B", "C"]]; // arc outline normally takes single array of data
      const drawSteps: Plottable.Drawers.AppliedDrawStep[] = [
        {
          attrToAppliedProjector: {},
          animator: new Plottable.Animators.Null(),
        },
      ];
      drawer.draw(svg, data, drawSteps);

      assert.strictEqual(drawer.selection().style("fill"), "none");

      svg.remove();
    });
  });
});
