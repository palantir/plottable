/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Plots from "./";

import { Dataset } from "../core/dataset";
import { Accessor, Point } from "../core/interfaces";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { CanvasPlot } from "./canvasPlot";
import { TransformableAccessorScaleBinding, LightweightPlotEntity, PlotEntity } from "./commons";

export class XYCanvasPlot<X, Y> extends CanvasPlot {
    protected static _X_KEY = "x";
    protected static _Y_KEY = "y";
    private _autoAdjustYScaleDomain = false;
    private _autoAdjustXScaleDomain = false;
    private _adjustYDomainOnChangeFromXCallback: ScaleCallback<Scale<any, any>>;
    private _adjustXDomainOnChangeFromYCallback: ScaleCallback<Scale<any, any>>;

    constructor() {
        super();
        this._adjustYDomainOnChangeFromXCallback = (scale) => this._adjustYDomainOnChangeFromX();
        this._adjustXDomainOnChangeFromYCallback = (scale) => this._adjustXDomainOnChangeFromY();
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
    if (x == null) {
      return this._propertyBindings.get(XYCanvasPlot._X_KEY);
    }

    this._bindProperty(XYCanvasPlot._X_KEY, x, xScale);

    let width = this.width();
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
    if (y == null) {
      return this._propertyBindings.get(XYCanvasPlot._Y_KEY);
    }

    this._bindProperty(XYCanvasPlot._Y_KEY, y, yScale);

    let height = this.height();
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

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    let xBinding = this.x();
    let xScale = xBinding && xBinding.scale;
    if (xScale != null) {
      xScale.range([0, this.width()]);
    }
    let yBinding = this.y();
    let yScale = yBinding && yBinding.scale;
    if (yScale != null) {
      if (yScale instanceof Scales.Category) {
        yScale.range([0, this.height()]);
      } else {
        yScale.range([this.height(), 0]);
      }
    }
    return this;
  }

  protected _bindProperty(property: string, value: any, scale: Scale<any, any>) {
    let binding = this._propertyBindings.get(property);
    let oldScale = binding != null ? binding.scale : null;

    this._propertyBindings.set(property, { accessor: d3.functor(value), scale: scale });
    this._updateExtentsForProperty(property);

    if (oldScale != null) {
      this._uninstallScaleForKey(oldScale, property);
    }
    if (scale != null) {
      this._installScaleForKey(scale, property);
    }
  }

  protected _filterForProperty(property: string) {
    if (property === "x" && this._autoAdjustXScaleDomain) {
      return this._makeFilterByProperty("y");
    } else if (property === "y" && this._autoAdjustYScaleDomain) {
      return this._makeFilterByProperty("x");
    }
    return null;
  }

  private _makeFilterByProperty(property: string) {
    let binding = this._propertyBindings.get(property);
    if (binding != null) {
      let accessor = binding.accessor;
      let scale = binding.scale;
      if (scale != null) {
        return (datum: any, index: number, dataset: Dataset) => {
          let range = scale.range();
          return Utils.Math.inRange(scale.scale(accessor(datum, index, dataset)), range[0], range[1]);
        };
      }
    }
    return null;
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw: Utils.Map<Dataset, any[]> = super._getDataToDraw();

    let definedFunction = (d: any, i: number, dataset: Dataset) => {
      let positionX = CanvasPlot._scaledAccessor(this.x())(d, i, dataset);
      let positionY = CanvasPlot._scaledAccessor(this.y())(d, i, dataset);
      return Utils.Math.isValidNumber(positionX) &&
        Utils.Math.isValidNumber(positionY);
    };

    this.datasets().forEach((dataset) => {
      dataToDraw.set(dataset, dataToDraw.get(dataset).filter((d, i) => definedFunction(d, i, dataset)));
    });
    return dataToDraw;
  }

  protected _installScaleForKey(scale: Scale<any, any>, key: string) {
    super._installScaleForKey(scale, key);
    let adjustCallback = key === XYCanvasPlot._X_KEY ? this._adjustYDomainOnChangeFromXCallback
      : this._adjustXDomainOnChangeFromYCallback;
    scale.onUpdate(adjustCallback);
  }

  protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
    super._uninstallScaleForKey(scale, key);
    let adjustCallback = key === XYCanvasPlot._X_KEY ? this._adjustYDomainOnChangeFromXCallback
      : this._adjustXDomainOnChangeFromYCallback;
    scale.offUpdate(adjustCallback);
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
    let xBinding = this.x();
    let yBinding = this.y();
    return xBinding != null &&
      xBinding.accessor != null &&
      yBinding != null &&
      yBinding.accessor != null;
  }

  private _updateXExtentsAndAutodomain() {
    this._updateExtentsForProperty("x");
    let xScale = this.x().scale;
    if (xScale != null) {
      xScale.autoDomain();
    }
  }

  private _updateYExtentsAndAutodomain() {
    this._updateExtentsForProperty("y");
    let yScale = this.y().scale;
    if (yScale != null) {
      yScale.autoDomain();
    }
  }
}