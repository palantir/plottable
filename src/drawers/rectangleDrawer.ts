/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";
import { Drawer } from "./drawer";
import { CanvasDrawerContext, IDrawerContext, SvgDrawerContext } from "./contexts";
import { AppliedDrawStep } from "./index";

export class RectangleSvg extends SvgDrawerContext {
    protected _svgElementName = "rect";
}

export class RectangleCanvas extends CanvasDrawerContext {
  public drawStep(data: any[], step: AppliedDrawStep) {
    const context = this._canvas.node().getContext("2d");

    const attrToAppliedProjector = step.attrToAppliedProjector;
    context.save();

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
    context.restore();
  }
}

export class Rectangle extends Drawer {
  protected _svgContextType = RectangleSvg;
  protected _canvasContextType = RectangleCanvas;
}
