/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point, SimpleSelection } from "../core/interfaces";
import { IScaleCallback, Scale } from "../scales/scale";

import { Component } from "./component";

function getScaledValue(
  scale: Scale<any, any>,
  between: boolean,
  initialValue?: string) {

  let previousPosition = initialValue === undefined
    ? undefined
    : scale.scale(initialValue);

  return (tickVal: any) => {
    const position = scale.scale(tickVal);

    if (!between) {
      return position;
    }

    let gridPosition: number;

    if (previousPosition !== undefined) {
      gridPosition = previousPosition + (position - previousPosition) / 2;
    }

    previousPosition = position;
    return gridPosition;
  };
}

export class Gridlines extends Component {
  private _betweenX: boolean;
  private _betweenY: boolean;
  private _xScale: Scale<any, any>;
  private _yScale: Scale<any, any>;
  private _xLinesContainer: SimpleSelection<void>;
  private _yLinesContainer: SimpleSelection<void>;

  private _renderCallback: IScaleCallback<Scale<any, any>>;

  /**
   * @constructor
   * @param {Scale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
   * @param {Scale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
   */
  constructor(xScale: Scale<any, any>, yScale: Scale<any, any>) {
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

  public betweenX(_betweenX: boolean): this;
  public betweenX(): boolean;
  public betweenX(_betweenX?: boolean): this | boolean {
    if (_betweenX === undefined) {
      return this._betweenX;
    }

    if (_betweenX !== this._betweenX) {
      this._betweenX = _betweenX;
      this.render();
    }

    return this;
  }

  public betweenY(_betweenY: boolean): this;
  public betweenY(): boolean;
  public betweenY(_betweenY?: boolean): this | boolean {
    if (_betweenY === undefined) {
      return this._betweenY;
    }

    if (_betweenY !== this._betweenY) {
      this._betweenY = _betweenY;
      this.render();
    }

    return this;
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
      const xTicks = this._xScale.ticks().slice();
      let initialXValue;
      const between = this.betweenX();
      if (between) {
        // don't render the first value, just pass to the gridline positioning
        initialXValue = xTicks.shift();
      }

      const xLinesUpdate = this._xLinesContainer.selectAll("line").data(xTicks);
      const xLines = xLinesUpdate.enter().append("line").merge(xLinesUpdate);
      xLines.attr("x1", getScaledValue(this._xScale, between, initialXValue))
        .attr("y1", 0)
        .attr("x2", getScaledValue(this._xScale, between, initialXValue))
        .attr("y2", this.height())
        .classed("zeroline", (t: number) => t === 0);
      xLinesUpdate.exit().remove();
    }
  }

  private _redrawYLines() {
    if (this._yScale) {
      const yTicks = this._yScale.ticks().slice();

      let initialYValue;
      const between = this.betweenY();
      if (between) {
        // don't render the first value, just pass to the gridline positioning
        initialYValue = yTicks.shift();
      }

      const yLinesUpdate = this._yLinesContainer.selectAll("line").data(yTicks);
      const yLines = yLinesUpdate.enter().append("line").merge(yLinesUpdate);
      yLines.attr("x1", 0)
        .attr("y1", getScaledValue(this._yScale, between, initialYValue))
        .attr("x2", this.width())
        .attr("y2", getScaledValue(this._yScale, between, initialYValue))
        .classed("zeroline", (t: number) => t === 0);
      yLinesUpdate.exit().remove();
    }
  }

 }
