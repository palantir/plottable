/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Animators from "../animators";
import { Accessor, Point, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";

import * as Plots from "./";
import { PlotEntity, TransformableAccessorScaleBinding, AccessorScaleBinding } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";
import { SVGPlotEntity } from "../plots";
import { IComponent } from "../components";

import { BaseSegmentPlot, ISegmentPlot } from "./baseSegmentPlot";

export class Segment<X, Y> extends XYPlot<X, Y> implements ISegmentPlot<X, Y> {
  protected _plot: BaseSegmentPlot<X, Y, SVGPlotEntity>;

  /**
   * A Segment Plot displays line segments based on the data.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("segment-plot");
    this.attr("stroke", new Scales.Color().range()[0]);
    this.attr("stroke-width", "2px");
  }

  protected _createPlot() {
    return new BaseSegmentPlot((dataset) => new Drawers.Segment(dataset), Segment.SVGEntityAdapter, this);
  }

  /**
   * Gets the AccessorScaleBinding for X2
   */
  public x2(): AccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Segment} The calling Segment Plot
   */
  public x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
    const plotX2 = this._plot.x2(x2);
    if (x2 == null) {
      return plotX2;
    }

    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  public y2(): AccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
    const plotY2 = this._plot.y2(y2);
    if (y2 == null) {
      return plotY2;
    }

    this.render();
    return this;
  }
}
