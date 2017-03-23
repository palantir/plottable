/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector } from "../core/interfaces";
import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export type CanvasDrawStep = (
  context: CanvasRenderingContext2D,
  data: any[],
  attrToAppliedProjector: AttributeToAppliedProjector,
) => void;

/**
 * A CanvasDrawer draws data onto a supplied Canvas Context.
 *
 * This class is immutable (but has internal state) and shouldn't be extended.
 */
export class CanvasDrawer implements Drawer {
  /**
   * @param _context The context for a canvas that this drawer will draw to.
   * @param _drawStep The draw step logic that actually draws.
   */
  constructor(private _context: CanvasRenderingContext2D, private _drawStep: CanvasDrawStep) {
  }

  // public for testing
  public getDrawStep() {
    return this._drawStep;
  }

  public draw(data: any[], appliedDrawSteps: AppliedDrawStep[]) {
    // don't support animations for now; just draw the last draw step immediately
    const lastDrawStep = appliedDrawSteps[appliedDrawSteps.length - 1];
    this._context.save();
    this._drawStep(this._context, data, lastDrawStep.attrToAppliedProjector);
    this._context.restore();
  }

  public getVisualPrimitives(): Element[] {
    return [];
  }

  public getVisualPrimitiveAtIndex(index: number): Element {
    return null;
  }

  public remove() {
    // NO op - canvas element owns the canvas; context is free
  }
}
