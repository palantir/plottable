/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Plots from "./";
import { BaseXYPlot, IXYPlot } from "./baseXYPlot";

import { Dataset } from "../core/dataset";
import { Accessor, Point } from "../core/interfaces";
import { CanvasDrawer } from "../drawers/canvasDrawer";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { CanvasPlot } from "./canvasPlot";
import { TransformableAccessorScaleBinding, LightweightPlotEntity, PlotEntity } from "./commons";

export class XYCanvasPlot<X, Y> extends CanvasPlot implements IXYPlot<X, Y> {
  protected _plot: BaseXYPlot<X, Y>;

  public autorangeMode(): string;
  public autorangeMode(autorangeMode: string): this;
  public autorangeMode(autorangeMode?: string): any {
    const plotAutoRangeMode = this._plot.autorangeMode(autorangeMode);
    if (autorangeMode == null) {
      return plotAutoRangeMode;
    }

    return this;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    this._plot.computeLayout(origin, availableWidth, availableHeight);
    return this;
  }

  public destroy() {
    super.destroy();
    this._plot.destroy();

    return this;
  }

  public showAllData() {
    this._plot.showAllData();
    return this;
  }

  /**
   * Gets the TransformableAccessorScaleBinding for X.
   */
  public x(): TransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} x
   * @returns {XYPlot} The calling XYPlot.
   */
  public x(x: number | Accessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {XYPlot} The calling XYPlot.
   */
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    const xReturn = this._plot.x(x as X, xScale);
    if (x == null) {
      return xReturn;
    }

    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y.
   */
  public y(): TransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} y
   * @returns {XYPlot} The calling XYPlot.
   */
  public y(y: number | Accessor<number>): this;
  /**
   * Sets Y to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {Y|Accessor<Y>} y
   * @param {Scale<Y, number>} yScale
   * @returns {XYPlot} The calling XYPlot.
   */
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    const yReturn = this._plot.y(y as Y, yScale);
    if (yReturn == null) {
      return yReturn;
    }

    this.render();
    return this;
  }

  protected _createPlot() {
    return new BaseXYPlot((dataset) => new CanvasDrawer(dataset),
      this,
      () => this.width(),
      () => this.height());
  }
}
