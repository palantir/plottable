import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { buffer, makeSymbolCanvasDrawStep } from "../../src/drawers/symbolDrawer";

describe("SymbolCanvasDrawStep", () => {
  let data: any[];
  let symbolProjector: () => Plottable.IAccessor<Plottable.SymbolFactory>;
  let sizeProjector: () => Plottable.IAccessor<number>;
  let symbolProjectorSpy: sinon.SinonSpy;
  let sizeProjectorSpy: sinon.SinonSpy;
  let bufferClearSpy: sinon.SinonSpy;
  let bufferBlitSpy: sinon.SinonSpy;

  // run once to create buffer spies
  before(() => {
    data = [{ x: -20, y: 0 }, { x: 2, y: -30 }, { x: -50, y: 2 }];
    symbolProjector = () => () => Plottable.SymbolFactories.circle();
    sizeProjector = () => () => 10;
    performDrawStep();
    bufferClearSpy = sinon.spy(buffer, "clear");
    bufferBlitSpy = sinon.spy(buffer, "blitCenter");
  });

  afterEach(() => {
    bufferClearSpy.reset();
    bufferBlitSpy.reset();
  });

  function performDrawStep() {
    const dataset = new Plottable.Dataset(data);

    symbolProjectorSpy = sinon.spy(symbolProjector);
    sizeProjectorSpy = sinon.spy(sizeProjector);

    const symbolCanvasDrawStep = makeSymbolCanvasDrawStep(dataset, symbolProjectorSpy, sizeProjectorSpy);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    symbolCanvasDrawStep(context, data, {
      x: (data) => data.x,
      y: (data) => data.y,
    });
  }

  describe("performance checks", () => {
    it("should check whether each symbol is in view before drawing", () => {
      data = [{ x: -20, y: 0 }, { x: 2, y: -30 }, { x: -50, y: 2 }];
      symbolProjector = () => () => Plottable.SymbolFactories.circle();
      sizeProjector = () => () => 10;

      performDrawStep();

      // we check the size of each symbol
      assert.isTrue(sizeProjectorSpy.called, "called size projector");
      assert.equal(sizeProjectorSpy.callCount, data.length, "called size projector n times");
      // all the symbols are culled because they are not within the canvas
      // bounds, so symbolProjector should never get called
      assert.isFalse(symbolProjectorSpy.called, "called symbol projector");
    });

    it("should re-use symbol from buffer if the same shape and size", () => {
      data = [{ x: 0, y: 0 }, { x: 2, y: 5 }, { x: 4, y: 2 }];
      const circle = Plottable.SymbolFactories.circle();
      symbolProjector = () => () => circle;
      sizeProjector = () => () => 10;

      performDrawStep();

      assert.equal(bufferClearSpy.callCount, 1, "cleared once");
      assert.equal(bufferBlitSpy.callCount, data.length, "drawn n times");
    });

    it("should not re-use symbol from buffer if different sizes", () => {
      data = [{ x: 0, y: 0 }, { x: 2, y: 5 }, { x: 4, y: 2 }];
      const circle = Plottable.SymbolFactories.circle();
      symbolProjector = () => () => circle;
      sizeProjector = () => (data, index) => index;

      performDrawStep();

      assert.equal(bufferClearSpy.callCount, data.length, "cleared n times");
      assert.equal(bufferBlitSpy.callCount, data.length, "drawn n times");
    });

    it("should not re-use symbol from buffer if different shape instance", () => {
      data = [{ x: 0, y: 0 }, { x: 2, y: 5 }, { x: 4, y: 2 }];
      symbolProjector = () => () => Plottable.SymbolFactories.circle();
      sizeProjector = () => () => 10;

      performDrawStep();

      assert.equal(bufferClearSpy.callCount, data.length, "cleared n times");
      assert.equal(bufferBlitSpy.callCount, data.length, "drawn n times");
    });
  });
});
