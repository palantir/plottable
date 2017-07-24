/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, IEntityBounds } from "../core/interfaces";
import {
  CanvasDrawer,
  CanvasDrawStep,
  renderPathWithStyle,
  resolveAttributes,
  resolveAttributesSubsetWithStyles,
} from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";

export class RectangleSVGDrawer extends SVGDrawer {
  constructor(private _rootClassName: string = "") {
    super("rect", "");
    this._root.classed(this._rootClassName, true);
  }
}

export const RectangleCanvasDrawStep: CanvasDrawStep = (
    context: CanvasRenderingContext2D,
    data: any[],
    attrToAppliedProjector: AttributeToAppliedProjector) => {
  context.save();
  data.forEach((datum, index) => {
    const attrs = resolveAttributesSubsetWithStyles(
      attrToAppliedProjector,
      ["x", "y", "width", "height"],
      datum,
      index,
    );
    context.beginPath();
    context.rect(attrs["x"], attrs["y"], attrs["width"], attrs["height"]);
    renderPathWithStyle(context, attrs);
  });
  context.restore();
};

export class RectangleCanvasDrawer extends CanvasDrawer {
  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx, RectangleCanvasDrawStep);
  }

  public getClientRectAtIndex(index: number): IEntityBounds {
    const datum = this._lastDrawnData[index];
    const attrs = resolveAttributes(
      this._lastProjector,
      ["x", "y", "width", "height"],
      datum,
      index,
    );
    return attrs as IEntityBounds;
  }
}
