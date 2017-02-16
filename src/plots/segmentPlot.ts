/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Animators from "../animators";
import { Accessor, Point, Bounds, Range, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";

import * as Plots from "./";
import { PlotEntity, TransformableAccessorScaleBinding, AccessorScaleBinding } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

import { BaseSegmentPlot, ISegmentPlot } from "./baseSegmentPlot";

export class Segment<X, Y> extends XYPlot<X, Y> implements ISegmentPlot<X, Y> {
  protected _plot: BaseSegmentPlot<X, Y>;

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
    return new BaseSegmentPlot((dataset) => new Drawers.Segment(dataset), this);
  }

  /**
   * Gets the AccessorScaleBinding for X
   */
  public x(): TransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X to a constant value or the result of an Accessor.
   *
   * @param {X|Accessor<X>} x
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public x(x: number | Accessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    const plotX = this._plot.x(x as X, xScale);
    if (x == null) {
      return plotX;
    }

    this.render();
    return this;
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
   * Gets the AccessorScaleBinding for Y
   */
  public y(): TransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y to a constant value or the result of an Accessor.
   *
   * @param {Y|Accessor<Y>} y
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public y(y: number | Accessor<number>): this;
  /**
   * Sets Y to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {Y|Accessor<Y>} y
   * @param {Scale<Y, number>} yScale
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    const plotY = this._plot.y(y as Y, yScale);
    if (y == null) {
      return plotY;
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

  public entitiesAt(point: Point) {
    return this._plot.entitiesAt(point);
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
    return this._plot.entitiesIn(xRangeOrBounds as Range, yRange)
  }
}
