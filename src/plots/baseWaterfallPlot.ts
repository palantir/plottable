/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { BaseBarPlot, IBarPlot } from "./baseBarPlot";

import { Dataset } from "../core/dataset";
import { Accessor, Point, Bounds, Range, AttributeToProjector } from "../core/interfaces";
import * as Plots from "../plots";

export interface IWaterfallPlot<X, Y> extends IBarPlot<X, Y> {
  /**
   * Gets the AccessorScaleBinding for whether a bar represents a total or a delta.
   */
  total<T>(): Plots.AccessorScaleBinding<T, boolean>;
  /**
   * Sets total to a constant number or the result of an Accessor
   *
   * @param {Accessor<boolean>}
   * @returns {Plots.Waterfall} The calling Waterfall Plot.
   */
  total(total: Accessor<boolean>): this;
  total(total?: Accessor<boolean>): any
}

export class BaseWaterfallPlot<X, Y> extends BaseBarPlot<X, Y> implements IWaterfallPlot<X, Y> {
  private static _TOTAL_KEY = "total";
  private static _BAR_DECLINE_CLASS = "waterfall-decline";
  private static _BAR_GROWTH_CLASS = "waterfall-growth";
  private static _BAR_TOTAL_CLASS = "waterfall-total";

  private _additionalPaintCallback: (time: number, attrToProjector: AttributeToProjector) => void;
  private _extent: number[] = [];
  private _subtotals: number[] = [];

  public onAdditionalPaint(_additionalPaintCallback: (time: number, attrToProjector: AttributeToProjector) => void) {
    this._additionalPaintCallback = _additionalPaintCallback;
  }

  public subtotals() {
    return this._subtotals;
  }

  public total<T>(): Plots.AccessorScaleBinding<T, boolean>;
  public total(total: Accessor<boolean>): this;
  public total(total?: Accessor<boolean>): any {
    if (total == null) {
      return this._propertyBindings.get(BaseWaterfallPlot._TOTAL_KEY);
    }
    this._bindProperty(BaseWaterfallPlot._TOTAL_KEY, total, null);
    return this;
  }

  public updateSubtotals() {
    let datasets = this.datasets();
    if (datasets.length > 0) {
      let dataset = datasets[datasets.length - 1];
      this._subtotals = new Array();
      this._calculateSubtotalsAndExtent(dataset);
    }
  }

  protected _additionalPaint(time: number) {
    this._additionalPaintCallback(time, this._generateAttrToProjector());
  }

  protected _extentsForProperty(attr: string) {
    let primaryAttr = "y";

    if (attr === primaryAttr) {
      return this._extent == null ? [] : [this._extent];
    } else {
      return super._extentsForProperty(attr);
    }
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();

    let yScale = this.y().scale;
    let totalAccessor = BaseWaterfallPlot._scaledAccessor(this.total());

    let yAttr = this.attr("y");
    if (yAttr == null) {
      attrToProjector["y"] = (d, i, dataset) => {
        let currentValue = this.y().accessor(d, i, dataset);
        let isTotal = totalAccessor(d, i, dataset);
        if (isTotal) {
          return Math.min(yScale.scale(currentValue), yScale.scale(0));
        } else {
          let currentSubtotal = this._subtotals[i];
          if (i === 0) {
            if (currentValue < 0) {
              return yScale.scale(currentSubtotal - currentValue);
            } else {
              return yScale.scale(currentSubtotal);
            }
          }
          let priorSubtotal = this._subtotals[i - 1];
          if (currentSubtotal > priorSubtotal) {
            return yScale.scale(currentSubtotal);
          } else {
            return yScale.scale(priorSubtotal);
          }
        }
      };
    }

    let heightAttr = this.attr("height");
    if (heightAttr == null) {
      attrToProjector["height"] = (d, i, dataset) => {
        let isTotal = totalAccessor(d, i, dataset);
        let currentValue = this.y().accessor(d, i, dataset);
        if (isTotal) {
          return Math.abs(yScale.scale(currentValue) - yScale.scale(0));
        } else {
          let currentSubtotal = this._subtotals[i];
          if (i === 0) {
            return Math.abs(yScale.scale(currentSubtotal) - yScale.scale(currentSubtotal - currentValue));
          } else {
            let priorSubtotal = this._subtotals[i - 1];
            return Math.abs(yScale.scale(currentSubtotal) - yScale.scale(priorSubtotal));
          }
        }
      };
    }

    attrToProjector["class"] = (d, i, dataset) => {
      let baseClass = "";
      if (this.attr("class") != null) {
        baseClass = this.attr("class").accessor(d, i, dataset) + " ";
      }
      let isTotal = totalAccessor(d, i, dataset);
      if (isTotal) {
        return baseClass + BaseWaterfallPlot._BAR_TOTAL_CLASS;
      } else {
        let delta = this.y().accessor(d, i, dataset);
        return baseClass + (delta > 0 ? BaseWaterfallPlot._BAR_GROWTH_CLASS : BaseWaterfallPlot._BAR_DECLINE_CLASS);
      }
    };

    return attrToProjector;
  }

  private _calculateSubtotalsAndExtent(dataset: Dataset) {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let total = 0;
    let hasStarted = false;
    dataset.data().forEach((datum, index) => {
      let currentValue = this.y().accessor(datum, index, dataset);
      let isTotal = this.total().accessor(datum, index, dataset);
      if (!isTotal || index === 0) {
        total += currentValue;
      }
      this._subtotals.push(total);
      if (total < min) {
        min = total;
      }
      if (total > max) {
        max = total;
      }
      if (isTotal) {
        if (currentValue < min) {
          min = currentValue;
        }
        if (currentValue > max) {
          max = currentValue;
        }
      }
      if (!hasStarted && isTotal) {
        let startTotal = currentValue - total;
        for (let i = 0; i < this._subtotals.length; i++) {
          this._subtotals[i] += startTotal;
        }
        hasStarted = true;
        total += startTotal;
        min += startTotal;
        max += startTotal;
      }
    });
    this._extent = [min, max];
  }


}