/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector } from "../core/interfaces";
import { AppliedDrawStep } from "./index";

export type CanvasDrawStep = (
  context: CanvasRenderingContext2D,
  data: any[],
  attrToAppliedProjector: AttributeToAppliedProjector,
) => void;

/**
 * A CanvasDrawer draws data onto a supplied Canvas DOM element.
 *
 * This class is immutable (but has internal state) and shouldn't be extended.
 */
export class CanvasDrawer {
  private _drawStep: CanvasDrawStep;

  constructor(drawStep: CanvasDrawStep) {
    this._drawStep = drawStep;
  }

  public draw(canvas: d3.Selection<HTMLCanvasElement, any, any, any>, data: any[], appliedDrawSteps: AppliedDrawStep[]) {
    // don't support animations for now; just draw the last draw step immediately
    const lastDrawStep = appliedDrawSteps[appliedDrawSteps.length - 1];
    const context = canvas.node().getContext("2d");
    context.save();
    this._drawStep(context, data, lastDrawStep.attrToAppliedProjector);
    context.restore();
  }
}
