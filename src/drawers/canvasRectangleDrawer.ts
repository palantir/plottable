/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";

import { CanvasDrawer } from "./canvasDrawer";
import * as Drawers from "./";

export class RectangleDrawer extends CanvasDrawer {

  constructor(dataset: Dataset) {
    super(dataset);
  }

  protected _drawStep(step: Drawers.AppliedDrawStep) {
    super._drawStep(step);
    const context = this._renderArea.getContext("2d");
    if (step.attrToAppliedProjector["fillRect"] == null) {
      throw new Error("fillRect needs to be supplied in order for drawing to occur");
    }
    this._dataset.data().forEach((datum, index) => {
      const fill = step.attrToAppliedProjector["fill"](datum, index);
      context.fillStyle = fill;
      const { x, y, width, height } = step.attrToAppliedProjector["fillRect"](datum, index);
      context.fillRect(x, y, width, height);
    });
  }
}
