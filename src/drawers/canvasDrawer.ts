/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { AttributeToAppliedProjector } from "../core/interfaces";
import { IDrawer } from "./drawer";
import { AppliedDrawStep } from "./drawStep";

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
    const projector  = appliedDrawSteps[appliedDrawSteps.length - 1].attrToAppliedProjector;

    // don't support animations for now; just draw the last draw step immediately
    this._context.save();
    this._drawStep(this._context, data, projector);
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

export const ContextStyleAttrs = [
  "fill-opacity",
  "fill",
  "opacity",
  "stroke-opacity",
  "stroke-width",
  "stroke",
];

export function resolveAttributesSubsetWithStyles(projector: AttributeToAppliedProjector, extraKeys: string[], datum: any, index: number) {
  const attrKeys = ContextStyleAttrs.concat(extraKeys);
  return resolveAttributes(projector, attrKeys, datum, index);
}

export function resolveAttributes(projector: AttributeToAppliedProjector, attrKeys: string[], datum: any, index: number) {
  const attrs: Record<string, any> = {};
  for (const attrKey of attrKeys) {
    if (projector.hasOwnProperty(attrKey)) {
      attrs[attrKey] = projector[attrKey](datum, index);
    }
  }
  return attrs;
}

export interface IStrokeStyle {
  "stroke-opacity"?: number;
  "stroke-width"?: number;
  opacity?: number;
  stroke?: string;
}

export interface IFillStyle {
  "fill-opacity"?: number;
  fill?: string;
  opacity?: number;
}

function getStrokeOpacity(style: Record<string, any>) {
  const baseOpacity = style["opacity"] != null ? parseFloat(style["opacity"]) : 1;
  const strokeOpacity = style["stroke-opacity"] != null ? parseFloat(style["stroke-opacity"]) : 1;
  return strokeOpacity * baseOpacity;
}

function getFillOpacity(style: Record<string, any>) {
  const baseOpacity = style["opacity"] != null ? parseFloat(style["opacity"]) : 1;
  const fillOpacity = style["fill-opacity"] != null ? parseFloat(style["fill-opacity"]) : 1;
  return fillOpacity * baseOpacity;
}

function getStrokeWidth(style: Record<string, any>) {
  return style["stroke-width"] != null ? parseFloat(style["stroke-width"]) : 1;
}

export function renderArea(context: CanvasRenderingContext2D, d3Area: d3.Area<any>, data: any[], style: IFillStyle & IStrokeStyle) {
    context.save();
    context.beginPath();
    d3Area.context(context);
    d3Area(data);
    context.lineJoin = "round";
    renderPathWithStyle(context, style);
    context.restore();
}

export function renderLine(context: CanvasRenderingContext2D, d3Line: d3.Line<any>, data: any[], style: IStrokeStyle) {
    context.save();
    context.beginPath();
    d3Line.context(context);
    d3Line(data);
    context.lineJoin = "round";
    renderPathWithStyle(context, style);
    context.restore();
}

export function renderPathWithStyle(context: CanvasRenderingContext2D, style: Record<string, any>) {
  if (style["stroke"]) {
    context.lineWidth = getStrokeWidth(style);
    const strokeColor = d3.color(style["stroke"]);
    strokeColor.opacity = getStrokeOpacity(style);
    context.strokeStyle = strokeColor.toString();
    context.stroke();
  }

  if (style["fill"]) {
    const fillColor = d3.color(style["fill"]);
    fillColor.opacity = getFillOpacity(style);
    context.fillStyle = fillColor.toString();
    context.fill();
  }
}
