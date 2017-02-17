import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Drawers", () => {
  describe("Arc Outline Drawer", () => {
    it("has a fill of \"none\"", () => {
      const drawer = new Plottable.Drawers.ArcOutline(null);
      const svg = TestMethods.generateSVG();
      drawer.renderArea(svg);

      const data = [["A", "B", "C"]]; // arc outline normally takes single array of data
      const drawSteps: Plottable.Drawers.DrawStep[] = [
        {
          attrToProjector: {},
          animator: new Plottable.Animators.Null(),
        },
      ];
      drawer.draw(data, drawSteps);

      assert.strictEqual(drawer.selection().style("fill"), "none");

      svg.remove();
    });
  });
});
