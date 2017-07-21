/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep, resolveAttributes, styleContext } from "./canvasDrawer";
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

export function makeAreaCanvasDrawStep(
    d3AreaFactory: () => d3.Area<any>,
    d3LineFactory: () => d3.Line<any>,
): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
    const areaStyle = resolveAttributes(attrToAppliedProjector, ["fill", "opacity", "stroke-width"], data[0], 0);
    const opacity = areaStyle["opacity"] ? areaStyle["opacity"] : 1;
    const d3Area = d3AreaFactory();
    context.save();
    context.beginPath();
    d3Area.context(context);
    d3Area(data[0]);
    context.lineJoin = "round";
    areaStyle["opacity"] = opacity * 0.25;
    styleContext(context, areaStyle);
    context.restore();

    const d3Line = d3LineFactory();
    context.save();
    context.beginPath();
    d3Line.context(context);
    d3Line(data[0]);
    context.lineJoin = "round";
    areaStyle["stroke"] = areaStyle["fill"];
    delete areaStyle["fill"];
    areaStyle["opacity"] = opacity * 0.8;
    styleContext(context, areaStyle);
    context.restore();
  };
}
