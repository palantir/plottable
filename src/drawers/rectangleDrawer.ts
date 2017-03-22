/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { AttributeToAppliedProjector } from "../core/interfaces";
import { CanvasDrawStep } from "./canvasDrawer";
import { AppliedDrawStep } from "./index";
import { SVGDrawer } from "./svgDrawer";

export class RectangleSVGDrawer extends SVGDrawer {
  constructor(private _rootGClassName: string = null) {
    super("rect", "");
  }

  public draw(root: d3.Selection<SVGElement, any, any, any>, data: any[], appliedDrawSteps: AppliedDrawStep[]) {
    if (this._rootGClassName != null) {
      root.classed(this._rootGClassName, true);
    }
    super.draw(root, data, appliedDrawSteps);
  }
}

export const RectangleCanvasDrawStep: CanvasDrawStep = (
  context: CanvasRenderingContext2D,
  data: any[],
  attrToAppliedProjector: AttributeToAppliedProjector) => {
  data.forEach((point, index) => {
    const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
      obj[attrName] = attrToAppliedProjector[attrName](point, index);
      return obj;
    }, {} as { [key: string]: any | number | string });

    context.beginPath();
    context.rect(resolvedAttrs["x"], resolvedAttrs["y"], resolvedAttrs["width"], resolvedAttrs["height"]);
    if (resolvedAttrs["stroke-width"]) {
      context.lineWidth = resolvedAttrs["stroke-width"];
    }
    if (resolvedAttrs["stroke"]) {
      const strokeColor = d3.color(resolvedAttrs["stroke"]);
      if (resolvedAttrs["opacity"]) {
        strokeColor.opacity = resolvedAttrs["opacity"];
      }
      context.strokeStyle = strokeColor.rgb().toString();
      context.stroke();
    }
    if (resolvedAttrs["fill"]) {
      const fillColor = d3.color(resolvedAttrs["fill"]);
      if (resolvedAttrs["opacity"]) {
        fillColor.opacity = resolvedAttrs["opacity"];
      }
      context.fillStyle = fillColor.rgb().toString();
      context.fill();
    }
  });
};
