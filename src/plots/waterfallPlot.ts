/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Accessor, Point, Bounds, Range, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { Drawer } from "../drawers/drawer";
import * as Drawers from "../drawers";
import * as Utils from "../utils";

import { IComponent } from "../components";
import * as Plots from "./";
import { Bar } from "./barPlot";
import { SVGPlotEntity } from "../plots";
import { Plot } from "./plot";

import { BaseWaterfallPlot, IWaterfallPlot } from "./baseWaterfallPlot";

export class Waterfall<X, Y> extends Bar<X, number>  implements IWaterfallPlot<X, number> {
  protected _plot: BaseWaterfallPlot<X, number, SVGPlotEntity>;

  private static _CONNECTOR_CLASS = "connector";
  private static _CONNECTOR_AREA_CLASS = "connector-area";
  private static _TOTAL_KEY = "total";
  private _connectorArea: d3.Selection<void>;
  private _connectorsEnabled = false;

  constructor() {
    super();
    this.addClass("waterfall-plot");
    this._plot.onAdditionalPaint((time, attrToProjector) => this._additionalPaint(time, attrToProjector));
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
    const plotTotal = this._plot.total(total);

    if (total == null) {
      return plotTotal;
    }

    return this;
  }

  protected _createPlot() {
    return new BaseWaterfallPlot((dataset) => new Drawers.Rectangle(dataset), Waterfall.SVGEntityAdapter, this);
  }

  protected _setup() {
    super._setup();
    this._connectorArea = this._renderArea.append("g").classed(Waterfall._CONNECTOR_AREA_CLASS, true);
  }

  private _additionalPaint(time: number, attrToProjector: AttributeToProjector) {
    this._connectorArea.selectAll("line").remove();
    if (this._connectorsEnabled) {
      Utils.Window.setTimeout(() => this._drawConnectors(attrToProjector), time);
    }
  }

  private _drawConnectors(attrToProjector: AttributeToProjector) {
    let dataset = this.datasets()[0];
    for (let datumIndex = 1; datumIndex < dataset.data().length; datumIndex++) {
      let prevIndex = datumIndex - 1;
      let datum = dataset.data()[datumIndex];
      let prevDatum = dataset.data()[prevIndex];
      let x = attrToProjector["x"](prevDatum, prevIndex, dataset);
      let x2 = attrToProjector["x"](datum, datumIndex, dataset) + attrToProjector["width"](datum, datumIndex, dataset);
      let y = attrToProjector["y"](datum, datumIndex, dataset);
      if ((this._plot.subtotals()[datumIndex] > 0 && this._plot.subtotals()[datumIndex] > this._plot.subtotals()[prevIndex]) ||
        (this._plot.subtotals()[datumIndex] < 0 && this._plot.subtotals()[datumIndex] >= this._plot.subtotals()[prevIndex])) {
        y = attrToProjector["y"](datum, datumIndex, dataset) + attrToProjector["height"](datum, datumIndex, dataset);
      }
      this._connectorArea.append("line").classed(Waterfall._CONNECTOR_CLASS, true)
        .attr("x1", x).attr("x2", x2).attr("y1", y).attr("y2", y);
    }
  }

  protected _onDatasetUpdate() {
    this._plot.updateSubtotals();
  }
}
