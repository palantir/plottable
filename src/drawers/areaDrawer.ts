/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep, renderArea, resolveAttributes } from "./canvasDrawer";
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

const AREA_FILL_ATTRS = [ "fill", "opacity", "fill-opacity" ];

export function makeAreaCanvasDrawStep(d3AreaFactory: () => d3.Area<any>): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], projector: AttributeToAppliedProjector) => {
    const attrs = resolveAttributes(projector, AREA_FILL_ATTRS, data[0], 0);
    renderArea(context, d3AreaFactory(), data[0], attrs);
  };
}
