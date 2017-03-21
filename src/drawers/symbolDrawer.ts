/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as d3Shape from "d3-shape";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Symbol extends Drawer {
  // Filter to used attributes for performance.
  private FILTERED_ATTRIBUTES = ["x", "y", "fill", "opacity"];
  private _d3SymbolGenerator: () => (datum: any, index: number, dataset: Dataset) => d3Shape.Symbol<any, any>;

  /**
   * @param dataset
   * @param _d3SymbolFactory A callback that gives this Symbol Drawer a d3.Symbol object which will be
   * used to draw with.
   */
  constructor(
      dataset: Dataset,
      d3SymbolGenerator: () => (datum: any, index: number, dataset: Dataset) => d3Shape.Symbol<any, any>) {
    super(dataset);
    this._d3SymbolGenerator = d3SymbolGenerator;
    this._svgElementName = "path";
    this._className = "symbol";
  }

  /**
   * @param data Data to draw. The data will be passed through the symbol factory in order to get applied
   * onto the canvas.
   * @param step
   * @private
   */
  protected _drawStepCanvas(data: any[], step: AppliedDrawStep) {
    const context = this.canvas().node().getContext("2d");
    const d3Symbol = this._d3SymbolGenerator();

    const attrToAppliedProjector = step.attrToAppliedProjector;
    data.forEach((datum, index) => {
      const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
        if (this.FILTERED_ATTRIBUTES.indexOf(attrName) !== -1) {
          obj[attrName] = attrToAppliedProjector[attrName](datum, index);
        }
        return obj;
      }, {} as { [key: string]: any | number | string });

      context.save();

      const x = resolvedAttrs["x"];
      const y = resolvedAttrs["y"];
      context.translate(x, y);

      context.beginPath();
      d3Symbol(datum, index, this._dataset).context(context)(null);
      context.closePath();

      if (resolvedAttrs["fill"]) {
        const fillColor = d3.color(resolvedAttrs["fill"]);
        if (resolvedAttrs["opacity"]) {
          fillColor.opacity = resolvedAttrs["opacity"];
        }
        context.fillStyle = fillColor.rgb().toString();
      }

      context.fill();

      context.restore();
    });
  }
}
