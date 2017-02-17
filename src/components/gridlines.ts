/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */


import * as d3 from "d3";

import { QuantitativeScale } from "../scales/quantitativeScale";
import { ScaleCallback } from "../scales/scale";
import { Point, SimpleSelection } from "../core/interfaces";

import { Component } from "./component";

export class Gridlines extends Component {
  private _xScale: QuantitativeScale<any>;
  private _yScale: QuantitativeScale<any>;
  private _xLinesContainer: SimpleSelection<void>;
  private _yLinesContainer: SimpleSelection<void>;

  private _renderCallback: ScaleCallback<QuantitativeScale<any>>;

  /**
   * @constructor
   * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
   * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
   */
  constructor(xScale: QuantitativeScale<any>, yScale: QuantitativeScale<any>) {
    if (xScale != null && !(QuantitativeScale.prototype.isPrototypeOf(xScale))) {
      throw new Error("xScale needs to inherit from Scale.QuantitativeScale");
    }
    if (yScale != null && !(QuantitativeScale.prototype.isPrototypeOf(yScale))) {
      throw new Error("yScale needs to inherit from Scale.QuantitativeScale");
    }
    super();
    this.addClass("gridlines");
    this._xScale = xScale;
    this._yScale = yScale;
    this._renderCallback = (scale) => this.render();
    if (this._xScale) {
      this._xScale.onUpdate(this._renderCallback);
    }
    if (this._yScale) {
      this._yScale.onUpdate(this._renderCallback);
    }
  }

  public destroy() {
    super.destroy();
    if (this._xScale) {
      this._xScale.offUpdate(this._renderCallback);
    }
    if (this._yScale) {
      this._yScale.offUpdate(this._renderCallback);
    }
    return this;
  }

  protected _setup() {
    super._setup();
    this._xLinesContainer = this.content().append("g").classed("x-gridlines", true);
    this._yLinesContainer = this.content().append("g").classed("y-gridlines", true);
  }

  public renderImmediately() {
    super.renderImmediately();
    this._redrawXLines();
    this._redrawYLines();
    return this;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    if (this._xScale != null) {
      this._xScale.range([0, this.width()]);
    }
    if (this._yScale != null) {
      this._yScale.range([this.height(), 0]);
    }
    return this;
  }

  private _redrawXLines() {
    if (this._xScale) {
      let xTicks = this._xScale.ticks();
      let getScaledXValue = (tickVal: number) => this._xScale.scale(tickVal);
      let xLinesUpdate = this._xLinesContainer.selectAll("line").data(xTicks);
      const xLines = xLinesUpdate.enter().append("line").merge(xLinesUpdate);
      xLines.attr("x1", getScaledXValue)
        .attr("y1", 0)
        .attr("x2", getScaledXValue)
        .attr("y2", this.height())
        .classed("zeroline", (t: number) => t === 0);
      xLinesUpdate.exit().remove();
    }
  }

  private _redrawYLines() {
    if (this._yScale) {
      let yTicks = this._yScale.ticks();
      let getScaledYValue = (tickVal: number) => this._yScale.scale(tickVal);
      let yLinesUpdate = this._yLinesContainer.selectAll("line").data(yTicks);
      const yLines = yLinesUpdate.enter().append("line").merge(yLinesUpdate);
      yLines.attr("x1", 0)
        .attr("y1", getScaledYValue)
        .attr("x2", this.width())
        .attr("y2", getScaledYValue)
        .classed("zeroline", (t: number) => t === 0);
      yLinesUpdate.exit().remove();
    }
  }
}
