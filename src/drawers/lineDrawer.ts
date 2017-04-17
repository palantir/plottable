/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep, resolveAttributesSubsetWithStyles, styleContext } from "./canvasDrawer";
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
    const attrs = resolveAttributesSubsetWithStyles(attrToAppliedProjector, [], data[0], 0);
    context.beginPath();
    d3Line.context(context);
    d3Line(data[0]);
    context.lineJoin = "round";
    styleContext(context, attrs);
  };
}
