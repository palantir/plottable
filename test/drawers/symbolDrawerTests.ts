import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { makeSymbolCanvasDrawStep } from "../../src/drawers/symbolDrawer";

describe("SymbolCanvasDrawStep", () => {
  const data = [{ x: -20, y: 0 }, { x: 2, y: -30 }, { x: -50, y: 2 }];
  const dataset = new Plottable.Dataset(data);

  const symbolProjector = () => () => Plottable.SymbolFactories.circle();
  const sizeProjector = () => () => 10;

  const symbolProjectorSpy = sinon.spy(symbolProjector);
  const sizeProjectorSpy = sinon.spy(sizeProjector);
  const symbolCanvasDrawStep = makeSymbolCanvasDrawStep(dataset, symbolProjectorSpy, sizeProjectorSpy);

  it("checks whether each symbol is in view before drawing", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 10;
    canvas.height = 10;
    const context = canvas.getContext("2d");
    symbolCanvasDrawStep(context, data, {
      x: (data) => data.x,
      y: (data) => data.y,
    });

    // we check the size of each symbol
    assert.isTrue(sizeProjectorSpy.called, "called size projector");
    assert.equal(sizeProjectorSpy.callCount, data.length, "called size projector n times");
    // all the symbols are culled because they are not within the canvas
    // bounds, so symbolProjector should never get called
    assert.isFalse(symbolProjectorSpy.called, "called symbol projector");
  });
});
