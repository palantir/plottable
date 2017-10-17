/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { IAccessor, IRangeProjector, Point } from "../core/interfaces";
import * as Scales from "../scales";
import { IScaleCallback, Scale } from "../scales/scale";
import * as Utils from "../utils";

import { ITransformableAccessorScaleBinding } from "./commons";
import { DeferredRenderer } from "./deferredRenderer";
import { Plot } from "./plot";

export class XYPlot<X, Y> extends Plot {
  protected static _X_KEY = "x";
  protected static _Y_KEY = "y";

  private _autoAdjustXScaleDomain = false;
  private _autoAdjustYScaleDomain = false;
  private _adjustYDomainOnChangeFromXCallback: IScaleCallback<Scale<any, any>>;
  private _adjustXDomainOnChangeFromYCallback: IScaleCallback<Scale<any, any>>;

  private _deferredRendering = false;
  private _deferredRenderer: DeferredRenderer<X, Y>;

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

    this._adjustYDomainOnChangeFromXCallback = (scale) => this._adjustYDomainOnChangeFromX();
    this._adjustXDomainOnChangeFromYCallback = (scale) => this._adjustXDomainOnChangeFromY();

    this._renderCallback = () => {
      if (this.deferredRendering()) {
        const scaleX = this.x() && this.x().scale;
        const scaleY = this.y() && this.y().scale;
        this._deferredRenderer.updateDomains(scaleX, scaleY);
      } else {
        this.render();
      }
    };

    this._deferredRenderer = new DeferredRenderer<X, Y>(() => this.render(), this._applyDeferredRenderingTransform);
  }

  public render() {
    if (this.deferredRendering()) {
      this._deferredRenderer.resetTransforms();
    }
    return super.render();
  }

  /**
   * Returns the whether or not the rendering is deferred for performance boost.
   *
   * @return {boolean} The deferred rendering option
   */
  public deferredRendering(): boolean;
  /**
   * Sets / unsets the deferred rendering option Activating this option improves
   * the performance of plot interaction (pan / zoom) by performing lazy
   * renders, only after the interaction has stopped. Because re-rendering is no
   * longer performed during the interaction, the zooming might experience a
   * small resolution degradation, before the lazy re-render is performed.
   *
   * This option is intended for cases where performance is an issue.
   */
  public deferredRendering(deferredRendering: boolean): this;
  public deferredRendering(deferredRendering?: boolean): any {
    if (deferredRendering == null) {
      return this._deferredRendering;
    }

    if (deferredRendering) {
      const scaleX = this.x() && this.x().scale;
      const scaleY = this.y() && this.y().scale;
      this._deferredRenderer.setDomains(scaleX, scaleY);
    }

    this._deferredRendering = deferredRendering;
    return this;
  }

  /**
   * Gets the TransformableAccessorScaleBinding for X.
   */
  public x(): ITransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} x
   * @returns {XYPlot} The calling XYPlot.
   */
  public x(x: number | IAccessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {XYPlot} The calling XYPlot.
   */
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>, postScale?: IRangeProjector<number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>, postScale?: IRangeProjector<number>): any {
    if (x == null) {
      return this._propertyBindings.get(XYPlot._X_KEY);
    }

    this._bindProperty(XYPlot._X_KEY, x, xScale, postScale);

    const width = this.width();
    if (xScale != null && width != null) {
      xScale.range([0, width]);
    }
    if (this._autoAdjustYScaleDomain) {
      this._updateYExtentsAndAutodomain();
    }

    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y.
   */
  public y(): ITransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} y
   * @returns {XYPlot} The calling XYPlot.
   */
  public y(y: number | IAccessor<number>): this;
  /**
   * Sets Y to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {Y|Accessor<Y>} y
   * @param {Scale<Y, number>} yScale
   * @returns {XYPlot} The calling XYPlot.
   */
  public y(y: Y | IAccessor<Y>, yScale: Scale<Y, number>, postScale?: IRangeProjector<number>): this;
  public y(y?: number | IAccessor<number> | Y | IAccessor<Y>, yScale?: Scale<Y, number>, postScale?: IRangeProjector<number>): any {
    if (y == null) {
      return this._propertyBindings.get(XYPlot._Y_KEY);
    }

    this._bindProperty(XYPlot._Y_KEY, y, yScale, postScale);

    const height = this.height();
    if (yScale != null && height != null) {
      if (yScale instanceof Scales.Category) {
        yScale.range([0, height]);
      } else {
        yScale.range([height, 0]);
      }
    }
    if (this._autoAdjustXScaleDomain) {
      this._updateXExtentsAndAutodomain();
    }

    this.render();
    return this;
  }

  protected _filterForProperty(property: string): IAccessor<boolean> {
    if (property === "x" && this._autoAdjustXScaleDomain) {
      return this._makeFilterByProperty("y");
    } else if (property === "y" && this._autoAdjustYScaleDomain) {
      return this._makeFilterByProperty("x");
    }
    return null;
  }

  private _makeFilterByProperty(property: string) {
    const binding = this._propertyBindings.get(property);
    if (binding != null) {
      const accessor = binding.accessor;
      const scale = binding.scale;
      if (scale != null) {
        return (datum: any, index: number, dataset: Dataset) => {
          const range = scale.range();
          return Utils.Math.inRange(scale.scale(accessor(datum, index, dataset)), range[0], range[1]);
        };
      }
    }
    return null;
  }

  private _applyDeferredRenderingTransform = (tx: number, ty: number, sx: number, sy: number) => {
    if (!this._isAnchored) {
      return;
    }
    if (this._renderArea != null) {
      this._renderArea.attr("transform", `translate(${tx}, ${ty}) scale(${sx}, ${sy})`);
    }
    if (this._canvas != null) {
      this._canvas.style("transform", `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`);
    }
  }

  protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
    super._uninstallScaleForKey(scale, key);
    const adjustCallback = key === XYPlot._X_KEY ? this._adjustYDomainOnChangeFromXCallback
      : this._adjustXDomainOnChangeFromYCallback;
    scale.offUpdate(adjustCallback);
  }

  protected _installScaleForKey(scale: Scale<any, any>, key: string) {
    super._installScaleForKey(scale, key);
    const adjustCallback = key === XYPlot._X_KEY ? this._adjustYDomainOnChangeFromXCallback
      : this._adjustXDomainOnChangeFromYCallback;
    scale.onUpdate(adjustCallback);
  }

  public destroy() {
    super.destroy();
    if (this.x().scale) {
      this.x().scale.offUpdate(this._adjustYDomainOnChangeFromXCallback);
    }
    if (this.y().scale) {
      this.y().scale.offUpdate(this._adjustXDomainOnChangeFromYCallback);
    }
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
    if (autorangeMode == null) {
      if (this._autoAdjustXScaleDomain) {
        return "x";
      }
      if (this._autoAdjustYScaleDomain) {
        return "y";
      }
      return "none";
    }
    switch (autorangeMode) {
      case "x":
        this._autoAdjustXScaleDomain = true;
        this._autoAdjustYScaleDomain = false;
        this._adjustXDomainOnChangeFromY();
        break;
      case "y":
        this._autoAdjustXScaleDomain = false;
        this._autoAdjustYScaleDomain = true;
        this._adjustYDomainOnChangeFromX();
        break;
      case "none":
        this._autoAdjustXScaleDomain = false;
        this._autoAdjustYScaleDomain = false;
        break;
      default:
        throw new Error("Invalid scale name '" + autorangeMode + "', must be 'x', 'y' or 'none'");
    }
    return this;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    const xBinding = this.x();
    const xScale = xBinding && xBinding.scale;
    if (xScale != null) {
      xScale.range([0, this.width()]);
    }
    const yBinding = this.y();
    const yScale = yBinding && yBinding.scale;
    if (yScale != null) {
      if (yScale instanceof Scales.Category) {
        yScale.range([0, this.height()]);
      } else {
        yScale.range([this.height(), 0]);
      }
    }
    return this;
  }

  private _updateXExtentsAndAutodomain() {
    const xScale = this.x().scale;
    if (xScale != null) {
      xScale.autoDomain();
    }
  }

  private _updateYExtentsAndAutodomain() {
    const yScale = this.y().scale;
    if (yScale != null) {
      yScale.autoDomain();
    }
  }

  /**
   * Adjusts the domains of both X and Y scales to show all data.
   * This call does not override the autorange() behavior.
   *
   * @returns {XYPlot} The calling XYPlot.
   */
  public showAllData() {
    this._updateXExtentsAndAutodomain();
    this._updateYExtentsAndAutodomain();
    return this;
  }

  private _adjustYDomainOnChangeFromX() {
    if (!this._projectorsReady()) {
      return;
    }
    if (this._autoAdjustYScaleDomain) {
      this._updateYExtentsAndAutodomain();
    }
  }

  private _adjustXDomainOnChangeFromY() {
    if (!this._projectorsReady()) {
      return;
    }
    if (this._autoAdjustXScaleDomain) {
      this._updateXExtentsAndAutodomain();
    }
  }

  protected _projectorsReady() {
    const xBinding = this.x();
    const yBinding = this.y();
    return xBinding != null &&
      xBinding.accessor != null &&
      yBinding != null &&
      yBinding.accessor != null;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    const xProjector = Plot._scaledAccessor(this.x());
    const yProjector = Plot._scaledAccessor(this.y());
    return { x: xProjector(datum, index, dataset), y: yProjector(datum, index, dataset) };
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw: Utils.Map<Dataset, any[]> = super._getDataToDraw();

    const definedFunction = (d: any, i: number, dataset: Dataset) => {
      const positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
      const positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
      return Utils.Math.isValidNumber(positionX) &&
        Utils.Math.isValidNumber(positionY);
    };

    this.datasets().forEach((dataset) => {
      dataToDraw.set(dataset, dataToDraw.get(dataset).filter((d, i) => definedFunction(d, i, dataset)));
    });
    return dataToDraw;
  }
}
