import { Accessor, Point } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { Plot } from "./plot";

export class XYPlot<X, Y> extends Plot {
  protected static _X_KEY = "x";
  protected static _Y_KEY = "y";

  private _autoAdjustXScaleDomain = false;
  private _autoAdjustYScaleDomain = false;
  private _adjustYDomainOnChangeFromXCallback: ScaleCallback<Scale<any, any>>;
  private _adjustXDomainOnChangeFromYCallback: ScaleCallback<Scale<any, any>>;

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

    this._adjustYDomainOnChangeFromXCallback = (scale) => this._adjustYDomainOnChangeFromX();
    this._adjustXDomainOnChangeFromYCallback = (scale) => this._adjustXDomainOnChangeFromY();

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

    this._renderCallback = (scale) => {
      if (this.deferredRendering() && this.x() && this.x().scale === scale) {
        _lazyDomainChangeCallbackX(scale);
      } else if (this.deferredRendering() && this.y() && this.y().scale === scale) {
        _lazyDomainChangeCallbackY(scale);
      } else {
        this.render();
      }
    };
  }

  public entityNearest(queryPoint: Point): Plots.PlotEntity {
    // by default, the entity index stores position information in the data space
    // the default impelentation of the entityNearest must convert the chart bounding
    // box as well as the query point to the data space before it can make a comparison
    const invertedChartBounds = this._invertedBounds();
    const invertedQueryPoint = this._invertPixelPoint(queryPoint);
    return super.entityNearest(invertedQueryPoint, invertedChartBounds);
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
  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
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
      return this._propertyBindings.get(XYPlot._X_KEY);
    }

    this._bindProperty(XYPlot._X_KEY, x, xScale);

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
  public y(): Plots.TransformableAccessorScaleBinding<Y, number>;
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
      return this._propertyBindings.get(XYPlot._Y_KEY);
    }

    this._bindProperty(XYPlot._Y_KEY, y, yScale);

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

  protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
    super._uninstallScaleForKey(scale, key);
    let adjustCallback = key === XYPlot._X_KEY ? this._adjustYDomainOnChangeFromXCallback
      : this._adjustXDomainOnChangeFromYCallback;
    scale.offUpdate(adjustCallback);
  }

  protected _installScaleForKey(scale: Scale<any, any>, key: string) {
    super._installScaleForKey(scale, key);
    let adjustCallback = key === XYPlot._X_KEY ? this._adjustYDomainOnChangeFromXCallback
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

  protected _buildLightweightPlotEntities(datasets?: Dataset[]) {
    return super._buildLightweightPlotEntities(datasets).map((lightweightPlotEntity) => {
      lightweightPlotEntity.position = this._invertPixelPoint(lightweightPlotEntity.position);
      return lightweightPlotEntity;
    });
  }

  protected _projectorsReady() {
    let xBinding = this.x();
    let yBinding = this.y();
    return xBinding != null &&
      xBinding.accessor != null &&
      yBinding != null &&
      yBinding.accessor != null;
  }

  /**
   * Returns the bounds of the plot in the Data space ensures that the topLeft
   * and bottomRight points represent the minima and maxima of the Data space, respectively
   @returns {Bounds}
   */
  private _invertedBounds() {
    const bounds = this.bounds();
    const maybeTopLeft = this._invertPixelPoint(bounds.topLeft);
    const maybeBottomRight = this._invertPixelPoint(bounds.bottomRight);

    // Scale domains can map from lowest to highest or highest to lowest (eg [0, 1] or [1, 0]).
    // What we're interested in is a domain space equivalent to the concept of topLeft
    // and bottomRight, not a true mapping from point to domain. This is in keeping
    // with our definition of {Bounds}, where the topLeft coordinate is minimal
    // and the bottomRight is maximal.
    return {
      topLeft: {
        x: Math.min(maybeTopLeft.x, maybeBottomRight.x),
        y: Math.min(maybeTopLeft.y, maybeBottomRight.y)
      },
      bottomRight: {
        x: Math.max(maybeBottomRight.x, maybeTopLeft.x),
        y: Math.max(maybeBottomRight.y, maybeTopLeft.y)
      }
    };
  }

  /**
   * _invertPixelPoint converts a point in pixel coordinates to a point in data coordinates
   * @param {Point} point Representation of the point in pixel coordinates
   * @return {Point} Returns the point represented in data coordinates
   */
  protected _invertPixelPoint(point: Point): Point {
    const xScale = this.x();
    const yScale = this.y();

    return { x: xScale.scale.invertedTransformation(point.x), y: yScale.scale.invertedTransformation(point.y) };
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    let xProjector = Plot._scaledAccessor(this.x());
    let yProjector = Plot._scaledAccessor(this.y());
    return { x: xProjector(datum, index, dataset), y: yProjector(datum, index, dataset) };
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw: Utils.Map<Dataset, any[]> = super._getDataToDraw();

    let definedFunction = (d: any, i: number, dataset: Dataset) => {
      let positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
      let positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
      return Utils.Math.isValidNumber(positionX) &&
        Utils.Math.isValidNumber(positionY);
    };

    this.datasets().forEach((dataset) => {
      dataToDraw.set(dataset, dataToDraw.get(dataset).filter((d, i) => definedFunction(d, i, dataset)));
    });
    return dataToDraw;
  }
}
