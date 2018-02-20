/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep, renderArea, renderLine, resolveAttributes } from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";

export class AreaSVGDrawer extends SVGDrawer {
  constructor() {
    super("path", "area");
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    selection.style("stroke", "none");
  }

  public getVisualPrimitiveAtIndex(index: number) {
    // areas are represented by one single element; always get that element
    // regardless of the data index.
    return super.getVisualPrimitiveAtIndex(0);
  }
}

const AREA_FILL_ATTRS = [ "opacity", "fill", "fill-opacity" ];
const AREA_STROKE_ATTRS = ["opacity", "stroke", "stroke-width"];

export function makeAreaCanvasDrawStep(
  d3AreaFactory: () => d3.Area<any>,
  d3LineFactory: () => d3.Line<any>,
): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], projector: AttributeToAppliedProjector) => {
    const fillAttrs = resolveAttributes(projector, AREA_FILL_ATTRS, data[0], 0);
    renderArea(context, d3AreaFactory(), data[0], fillAttrs);
    const strokeAttrs = resolveAttributes(projector, AREA_STROKE_ATTRS, data[0], 0);
    renderLine(context, d3LineFactory(), data[0], strokeAttrs);
  };
}
