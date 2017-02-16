/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Animators from "../animators";
import { Animator } from "../animators/animator";
import { Accessor, Point, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import { Scale } from "../scales/scale";
import { QuantitativeScale } from "../scales/quantitativeScale";
import * as Utils from "../utils";
import { SVGPlotEntity } from "../plots";
import { IComponent } from "../components";

import * as Plots from "./";
import { Area } from "./areaPlot";
import { Plot } from "./plot";

import { BaseStackedAreaPlot, IStackedAreaPlot } from "./baseStackedAreaPlot";

export class StackedArea<X> extends Area<X> implements IStackedAreaPlot<X> {
  protected _plot: BaseStackedAreaPlot<X, SVGPlotEntity>;

  private _baseline: d3.Selection<void>;

  /**
   * @constructor
   */
  constructor() {
    super();
    this.addClass("stacked-area-plot");
    this.attr("fill-opacity", 1);
    this.croppedRenderingEnabled(false);
  }

  public croppedRenderingEnabled(): boolean;
  public croppedRenderingEnabled(croppedRendering: boolean): this;
  public croppedRenderingEnabled(croppedRendering?: boolean): any {
    if (croppedRendering == null) {
      return super.croppedRenderingEnabled();
    }

    if (croppedRendering === true) {
      // HACKHACK #3032: cropped rendering doesn't currently work correctly on StackedArea
      Utils.Window.warn("Warning: Stacked Area Plot does not support cropped rendering.");
      return this;
    }

    return super.croppedRenderingEnabled(croppedRendering);
  }

  public renderImmediately() {
    super.renderImmediately();

    let scaledBaseline = this.y().scale.scale(this._plot.baselineValue);
    let baselineAttr: any = {
      "x1": 0,
      "y1": scaledBaseline,
      "x2": this.width(),
      "y2": scaledBaseline,
    };

    this._getAnimator("baseline").animate(this._baseline, baselineAttr);

    return this;
  }

  protected _getAnimator(key: string): Animator {
    return new Animators.Null();
  }

  protected _setup() {
    super._setup();
    this._baseline = this._renderArea.append("line").classed("baseline", true);
  }

  /**
   * Gets the stacking order of the plot.
   */
  public stackingOrder(): Utils.Stacking.IStackingOrder;
  /**
   * Sets the stacking order of the plot.
   *
   * By default, stacked plots are "bottomup", meaning for positive data, the
   * first series will be placed at the bottom of the scale and subsequent
   * data series will by stacked on top. This can be reveresed by setting
   * stacking order to "topdown".
   *
   * @returns {Plots.StackedArea} This plot
   */
  public stackingOrder(stackingOrder: Utils.Stacking.IStackingOrder): this;
  public stackingOrder(stackingOrder?: Utils.Stacking.IStackingOrder): any {
    const plotStackingOrder = this._plot.stackingOrder(stackingOrder);
    if (stackingOrder == null) {
      return plotStackingOrder;
    }

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
   * For now, downsampling is always disabled in stacked area plot
   * @returns {Plots.StackedArea} The calling Plots.StackedArea
   */
  public downsamplingEnabled(downsampling: boolean): this;
  public downsamplingEnabled(downsampling?: boolean): any {
    if (downsampling == null) {
      return super.downsamplingEnabled();
    }
    Utils.Window.warn("Warning: Stacked Area Plot does not support downsampling");
    return this;
  }

  protected _createPlot() {
    return new BaseStackedAreaPlot(
      (dataset) => new Drawers.Area(dataset),
      (dataset) => new Drawers.Line(dataset),
      StackedArea.SVGEntityAdapter, this);
  }
}
