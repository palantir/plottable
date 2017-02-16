/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Accessor, Point } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { Drawer } from "../drawers/drawer";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { TransformableAccessorScaleBinding, LightweightPlotEntity, PlotEntity } from "./commons";
import { Plot } from "./plot";
import { BaseXYPlot, IXYPlot } from "./baseXYPlot";

export class XYPlot<X, Y> extends Plot implements IXYPlot<X, Y> {
  protected _plot: BaseXYPlot<X, Y>;

  private _deferredRendering = false;
  private _cachedDomainX: X[] = [null, null];
  private _cachedDomainY: Y[] = [null, null];

  /**
   * An XYPlot is a Plot that displays data along two primary directions, X and Y.
   *
   * @constructor
   * @param {Scale} xScale The x scale to use.
   * @param {Scale} yScale The y scale to use.
   */
  constructor() {
    super();
    this.addClass("xy-plot");

    let _deltaX = 0;
    let _deltaY = 0;
    let _scalingX = 1;
    let _scalingY = 1;
    let _lastSeenDomainX: X[] = [null, null];
    let _lastSeenDomainY: Y[] = [null, null];
    let _timeoutReference = 0;
    let _deferredRenderingTimeout = 500;

    let _registerDeferredRendering = () => {
      if (this._renderArea == null) {
        return;
      }
      this._renderArea.attr("transform",
        "translate(" + _deltaX + ", " + _deltaY + ")" +
        "scale(" + _scalingX + ", " + _scalingY + ")");
      clearTimeout(_timeoutReference);
      _timeoutReference = setTimeout(() => {
        this._cachedDomainX = _lastSeenDomainX;
        this._cachedDomainY = _lastSeenDomainY;
        _deltaX = 0;
        _deltaY = 0;
        _scalingX = 1;
        _scalingY = 1;
        this.render();
        this._renderArea.attr("transform", "translate(0, 0) scale(1, 1)");
      }, _deferredRenderingTimeout);
    };

    let _lazyDomainChangeCallbackX = (scale: Scale<X, any>) => {
      if (!this._isAnchored) {
        return;
      }
      _lastSeenDomainX = scale.domain();
      _scalingX = (scale.scale(this._cachedDomainX[1]) - scale.scale(this._cachedDomainX[0])) /
        (scale.scale(_lastSeenDomainX[1]) - scale.scale(_lastSeenDomainX[0])) || 1;
      _deltaX = scale.scale(this._cachedDomainX[0]) - scale.scale(_lastSeenDomainX[0]) || 0;

      _registerDeferredRendering();
    };

    let _lazyDomainChangeCallbackY = (scale: Scale<Y, any>) => {
      if (!this._isAnchored) {
        return;
      }
      _lastSeenDomainY = scale.domain();
      _scalingY = (scale.scale(this._cachedDomainY[1]) - scale.scale(this._cachedDomainY[0])) /
        (scale.scale(_lastSeenDomainY[1]) - scale.scale(_lastSeenDomainY[0])) || 1;
      _deltaY = scale.scale(this._cachedDomainY[0]) - scale.scale(_lastSeenDomainY[0]) * _scalingY || 0;

      _registerDeferredRendering();
    };

    this._plot.renderCallback((scale) => {
      if (this.deferredRendering() && this.x() && this.x().scale === scale) {
        _lazyDomainChangeCallbackX(scale);
      } else if (this.deferredRendering() && this.y() && this.y().scale === scale) {
        _lazyDomainChangeCallbackY(scale);
      } else {
        this.render();
      }
    });
  }

  public entityNearest(queryPoint: Point): PlotEntity {
    return this._plot.entityNearest(queryPoint);
  }

  /**
   * Returns the whether or not the rendering is deferred for performance boost.
   * @return {boolean} The deferred rendering option
   */
  public deferredRendering(): boolean;
  /**
   * Sets / unsets the deferred rendering option
   * Activating this option improves the performance of plot interaction (pan / zoom) by
   * performing lazy renders, only after the interaction has stopped. Because re-rendering
   * is no longer performed during the interaction, the zooming might experience a small
   * resolution degradation, before the lazy re-render is performed.
   *
   * This option is intended for cases where performance is an issue.
   */
  public deferredRendering(deferredRendering: boolean): this;
  public deferredRendering(deferredRendering?: boolean): any {
    if (deferredRendering == null) {
      return this._deferredRendering;
    }

    if (deferredRendering && this._isAnchored) {
      if (this.x() && this.x().scale) {
        this._cachedDomainX = this.x().scale.domain();
      }
      if (this.y() && this.y().scale) {
        this._cachedDomainY = this.y().scale.domain();
      }
    }

    this._deferredRendering = deferredRendering;
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

    if (y == null) {
      return yReturn;
    }

    this.render();
    return this;
  }

  public destroy() {
    super.destroy();
    this._plot.destroy();
    return this;
  }

  /**
   * Gets the automatic domain adjustment mode for visible points.
   */
  public autorangeMode(): string;
  /**
   * Sets the automatic domain adjustment mode for visible points to operate against the X Scale, Y Scale, or neither.
   * If "x" or "y" is specified the adjustment is immediately performed.
   *
   * @param {string} autorangeMode One of "x"/"y"/"none".
   *   "x" will adjust the x Scale in relation to changes in the y domain.
   *   "y" will adjust the y Scale in relation to changes in the x domain.
   *   "none" means neither Scale will change automatically.
   * @returns {XYPlot} The calling XYPlot.
   */
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

  /**
   * Adjusts the domains of both X and Y scales to show all data.
   * This call does not override the autorange() behavior.
   *
   * @returns {XYPlot} The calling XYPlot.
   */
  public showAllData() {
    this._plot.showAllData();
    return this;
  }

  protected _createPlot() {
    return new BaseXYPlot((dataset) => new Drawer(dataset), this);
  }
}
