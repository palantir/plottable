/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep, renderLine, resolveAttributes } from "./canvasDrawer";
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

const LINE_ATTRIBUTES =  [
  "opacity",
  "stroke-opacity",
  "stroke-width",
  "stroke",
  "stroke-dasharray",
];

/**
 * @param d3LineFactory A callback that gives this Line Drawer a d3.Line object which will be
 * used to draw with.
 *
 * TODO put the d3.Line into the attrToAppliedProjector directly
 */
export function makeLineCanvasDrawStep(d3LineFactory: () => d3.Line<any>): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
    const lineStyle = resolveAttributes(attrToAppliedProjector, LINE_ATTRIBUTES, data[0], 0);
    renderLine(context, d3LineFactory(), data[0], lineStyle);
  };
}
