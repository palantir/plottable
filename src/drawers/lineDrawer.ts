/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep } from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";

export class LineSVGDrawer extends SVGDrawer {
  constructor() {
    super("path", "line");
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    selection.style("fill", "none");
  }

  public getVisualPrimitiveAtIndex(index: number) {
    return super.getVisualPrimitiveAtIndex(0);
  }
}

/**
 * @param d3LineFactory A callback that gives this Line Drawer a d3.Line object which will be
 * used to draw with.
 *
 * TODO put the d3.Line into the attrToAppliedProjector directly
 */
export function makeLineCanvasDrawStep(d3LineFactory: () => d3.Line<any>): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
    const d3Line = d3LineFactory();
    const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
      if (attrName !== "d") {
        obj[attrName] = attrToAppliedProjector[attrName](data[0], 0);
      }
      return obj;
    }, {} as { [key: string]: any });

    context.beginPath();
    d3Line.context(context);

    d3Line(data[0]);

    if (resolvedAttrs["stroke-width"]) {
      context.lineWidth = parseFloat(resolvedAttrs["stroke-width"]);
    }

    if (resolvedAttrs["stroke"]) {
      const strokeColor = d3.color(resolvedAttrs["stroke"]);
      if (resolvedAttrs["opacity"]) {
        strokeColor.opacity = resolvedAttrs["opacity"];
      }
      context.strokeStyle = strokeColor.rgb().toString();
      context.stroke();
    }
  };
}
