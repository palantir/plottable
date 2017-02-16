/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Accessor, AttributeToProjector, Projector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import { QuantitativeScale } from "../scales/quantitativeScale";
import * as Utils from "../utils";

import { SVGPlotEntity } from "../plots";
import { IComponent } from "../components";

import * as Plots from "./";
import { Line } from "./linePlot";
import { Plot } from "./plot";
import { BaseAreaPlot, IAreaPlot } from "./baseAreaPlot";

export class Area<X> extends Line<X> implements IAreaPlot<X> {
  protected _plot: BaseAreaPlot<X, SVGPlotEntity>;

  /**
   * An Area Plot draws a filled region (area) between Y and Y0.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("area-plot");
    this.y0(0); // default
    this.attr("fill-opacity", 0.25);
    this.attr("fill", new Scales.Color().range()[0]);
  }

  /**
   * Gets the AccessorScaleBinding for Y0.
   */
  public y0(): Plots.AccessorScaleBinding<number, number>;
  /**
   * Sets Y0 to a constant number or the result of an Accessor<number>.
   * If a Scale has been set for Y, it will also be used to scale Y0.
   *
   * @param {number|Accessor<number>} y0
   * @returns {Area} The calling Area Plot.
   */
  public y0(y0: number | Accessor<number>): this;
  public y0(y0?: number | Accessor<number>): any {
    const plotY0 = this._plot.y0(y0);
    if (y0 == null) {
      return plotY0;
    }

    this.render();
    return this;
  }

  public selections(datasets = this.datasets()) {
    let allSelections = super.selections(datasets)[0];

    let lineDrawers = datasets.map((dataset) => this._plot.lineDrawer(dataset))
      .filter((drawer) => drawer != null);

    lineDrawers.forEach((ld, i) => allSelections.push((ld as Drawers.Area).selectionForIndex(i).node()));
    return d3.selectAll(allSelections);
  }

  protected _createPlot() {
    return new BaseAreaPlot((dataset) => new Drawers.Area(dataset),
      (dataset) => new Drawers.Line(dataset),
      Area.SVGEntityAdapter,
      this
    );
  }
}
