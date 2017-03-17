/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";

import { SimpleSelection } from "../core/interfaces";
import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Line extends Drawer {
  private _d3LineFactory: () => d3.Line<any>;

  /**
   * @param dataset
   * @param _d3LineFactory A callback that gives this Line Drawer a d3.Line object which will be
   * used to draw with.
   */
  constructor(dataset: Dataset, d3LineFactory: () => d3.Line<any>) {
    super(dataset);
    this._d3LineFactory = d3LineFactory;
    this._className = "line";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("fill", "none");
  }

  public selectionForIndex(index: number): SimpleSelection<any> {
    return d3.select(this.selection().node());
  }

  /**
   * @param data Data to draw. The data will be passed through the line factory in order to get applied
   * onto the canvas.
   * @param step
   * @private
   */
  protected _drawStepCanvas(data: any[][], step: AppliedDrawStep) {
    const context = this.canvas().node().getContext("2d");

    const d3Line = this._d3LineFactory();

    const attrToAppliedProjector = step.attrToAppliedProjector;
    const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
      obj[attrName] = attrToAppliedProjector[attrName](data, 0);
      return obj;
    }, {} as { [key: string]: any | number | string });

    context.save();
    context.beginPath();

    d3Line.context(context);
    d3Line(data[0]);

    if (resolvedAttrs["stroke-width"]) {
      context.lineWidth = parseFloat(resolvedAttrs["stroke-width"]);
    }

    if (resolvedAttrs["stroke"]) {
      const strokeColor = d3.color(resolvedAttrs["stroke"]);
      if (resolvedAttrs["opacity"]) {
        strokeColor.opacity = resolvedAttrs["opacity"];
      }
      context.strokeStyle = strokeColor.rgb().toString();
      context.stroke();
    }

    context.restore();
  }
}
