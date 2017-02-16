/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Animators from "../animators";
import { Accessor, AttributeToProjector, Projector, Point, Bounds, Range } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import { Drawer } from "../drawers/drawer";
import * as Scales from "../scales";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { PlotEntity } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

import { BaseLinePlot, ILinePlot, InterpolatorValue } from "./baseLinePlot";


export class Line<X> extends XYPlot<X, number> implements ILinePlot<X> {

  protected _plot: BaseLinePlot<X>;

  /**
   * A Line Plot draws line segments starting from the first data point to the next.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("line-plot");
    let animator = new Animators.Easing();
    animator.stepDuration(Plot._ANIMATION_MAX_DURATION);
    animator.easingMode("exp-in-out");
    animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
    this.animator(Plots.Animator.MAIN, animator);
    this.attr("stroke", new Scales.Color().range()[0]);
    this.attr("stroke-width", "2px");
  }

  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    } else {
      if (xScale == null) {
        super.x(<number | Accessor<number>>x);
      } else {
        super.x(<X | Accessor<X>>x, xScale);
      }
      this._setScaleSnapping();
      return this;
    }
  }

  public y(): Plots.TransformableAccessorScaleBinding<number, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: number | Accessor<number>, yScale: Scale<number, number>): this;
  public y(y?: number | Accessor<number>, yScale?: Scale<number, number>): any {
    if (y == null) {
      return super.y();
    } else {
      super.y(y, yScale);
      this._setScaleSnapping();
      return this;
    }
  }

  public autorangeMode(): string;
  public autorangeMode(autorangeMode: string): this;
  public autorangeMode(autorangeMode?: string): any {
    if (autorangeMode == null) {
      return super.autorangeMode();
    }

    super.autorangeMode(autorangeMode);
    this._setScaleSnapping();
    return this;
  }

  /**
   * Gets whether or not the autoranging is done smoothly.
   */
  public autorangeSmooth(): boolean;
  /**
   * Sets whether or not the autorange is done smoothly.
   *
   * Smooth autoranging is done by making sure lines always exit on the left / right side of the plot
   * and deactivating the nice domain feature on the scales
   */
  public autorangeSmooth(autorangeSmooth: boolean): this;
  public autorangeSmooth(autorangeSmooth?: boolean): any {
    const plotAutoRangeSmooth = this._plot.autorangeSmooth(autorangeSmooth);
    if (autorangeSmooth == null) {
      return plotAutoRangeSmooth;
    }

    this._setScaleSnapping();
    return this;
  }

  private _setScaleSnapping() {
    if (this.autorangeMode() === "x" && this.x() && this.x().scale && this.x().scale instanceof QuantitativeScale) {
      (<QuantitativeScale<X>>this.x().scale).snappingDomainEnabled(!this.autorangeSmooth());
    }

    if (this.autorangeMode() === "y" && this.y() && this.y().scale && this.y().scale instanceof QuantitativeScale) {
      (<QuantitativeScale<number>>this.y().scale).snappingDomainEnabled(!this.autorangeSmooth());
    }
  }

  /**
   * Gets the interpolation function associated with the plot.
   *
   * @return {string | (points: Array<[number, number]>) => string)}
   */
  public interpolator(): InterpolatorValue | ((points: Array<[number, number]>) => string);
  /**
   * Sets the interpolation function associated with the plot.
   *
   * @param {string | points: Array<[number, number]>) => string} interpolator Interpolation function
   * @return Plots.Line
   */
  public interpolator(interpolator: InterpolatorValue | ((points: Array<[number, number]>) => string)): this;
  public interpolator(interpolator?: InterpolatorValue | ((points: Array<[number, number]>) => string)): any {
    const plotInterpolator = this._plot.interpolator(interpolator);
    if (interpolator == null) {
      return plotInterpolator;
    }

    this.render();
    return this;
  }

  /**
   * Gets if downsampling is enabled
   *
   * When downsampling is enabled, two consecutive lines with the same slope will be merged to one line.
   */
  public downsamplingEnabled(): boolean;
  /**
   * Sets if downsampling is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  public downsamplingEnabled(downsampling: boolean): this;
  public downsamplingEnabled(downsampling?: boolean): any {
    const plotDownsamplingEnabled = this._plot.downsamplingEnabled(downsampling);

    if (downsampling == null) {
      return plotDownsamplingEnabled;
    }

    return this;
  }

  /**
   * Gets if croppedRendering is enabled
   *
   * When croppedRendering is enabled, lines that will not be visible in the viewport will not be drawn.
   */
  public croppedRenderingEnabled(): boolean;
  /**
   * Sets if croppedRendering is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  public croppedRenderingEnabled(croppedRendering: boolean): this;
  public croppedRenderingEnabled(croppedRendering?: boolean): any {
    const plotCroppedRendering = this._plot.croppedRenderingEnabled(croppedRendering);
    if (croppedRendering == null) {
      return plotCroppedRendering;
    }
    this.render();
    return this;
  }

  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  public entitiesIn(bounds: Bounds): PlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  public entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
    return this._plot.entitiesIn(xRangeOrBounds as Range, yRange);
  }

  /**
   * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  public entityNearestByXThenY(queryPoint: Point): PlotEntity {
    return this._plot.entityNearestByXThenY(queryPoint);
  }

  protected _createPlot() {
    return new BaseLinePlot((dataset) => new Drawers.Line(dataset), this);
  }
}
