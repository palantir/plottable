import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { makeSymbolCanvasDrawStep } from "../../src/drawers/symbolDrawer";

describe("SymbolCanvasDrawStep", () => {
  const data = [{ x: 0, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }];
  const dataset = new Plottable.Dataset(data);

  const symbolProjectorSpy: sinon.SinonSpy = sinon.spy();
  const sizeProjectorSpy: sinon.SinonSpy = sinon.spy();

  const symbolCanvasDrawStep = makeSymbolCanvasDrawStep(
    dataset,
    symbolProjectorSpy,
    sizeProjectorSpy,
  );

  it("uses the line factory during canvas drawing", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    symbolCanvasDrawStep(context, data, {});

    // we check the size of each symbol
    assert.isTrue(sizeProjectorSpy.called, "called size projector");
    assert.equal(sizeProjectorSpy.callCount, 3, "called size projector 3 times");
    // all the symbols are culled because they are not within the canvas
    // bounds, so symbolProjector should never get called
    assert.isFalse(symbolProjectorSpy.called, "called symbol projector");
  });
});
