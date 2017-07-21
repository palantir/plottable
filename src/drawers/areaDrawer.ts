/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep, resolveAttributes, styleContext } from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";

const DEFAULT_AREA_FILL_OPACITY = 0.25;
const DEFAULT_AREA_STROKE_OPACITY = 0.80;

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

export function makeAreaCanvasDrawStep(
    d3AreaFactory: () => d3.Area<any>,
    d3LineFactory: () => d3.Line<any>,
): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
    const style = resolveAttributes(attrToAppliedProjector, [
      "fill",
      "opacity",
      "stroke-width",
      "fill-opacity",
      "stroke-opacity",
    ], data[0], 0);
    const baseOpacity = style["opacity"] != null ? style["opacity"] : 1;
    const fillOpacity = style["fill-opacity"] != null ? style["fill-opacity"] : DEFAULT_AREA_FILL_OPACITY;
    const strokeOpacity = style["stroke-opacity"] != null ? style["stroke-opacity"] : DEFAULT_AREA_STROKE_OPACITY;

    const d3Area = d3AreaFactory();
    context.save();
    context.beginPath();
    d3Area.context(context);
    d3Area(data[0]);
    context.lineJoin = "round";
    style["opacity"] = baseOpacity * fillOpacity;
    styleContext(context, style);
    context.restore();

    const d3Line = d3LineFactory();
    context.save();
    context.beginPath();
    d3Line.context(context);
    d3Line(data[0]);
    context.lineJoin = "round";
    style["stroke"] = style["fill"];
    delete style["fill"];
    style["opacity"] = baseOpacity * strokeOpacity;
    styleContext(context, style);
    context.restore();
  };
}
