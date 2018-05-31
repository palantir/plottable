/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector } from "../core/interfaces";
import {
  CanvasDrawer,
  CanvasDrawStep,
  renderPathWithStyle,
  resolveAttributesSubsetWithStyles,
} from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";

export class RectangleSVGDrawer extends SVGDrawer {
  constructor(private _rootClassName: string = "") {
    super("rect", "");
    this._root.classed(this._rootClassName, true);
  }
}

const RECT_ATTRS = ["x", "y", "width", "height"];

export const RectangleCanvasDrawStep: CanvasDrawStep = (
    context: CanvasRenderingContext2D,
    data: any[],
    projector: AttributeToAppliedProjector) => {
  context.save();
  const dataLen = data.length;
  for (let index = 0; index < dataLen; index++ ) {
    const datum = data[index];
    if (datum == null) {
      continue;
    }
    const attrs = resolveAttributesSubsetWithStyles(projector, RECT_ATTRS, datum, index);
    context.beginPath();
    context.rect(attrs["x"], attrs["y"], attrs["width"], attrs["height"]);
    renderPathWithStyle(context, attrs);
  }
  context.restore();
};

export class RectangleCanvasDrawer extends CanvasDrawer {
  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx, RectangleCanvasDrawStep);
  }
}
