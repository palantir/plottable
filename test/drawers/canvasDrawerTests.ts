import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import { CanvasDrawer } from "../../src/drawers/canvasDrawer";
import * as Plottable from "../../src";

describe("CanvasDrawer", () => {
  it("draw() calls _drawStepCanvas", () => {
    const drawStepSpy = sinon.spy();
    const drawer = new CanvasDrawer(drawStepSpy);

    const canvas = d3.select(document.createElement("canvas"));
    const data: any[] = [];
    const drawStep: Plottable.Drawers.AppliedDrawStep = {
      animator: new Plottable.Animators.Null(),
      attrToAppliedProjector: {}
    };
    drawer.draw(canvas, data, [drawStep]);
    assert.strictEqual(drawStepSpy.args[0][1], data, "drawStep is called with data");
    assert.strictEqual(drawStepSpy.args[0][2], drawStep.attrToAppliedProjector, "drawStep is called with attrToAppliedProjector");
  });
});
