/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { XYCanvasPlot } from "./xyCanvasPlot";
import * as Animators from "../animators";
import { Accessor, Point, Bounds, Range, AttributeToProjector, Projector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import { RectangleDrawer } from "../drawers/canvasRectangleDrawer";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import { IComponent } from "../components";

import * as Plots from "./";
import { PlotEntity } from "./";
import { CanvasPlot } from "./canvasPlot";
import { XYPlot } from "./xyPlot";
import { BaseRectanglePlot, IRectanglePlot } from "./baseRectanglePlot";

export class CanvasRectangle<X, Y> extends XYCanvasPlot<X, Y> implements IRectanglePlot<X, Y> {
  private _labelsEnabled = false;
  private _label: Accessor<string> = null;

  protected _plot: BaseRectanglePlot<X, Y, PlotEntity>;

  /**
   * A Rectangle Plot displays rectangles based on the data.
   * The left and right edges of each rectangle can be set with x() and x2().
   *   If only x() is set the Rectangle Plot will attempt to compute the correct left and right edge positions.
   * The top and bottom edges of each rectangle can be set with y() and y2().
   *   If only y() is set the Rectangle Plot will attempt to compute the correct top and bottom edge positions.
   *
   * @constructor
   * @param {Scale.Scale} xScale
   * @param {Scale.Scale} yScale
   */
  constructor() {
    super();
    this.animator("rectangles", new Animators.Null());
    this.addClass("rectangle-plot");
  }

  public drawLabels() {
    // no labels yet
  }

  /**
   * Gets the AccessorScaleBinding for X2.
   */
  public x2(): Plots.TransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|X|Accessor<X>} x2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
    const x2Return = this._plot.x2(x2);
    if (x2 == null) {
      return x2Return;
    }

    this.render();
    return this;
  }


  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  public y2(): Plots.TransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
    const y2Return = this._plot.y2(y2);
    if (y2 == null) {
      return y2Return;
    }
    this.render();
    return this;
  }

  protected _createPlot() {
    return new BaseRectanglePlot((dataset) => new RectangleDrawer(dataset), CanvasRectangle.EntityAdapter, this);
  }
}