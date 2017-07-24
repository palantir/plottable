/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import * as Utils from "../utils";
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

const DEFAULT_AREA_FILL_STYLE = {
  opacity: 1,
  "fill-opacity": 0.25,
};

const DEFAULT_AREA_STROKE_STYLE = {
  opacity: 1,
  "stroke-opacity": 0.80,
};

export function makeAreaCanvasDrawStep(
    d3AreaFactory: () => d3.Area<any>,
    d3LineFactory: () => d3.Line<any>,
): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
    let fillStyle = resolveAttributes(attrToAppliedProjector, [
      "fill",
      "opacity",
      "fill-opacity",
    ], data[0], 0);
    fillStyle = Utils.Object.assign({}, DEFAULT_AREA_FILL_STYLE, fillStyle);
    renderArea(context, d3AreaFactory(), data[0], fillStyle);

    let strokeStyle = resolveAttributes(attrToAppliedProjector, [
      "opacity",
      "stroke-opacity",
    ], data[0], 0);
    strokeStyle["stroke"] = fillStyle["fill"];
    strokeStyle = Utils.Object.assign({}, DEFAULT_AREA_STROKE_STYLE, strokeStyle);
    renderLine(context, d3LineFactory(), data[0], strokeStyle);
  };
}
