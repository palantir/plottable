import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { CanvasBuffer } from "../../src/drawers/canvasBuffer";
import { makeSymbolCanvasDrawStep } from "../../src/drawers/symbolDrawer";

describe.only("SymbolCanvasDrawStep", () => {
  let symbolProjectorSpy: sinon.SinonSpy;
  let sizeProjectorSpy: sinon.SinonSpy;
  let bufferClearSpy: sinon.SinonSpy;
  let bufferBlitSpy: sinon.SinonSpy;

  function performDrawStep(
      data: any[],
      symbolAccessor: Plottable.IAccessor<Plottable.SymbolFactory>,
      sizeAccessor: Plottable.IAccessor<number>,
    ) {

    const buffer = new CanvasBuffer(0,0);
    bufferClearSpy = sinon.spy(buffer, "clear");
    bufferBlitSpy = sinon.spy(buffer, "blitCenter");
    symbolProjectorSpy = sinon.spy(symbolAccessor);
    sizeProjectorSpy = sinon.spy(sizeAccessor);

    const dataset = new Plottable.Dataset(data);
    const symbolCanvasDrawStep = makeSymbolCanvasDrawStep(
      dataset,
      () => symbolProjectorSpy,
      () => sizeProjectorSpy,
      buffer);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    symbolCanvasDrawStep(context, data, {
      x: (data) => data.x,
      y: (data) => data.y,
    });
  }

  describe("performance checks", () => {
    it("should check whether each symbol is in view before drawing", () => {
      const data = [{ x: -20, y: 0 }, { x: 2, y: -30 }, { x: -50, y: 2 }];
      const circle = Plottable.SymbolFactories.circle();
      const symbolAccessor = () => circle;
      const sizeAccessor = () => 10;
      performDrawStep(data, symbolAccessor, sizeAccessor);

      // we check the size of each symbol
      assert.isTrue(sizeProjectorSpy.called, "called size projector");
      assert.equal(sizeProjectorSpy.callCount, data.length, "called size projector n times");
      // all the symbols are culled because they are not within the canvas
      // bounds, so symbolProjector should never get called
      assert.isFalse(symbolProjectorSpy.called, "called symbol projector");
    });

    it("should re-use symbol from buffer if the same shape and size", () => {
      const data = [{ x: 0, y: 0 }, { x: 2, y: 5 }, { x: 4, y: 2 }];
      const circle = Plottable.SymbolFactories.circle();
      const symbolAccessor = () => circle;
      const sizeAccessor = () => 10;
      performDrawStep(data, symbolAccessor, sizeAccessor);

      assert.equal(bufferClearSpy.callCount, 1, "cleared once");
      assert.equal(bufferBlitSpy.callCount, data.length, "drawn n times");
    });

    it("should not re-use symbol from buffer if different sizes", () => {
      const data = [{ x: 0, y: 0 }, { x: 2, y: 5 }, { x: 4, y: 2 }];
      const circle = Plottable.SymbolFactories.circle();
      const symbolAccessor = () => circle;
      const sizeAccessor = (_data: any, index: number) => index + 5;
      performDrawStep(data, symbolAccessor, sizeAccessor);

      assert.equal(bufferClearSpy.callCount, data.length, "cleared n times");
      assert.equal(bufferBlitSpy.callCount, data.length, "drawn n times");
    });

    it("should not re-use symbol from buffer if different shape instance", () => {
      const data = [{ x: 0, y: 0 }, { x: 2, y: 5 }, { x: 4, y: 2 }];
      const symbolAccessor = () => Plottable.SymbolFactories.circle();
      const sizeAccessor = () => 10;
      performDrawStep(data, symbolAccessor, sizeAccessor);

      assert.equal(bufferClearSpy.callCount, data.length, "cleared n times");
      assert.equal(bufferBlitSpy.callCount, data.length, "drawn n times");
    });
  });
});
