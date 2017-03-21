/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Rectangle extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._svgElementName = "rect";
  }

  protected _drawStepCanvas(data: any[], step: AppliedDrawStep) {
    const context = this.canvas().node().getContext("2d");

    context.save();

    const attrToAppliedProjector = step.attrToAppliedProjector;
    const attrs = Object.keys(Drawer._CANVAS_CONTEXT_ATTRIBUTES).concat(["x", "y", "width", "height"]);
    data.forEach((point, index) => {
      const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
        // only set if needed for performance
        if (attrs.indexOf(attrName) !== -1) {
          obj[attrName] = attrToAppliedProjector[attrName](point, index);
        }
        return obj;
      }, {} as { [key: string]: any });

      context.beginPath();
      context.rect(resolvedAttrs["x"], resolvedAttrs["y"], resolvedAttrs["width"], resolvedAttrs["height"]);
      this._setCanvasContextStyles(resolvedAttrs);
    });
    context.restore();
  }
}
