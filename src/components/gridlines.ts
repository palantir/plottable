/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point, SimpleSelection } from "../core/interfaces";
import { IScaleCallback, Scale } from "../scales/scale";

import { Component } from "./component";

/**
 * Returns next grid position based on tick value
 *
 * @param scale Scale used by the grid
 * @param between Value denoting whether the grid renders between ticks or on ticks
 * @param orderedTicks All ticks in order. only needed when rendering lines between ticks
 */
function gridPositionFactory(
  scale: Scale<any, any>,
  between: boolean,
  orderedTicks?: any[]) {

  const previousTick: { [index: string]: string } = {};
  if (orderedTicks !== undefined) {
    for(let i = 0; i < orderedTicks.length; i ++) {
      const previous = orderedTicks[i - 1];
      const current = orderedTicks[i];
      previousTick[current] = previous;
    }
  }

  return (tickVal: any) => {
    const position = scale.scale(tickVal);

    if (!between) {
      return position;
    }

    let gridPosition: number;
    const previousPosition = previousTick[tickVal] === undefined
      ? undefined
      : scale.scale(previousTick[tickVal]);

    if (previousPosition !== undefined) {
      gridPosition = previousPosition + (position - previousPosition) / 2;
    }

    return gridPosition;
  };
}

export class Gridlines extends Component {
  private _betweenX: boolean;
  private _betweenY: boolean;
  private _xScale: Scale<any, any> | null;
  private _yScale: Scale<any, any> | null;
  private _xLinesContainer: SimpleSelection<void>;
  private _yLinesContainer: SimpleSelection<void>;

  private _renderCallback: IScaleCallback<Scale<any, any>>;

  /**
   * @constructor
   * @param {Scale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
   * @param {Scale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
   */
  constructor(xScale: Scale<any, any> | null, yScale: Scale<any, any> | null) {
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

  /**
   * Gets the between flag for the x axis.
   *
   * @returns {boolean} The current state of betweenX
   */
  public betweenX(): boolean;
  /**
   * Sets the between flag for the x axis. True causes gridlines to render
   * between ticks. False sets the causes the gridlines to render on the
   * ticks. Defaults to false.
   *
   * @param {boolean} betweenX
   * @returns {Gridlines} The calling Gridlines.
   */
  public betweenX(_betweenX: boolean): this;
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

  /**
   * Gets the between flag for the y axis.
   *
   * @returns {boolean} The current state of betweenY
   */
  public betweenY(): boolean;
    /**
   * Sets the between flag for the y axis. True causes gridlines to render
   * between ticks. False sets the causes the gridlines to render on the
   * ticks. Defaults to false.
   *
   * @param {boolean} betweenY
   * @returns {Gridlines} The calling Gridlines.
   */
  public betweenY(_betweenY: boolean): this;
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
      const between = this.betweenX();
      const xTicks = this._xScale.ticks().slice(between ? 1 : 0);
      const xLinesUpdate = this._xLinesContainer.selectAll("line").data(xTicks);
      const xLines = xLinesUpdate.enter().append("line").merge(xLinesUpdate);
      xLines.attr("x1", gridPositionFactory(this._xScale, between, this._xScale.ticks()))
        .attr("y1", 0)
        .attr("x2", gridPositionFactory(this._xScale, between, this._xScale.ticks()))
        .attr("y2", this.height())
        .classed("betweenline", between)
        .classed("zeroline", (t: number) => t === 0);
      xLinesUpdate.exit().remove();
    }
  }

  private _redrawYLines() {
    if (this._yScale) {
      const between = this.betweenY();
      const yTicks = this._yScale.ticks().slice(between ? 1 : 0);
      const yLinesUpdate = this._yLinesContainer.selectAll("line").data(yTicks);
      const yLines = yLinesUpdate.enter().append("line").merge(yLinesUpdate);
      yLines.attr("x1", 0)
        .attr("y1", gridPositionFactory(this._yScale, between, this._yScale.ticks()))
        .attr("x2", this.width())
        .attr("y2", gridPositionFactory(this._yScale, between, this._yScale.ticks()))
        .classed("betweenline", between)
        .classed("zeroline", (t: number) => t === 0);
      yLinesUpdate.exit().remove();
    }
  }

 }
