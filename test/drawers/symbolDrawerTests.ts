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

    let symbolProjectorSpy: sinon.SinonSpy;
    let sizeProjectorSpy: sinon.SinonSpy;

    beforeEach(() => {
      drawer = new Plottable.Drawers.Symbol(
        null,
        () => () => Plottable.SymbolFactories.circle(),
        () => () => 10,
      );
      symbolProjectorSpy = sinon.spy(drawer, "symbolProjector");
      sizeProjectorSpy = sinon.spy(drawer, "sizeProjector");
    });


    it("uses the line factory during canvas drawing", (done) => {
      const canvas = d3.select(document.createElement("canvas"));
      drawer.canvas(canvas);
      drawer.draw(data, drawSteps);
      // we check the size of each symbole
      assert.isTrue(sizeProjectorSpy.called, "called size projector");
      assert.equal(sizeProjectorSpy.callCount, 3, "called size projector 3 times");
      // all the symbols are culled because they are not within the canvas
      // bounds, so symbolProjector never gets called, which is good
      assert.isFalse(symbolProjectorSpy.called, "called symbol projector");
    });
  });
});
