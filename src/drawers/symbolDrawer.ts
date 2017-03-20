/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as d3Shape from "d3-shape";

import { Dataset } from "../core/dataset";
import { Accessor } from "../core/interfaces";

import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Symbol extends Drawer {
  private _d3SymbolFactory: () => Accessor<d3Shape.Symbol<any, any>>;

  /**
   * @param dataset
   * @param _d3SymbolFactory A callback that gives this Symbol Drawer a d3.Symbol object which will be
   * used to draw with.
   */
  constructor(dataset: Dataset, d3SymbolFactory: () => Accessor<d3Shape.Symbol<any, any>>) {
    super(dataset);
    this._d3SymbolFactory = d3SymbolFactory;
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
    const d3Symbol = this._d3SymbolFactory();

    const attrToAppliedProjector = step.attrToAppliedProjector;
    data.forEach((datum, index) => {
      const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
        obj[attrName] = attrToAppliedProjector[attrName](datum, index);
        return obj;
      }, {} as { [key: string]: any | number | string });

      context.save();

      const { x, y } = resolvedAttrs["transform"];
      context.translate(x, y);

      context.beginPath();
      d3Symbol(datum, index, this._dataset).context(context)(datum);
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
