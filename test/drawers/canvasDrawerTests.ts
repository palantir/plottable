import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import * as Plottable from "../../src";
import { CanvasDrawer } from "../../src/drawers/canvasDrawer";

describe("CanvasDrawer", () => {
  it("draw() calls _drawStepCanvas", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const drawStepSpy = sinon.spy();
    const drawer = new CanvasDrawer(context, drawStepSpy);

    const data: any[] = [];
    const drawStep: Plottable.Drawers.AppliedDrawStep = {
      animator: new Plottable.Animators.Null(),
      attrToAppliedProjector: {},
    };
    drawer.draw(data, [drawStep]);
    assert.strictEqual(drawStepSpy.args[0][1], data, "drawStep is called with data");
    assert.strictEqual(drawStepSpy.args[0][2], drawStep.attrToAppliedProjector, "drawStep is called with attrToAppliedProjector");
  });
});
