/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { AttributeToAppliedProjector } from "../core/interfaces";
import { IDrawer } from "./drawer";
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
export class CanvasDrawer implements IDrawer {
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

export const ContextStyleAttrs = {
  strokeWidth: "stroke-width", stroke: "stroke", opacity: "opacity", fill: "fill",
};

export function resolveAttributesSubsetWithStyles(projector: AttributeToAppliedProjector, extraKeys: string[], datum: any, index: number) {
  const attrKeys = Object.keys(ContextStyleAttrs).concat(extraKeys);
  const attrs: {[key: string]: any} = {};
  for (let i = 0; i < attrKeys.length; i++) {
    const attrKey = attrKeys[i];
    if (projector.hasOwnProperty(attrKey)) {
      attrs[attrKey] = projector[attrKey](datum, index);
    }
  }
  return attrs;
}

export function styleContext(context: CanvasRenderingContext2D, attrs: {[key: string]: any}) {
  if (attrs[ContextStyleAttrs.strokeWidth]) {
    context.lineWidth = parseFloat(attrs[ContextStyleAttrs.strokeWidth]);
  }
  if (attrs[ContextStyleAttrs.stroke]) {
    const strokeColor = d3.color(attrs[ContextStyleAttrs.stroke]);
    if (attrs[ContextStyleAttrs.opacity]) {
      strokeColor.opacity = attrs[ContextStyleAttrs.opacity];
    }
    context.strokeStyle = strokeColor.rgb().toString();
    context.stroke();
  }
  if (attrs[ContextStyleAttrs.fill]) {
    const fillColor = d3.color(attrs[ContextStyleAttrs.fill]);
    if (attrs[ContextStyleAttrs.opacity]) {
      fillColor.opacity = attrs[ContextStyleAttrs.opacity];
    }
    context.fillStyle = fillColor.rgb().toString();
    context.fill();
  }
}
