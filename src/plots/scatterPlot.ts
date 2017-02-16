/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Animators from "../animators";
import { Accessor, Point, Bounds, Range, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as SymbolFactories from "../core/symbolFactories";
import { SymbolFactory } from "../core/symbolFactories";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { PlotEntity, LightweightPlotEntity, TransformableAccessorScaleBinding, AccessorScaleBinding } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

import { BaseScatterPlot, IScatterPlot } from "./baseScatterPlot";

export class Scatter<X, Y> extends XYPlot<X, Y> implements IScatterPlot<X, Y> {
  protected _plot: BaseScatterPlot<X, Y>;

  /**
   * A Scatter Plot draws a symbol at each data point.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("scatter-plot");
    let animator = new Animators.Easing();
    animator.startDelay(5);
    animator.stepDuration(250);
    animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
    this.animator(Plots.Animator.MAIN, animator);
    this.attr("opacity", 0.6);
    this.attr("fill", new Scales.Color().range()[0]);
    this.size(6);
    let circleSymbolFactory = SymbolFactories.circle();
    this.symbol(() => circleSymbolFactory);
  }

  /**
   * Gets the AccessorScaleBinding for the size property of the plot.
   * The size property corresponds to the area of the symbol.
   */
  public size<S>(): TransformableAccessorScaleBinding<S, number>;
  /**
   * Sets the size property to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} size
   * @returns {Plots.Scatter} The calling Scatter Plot.
   */
  public size(size: number | Accessor<number>): this;
  /**
   * Sets the size property to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {S|Accessor<S>} sectorValue
   * @param {Scale<S, number>} scale
   * @returns {Plots.Scatter} The calling Scatter Plot.
   */
  public size<S>(size: S | Accessor<S>, scale: Scale<S, number>): this;
  public size<S>(size?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
    const plotSize = this._plot.size(size as S, scale);
    if (size == null) {
      return plotSize;
    }
    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for the symbol property of the plot.
   * The symbol property corresponds to how the symbol will be drawn.
   */
  public symbol(): AccessorScaleBinding<any, any>;
  /**
   * Sets the symbol property to an Accessor<SymbolFactory>.
   *
   * @param {Accessor<SymbolFactory>} symbol
   * @returns {Plots.Scatter} The calling Scatter Plot.
   */
  public symbol(symbol: Accessor<SymbolFactory>): this;
  public symbol(symbol?: Accessor<SymbolFactory>): any {
    const plotSymbol = this._plot.symbol(symbol);

    if (symbol == null) {
      return plotSymbol;
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

  protected _createPlot() {
    return new BaseScatterPlot((dataset) => new Drawers.Symbol(dataset), this);
  }
}
