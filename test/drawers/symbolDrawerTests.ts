import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import * as Plottable from "../../src";

describe("Drawers", () => {
  describe("Symbol Drawer", () => {
    const data = [{ x: 0, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }];
    let drawer: Plottable.Drawers.Symbol;

    const drawSteps: Plottable.Drawers.DrawStep[] = [
      {
        attrToProjector: {},
        animator: new Plottable.Animators.Null(),
      },
    ];

    let d3SymbolGeneratorFactorySpy: sinon.SinonSpy;

    beforeEach(() => {
      drawer = new Plottable.Drawers.Symbol(null, () => (datum, index, dataset) => d3.symbol());
      d3SymbolGeneratorFactorySpy = sinon.spy(drawer, "_d3SymbolGeneratorFactory");
    });

    it("uses the line factory during canvas drawing", () => {
      const canvas = d3.select(document.createElement("canvas"));
      drawer.canvas(canvas);

      drawer.draw(data, drawSteps);
      assert.isTrue(d3SymbolGeneratorFactorySpy.called, "got a line factory");
    });
  });
});
