/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { AttributeToAppliedProjector } from "../core/interfaces";
import { CanvasDrawStep, resolveAttributesSubsetWithStyles, styleContext } from "./canvasDrawer";
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
    styleContext(context, attrs);
  });
  context.restore();
};
