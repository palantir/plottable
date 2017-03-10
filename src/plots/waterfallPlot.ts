/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { Accessor, AttributeToProjector, Bounds, Point, Range, SimpleSelection } from "../core/interfaces";
import { Drawer } from "../drawers/drawer";
import * as Utils from "../utils";

import * as Plots from "./";
import { Bar } from "./barPlot";
import { Plot } from "./plot";

export class Waterfall<X, Y> extends Bar<X, number> {
  private static _BAR_DECLINE_CLASS = "waterfall-decline";
  private static _BAR_GROWTH_CLASS = "waterfall-growth";
  private static _BAR_TOTAL_CLASS = "waterfall-total";
  private static _CONNECTOR_CLASS = "connector";
  private static _CONNECTOR_AREA_CLASS = "connector-area";
  private static _TOTAL_KEY = "total";
  private _connectorArea: SimpleSelection<void>;
  private _connectorsEnabled = false;
  private _extent: number[];
  private _subtotals: number[];

  constructor() {
    super();
    this.addClass("waterfall-plot");
  }

  /**
   * Gets whether connectors are enabled.
   *
   * @returns {boolean} Whether connectors should be shown or not.
   */
  public connectorsEnabled(): boolean;
  /**
   * Sets whether connectors are enabled.
   *
   * @param {boolean} enabled
   * @returns {Plots.Waterfall} The calling Waterfall Plot.
   */
  public connectorsEnabled(enabled: boolean): this;
  public connectorsEnabled(enabled?: boolean): any {
    if (enabled == null) {
      return this._connectorsEnabled;
    }
    this._connectorsEnabled = enabled;
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for whether a bar represents a total or a delta.
   */
  public total<T>(): Plots.AccessorScaleBinding<T, boolean>;
  /**
   * Sets total to a constant number or the result of an Accessor
   *
   * @param {Accessor<boolean>}
   * @returns {Plots.Waterfall} The calling Waterfall Plot.
   */
  public total(total: Accessor<boolean>): this;
  public total(total?: Accessor<boolean>): any {
    if (total == null) {
      return this._propertyBindings.get(Waterfall._TOTAL_KEY);
    }
    this._bindProperty(Waterfall._TOTAL_KEY, total, null);
    return this;
  }

  protected _additionalPaint(time: number) {
    this._connectorArea.selectAll("line").remove();
    if (this._connectorsEnabled) {
      Utils.Window.setTimeout(() => this._drawConnectors(), time);
    }
  }

  protected _createNodesForDataset(dataset: Dataset): Drawer {
    let drawer = super._createNodesForDataset(dataset);
    this._connectorArea = this._renderArea.append("g").classed(Waterfall._CONNECTOR_AREA_CLASS, true);
    return drawer;
  }

  protected _extentsForProperty(attr: string) {
    let primaryAttr = "y";
    if (attr === primaryAttr) {
      return [this._extent];
    } else {
      return super._extentsForProperty(attr);
    }
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();

    let yScale = this.y().scale;
    let totalAccessor = Plot._scaledAccessor(this.total());

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
        return baseClass + Waterfall._BAR_TOTAL_CLASS;
      } else {
        let delta = this.y().accessor(d, i, dataset);
        return baseClass + (delta > 0 ? Waterfall._BAR_GROWTH_CLASS : Waterfall._BAR_DECLINE_CLASS);
      }
    };

    return attrToProjector;
  }

  protected _onDatasetUpdate() {
    this._updateSubtotals();
    super._onDatasetUpdate();
    return this;
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

  private _drawConnectors() {
    let attrToProjector = this._generateAttrToProjector();
    let dataset = this.datasets()[0];
    for (let datumIndex = 1; datumIndex < dataset.data().length; datumIndex++) {
      let prevIndex = datumIndex - 1;
      let datum = dataset.data()[datumIndex];
      let prevDatum = dataset.data()[prevIndex];
      let x = attrToProjector["x"](prevDatum, prevIndex, dataset);
      let x2 = attrToProjector["x"](datum, datumIndex, dataset) + attrToProjector["width"](datum, datumIndex, dataset);
      let y = attrToProjector["y"](datum, datumIndex, dataset);
      if ((this._subtotals[datumIndex] > 0 && this._subtotals[datumIndex] > this._subtotals[prevIndex]) ||
        (this._subtotals[datumIndex] < 0 && this._subtotals[datumIndex] >= this._subtotals[prevIndex])) {
        y = attrToProjector["y"](datum, datumIndex, dataset) + attrToProjector["height"](datum, datumIndex, dataset);
      }
      this._connectorArea.append("line").classed(Waterfall._CONNECTOR_CLASS, true)
        .attr("x1", x).attr("x2", x2).attr("y1", y).attr("y2", y);
    }
  }

  private _updateSubtotals() {
    let datasets = this.datasets();
    if (datasets.length > 0) {
      let dataset = datasets[datasets.length - 1];
      this._subtotals = new Array();
      this._calculateSubtotalsAndExtent(dataset);
    }
  }
}
