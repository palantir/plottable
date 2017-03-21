/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3Shape from "d3-shape";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Symbol extends Drawer {
  private _d3SymbolGeneratorFactory: () => (datum: any, index: number, dataset: Dataset) => d3Shape.Symbol<any, any>;

  /**
   * @param dataset
   * @param _d3SymbolGeneratorFactory A callback that gives this Symbol Drawer a d3.Symbol object which will be
   * used to draw with.
   */
  constructor(
      dataset: Dataset,
      d3SymbolGeneratorFactory: () => (datum: any, index: number, dataset: Dataset) => d3Shape.Symbol<any, any>) {
    super(dataset);
    this._d3SymbolGeneratorFactory = d3SymbolGeneratorFactory;
    this._svgElementName = "path";
    this._className = "symbol";
  }

  /**
   * @param data Data to draw. The data will be passed through the symbol generator to set the type and size
   * in order to get applied onto the canvas.
   * @param step
   * @private
   */
  protected _drawStepCanvas(data: any[], step: AppliedDrawStep) {
    const context = this.canvas().node().getContext("2d");
    const d3Symbol = this._d3SymbolGeneratorFactory();

    const attrToAppliedProjector = step.attrToAppliedProjector;
    const attrs = Object.keys(Drawer._CANVAS_CONTEXT_ATTRIBUTES).concat(["x", "y"]);
    data.forEach((datum, index) => {
      const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
        // only set if needed, for performance
        if (attrs.indexOf(attrName) !== -1) {
          obj[attrName] = attrToAppliedProjector[attrName](datum, index);
        }
        return obj;
      }, {} as { [key: string]: any });

      context.save();
      context.translate(resolvedAttrs["x"], resolvedAttrs["y"]);

      context.beginPath();
      d3Symbol(datum, index, this._dataset).context(context)(null);
      context.closePath();

      this._setCanvasContextStyles(resolvedAttrs);

      context.restore();
    });
  }
}
