/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesetter from "typesettable";

import * as Formatters from "../core/formatters";
import { QuantitativeScale } from "../scales/quantitativeScale";
import * as Utils from "../utils";
import { Axis, AxisOrientation } from "./axis";

export class Numeric extends Axis<number> {

  private _tickLabelPositioning = "center";
  private _usesTextWidthApproximation = false;
  private _measurer: Typesetter.Measurer;
  private _wrapper: Typesetter.Wrapper;

  /**
   * Constructs a Numeric Axis.
   *
   * A Numeric Axis is a visual representation of a QuantitativeScale.
   *
   * @constructor
   * @param {QuantitativeScale} scale
   * @param {AxisOrientation} orientation Orientation of this Numeric Axis.
   */
  constructor(scale: QuantitativeScale<number>, orientation: AxisOrientation) {
    super(scale, orientation);
    this.formatter(Formatters.general());
  }

  protected _setup() {
    super._setup();
    const context = new Typesetter.SvgContext(this._tickLabelContainer.node() as SVGElement, Axis.TICK_LABEL_CLASS);
    this._measurer = new Typesetter.CacheMeasurer(context);
    this._wrapper = new Typesetter.Wrapper().maxLines(1);
  }

  protected _computeWidth() {
    const maxTextWidth = this._usesTextWidthApproximation ? this._computeApproximateTextWidth() : this._computeExactTextWidth();

    if (this._tickLabelPositioning === "center") {
      return this._maxLabelTickLength() + this.tickLabelPadding() + maxTextWidth;
    } else {
      return Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + maxTextWidth);
    }
  }

  private _computeExactTextWidth(): number {
    const tickValues = this._getTickValues();
    const textLengths = tickValues.map((v: any) => {
      const formattedValue = this.formatter()(v);
      return this._measurer.measure(formattedValue).width;
    });

    return Utils.Math.max(textLengths, 0);
  }

  private _computeApproximateTextWidth(): number {
    const tickValues = this._getTickValues();
    const mWidth = this._measurer.measure("M").width;
    const textLengths = tickValues.map((v: number): number => {
      const formattedValue = this.formatter()(v);
      return formattedValue.length * mWidth;
    });

    return Utils.Math.max(textLengths, 0);
  }

  protected _computeHeight() {
    const textHeight = this._measurer.measure().height;

    if (this._tickLabelPositioning === "center") {
      return this._maxLabelTickLength() + this.tickLabelPadding() + textHeight;
    } else {
      return Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + textHeight);
    }
  }

  protected _getTickValues() {
    const scale = (<QuantitativeScale<number>> this._scale);
    const domain = scale.domain();
    const min = domain[0] <= domain[1] ? domain[0] : domain[1];
    const max = domain[0] >= domain[1] ? domain[0] : domain[1];
    return scale.ticks().filter((i: number) => i >= min && i <= max);
  }

  protected _rescale() {
    if (!this._isSetup) {
      return;
    }

    if (!this.isHorizontal()) {
      const reComputedWidth = this._computeWidth();
      if (reComputedWidth > this.width() || reComputedWidth < (this.width() - this.margin())) {
        this.redraw();
        return;
      }
    }

    this.render();
  }

  public renderImmediately() {
    super.renderImmediately();

    const tickLabelAttrHash: { [key: string]: number | string | ((d: any) => number) } = {
      "x": <any> 0,
      "y": <any> 0,
      "dx": "0em",
      "dy": "0.3em",
    };

    const tickMarkLength = this._maxLabelTickLength();
    const tickLabelPadding = this.tickLabelPadding();

    let tickLabelTextAnchor = "middle";

    let labelGroupTransformX = 0;
    let labelGroupTransformY = 0;
    let labelGroupShiftX = 0;
    let labelGroupShiftY = 0;
    if (this.isHorizontal()) {
      switch (this._tickLabelPositioning) {
        case "left":
          tickLabelTextAnchor = "end";
          labelGroupTransformX = -tickLabelPadding;
          labelGroupShiftY = tickLabelPadding;
          break;
        case "center":
          labelGroupShiftY = tickMarkLength + tickLabelPadding;
          break;
        case "right":
          tickLabelTextAnchor = "start";
          labelGroupTransformX = tickLabelPadding;
          labelGroupShiftY = tickLabelPadding;
          break;
      }
    } else {
      switch (this._tickLabelPositioning) {
        case "top":
          tickLabelAttrHash["dy"] = "-0.3em";
          labelGroupShiftX = tickLabelPadding;
          labelGroupTransformY = -tickLabelPadding;
          break;
        case "center":
          labelGroupShiftX = tickMarkLength + tickLabelPadding;
          break;
        case "bottom":
          tickLabelAttrHash["dy"] = "1em";
          labelGroupShiftX = tickLabelPadding;
          labelGroupTransformY = tickLabelPadding;
          break;
      }
    }

    const tickMarkAttrHash = this._generateTickMarkAttrHash();
    switch (this.orientation()) {
      case "bottom":
        tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
        tickLabelAttrHash["dy"] = "0.95em";
        labelGroupTransformY = <number> tickMarkAttrHash["y1"] + labelGroupShiftY;
        break;

      case "top":
        tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
        tickLabelAttrHash["dy"] = "-.25em";
        labelGroupTransformY = <number> tickMarkAttrHash["y1"] - labelGroupShiftY;
        break;

      case "left":
        tickLabelTextAnchor = "end";
        labelGroupTransformX = <number> tickMarkAttrHash["x1"] - labelGroupShiftX;
        tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
        break;

      case "right":
        tickLabelTextAnchor = "start";
        labelGroupTransformX = <number> tickMarkAttrHash["x1"] + labelGroupShiftX;
        tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
        break;
    }

    const tickLabelValues = this._getTickValues();
    const tickLabelsUpdate = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS).data(tickLabelValues);
    tickLabelsUpdate.exit().remove();

    const tickLabels =
      tickLabelsUpdate
        .enter()
        .append("text")
        .classed(Axis.TICK_LABEL_CLASS, true)
        .merge(tickLabelsUpdate);
    tickLabels.style("text-anchor", tickLabelTextAnchor)
      .style("visibility", "inherit")
      .attrs(tickLabelAttrHash)
      .text((s: any) => this.formatter()(s));

    const labelGroupTransform = "translate(" + labelGroupTransformX + ", " + labelGroupTransformY + ")";
    this._tickLabelContainer.attr("transform", labelGroupTransform);

    this._showAllTickMarks();

    if (!this.showEndTickLabels()) {
      this._hideEndTickLabels();
    }

    this._hideOverflowingTickLabels();
    this._hideOverlappingTickLabels();

    if (this._tickLabelPositioning !== "center") {
      this._hideTickMarksWithoutLabel();
    }
    return this;
  }

  /**
   * Gets the tick label position relative to the tick marks.
   *
   * @returns {string} The current tick label position.
   */
  public tickLabelPosition(): string;
  /**
   * Sets the tick label position relative to the tick marks.
   *
   * @param {string} position "top"/"center"/"bottom" for a vertical Numeric Axis,
   *                          "left"/"center"/"right" for a horizontal Numeric Axis.
   * @returns {Numeric} The calling Numeric Axis.
   */
  public tickLabelPosition(position: string): this;
  public tickLabelPosition(position?: string): any {
    if (position == null) {
      return this._tickLabelPositioning;
    } else {
      const positionLC = position.toLowerCase();
      if (this.isHorizontal()) {
        if (!(positionLC === "left" || positionLC === "center" || positionLC === "right")) {
          throw new Error(positionLC + " is not a valid tick label position for a horizontal NumericAxis");
        }
      } else {
        if (!(positionLC === "top" || positionLC === "center" || positionLC === "bottom")) {
          throw new Error(positionLC + " is not a valid tick label position for a vertical NumericAxis");
        }
      }
      this._tickLabelPositioning = positionLC;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the approximate text width setting.
   *
   * @returns {boolean} The current text width approximation setting.
   */
  public usesTextWidthApproximation(): boolean;
  /**
   * Sets the approximate text width setting. Approximating text width
   * measurements can drastically speed up plot rendering, but the plot may
   * have extra white space that would be eliminated by exact measurements.
   * Additionally, very abnormal fonts may not approximate reasonably.
   *
   * @param {boolean} The new text width approximation setting.
   * @returns {Axes.Numeric} The calling Axes.Numeric.
   */
  public usesTextWidthApproximation(enable: boolean): this;
  public usesTextWidthApproximation(enable?: boolean): any {
    if (enable == null) {
      return this._usesTextWidthApproximation;
    } else {
      this._usesTextWidthApproximation = enable;
      return this;
    }
  }

  private _hideEndTickLabels() {
    const boundingBox = (<Element> this._boundingBox.node()).getBoundingClientRect();
    const tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
    if (tickLabels.size() === 0) {
      return;
    }
    const firstTickLabel = <Element> tickLabels.nodes()[0];
    if (!Utils.DOM.clientRectInside(firstTickLabel.getBoundingClientRect(), boundingBox)) {
      d3.select(firstTickLabel).style("visibility", "hidden");
    }
    const lastTickLabel = <Element> tickLabels.nodes()[tickLabels.size() - 1];
    if (!Utils.DOM.clientRectInside(lastTickLabel.getBoundingClientRect(), boundingBox)) {
      d3.select(lastTickLabel).style("visibility", "hidden");
    }
  }

  private _hideOverlappingTickLabels() {
    const visibleTickLabels = this._tickLabelContainer
      .selectAll("." + Axis.TICK_LABEL_CLASS)
      .filter(function (d: any, i: number) {
        const visibility = d3.select(this).style("visibility");
        return (visibility === "inherit") || (visibility === "visible");
      });

    const visibleTickLabelRects = visibleTickLabels.nodes().map((label: HTMLScriptElement) => label.getBoundingClientRect());
    let interval = 1;

    while (!this._hasOverlapWithInterval(interval, visibleTickLabelRects) && interval < visibleTickLabelRects.length) {
      interval += 1;
    }

    visibleTickLabels.each(function (d: string, i: number) {
      const tickLabel = d3.select(this);
      if (i % interval !== 0) {
        tickLabel.style("visibility", "hidden");
      }
    });
  }

  /**
   * The method is responsible for evenly spacing the labels on the axis.
   * @return test to see if taking every `interval` recrangle from `rects`
   *         will result in labels not overlapping
   *
   * For top, bottom, left, right positioning of the thicks, we want the padding
   * between the labels to be 3x, such that the label will be  `padding` distance
   * from the tick and 2 * `padding` distance (or more) from the next tick:
   * see https://github.com/palantir/plottable/pull/1812
   */
  private _hasOverlapWithInterval(interval: number, rects: ClientRect[]): boolean {
    const padding = (this._tickLabelPositioning === "center")
      ? this.tickLabelPadding()
      : this.tickLabelPadding() * 3;

    const rectsWithPadding = rects.map((rect) => Utils.DOM.expandRect(rect, padding));

    for (let i = 0; i < rectsWithPadding.length - interval; i += interval) {
      const currRect = rectsWithPadding[i];
      const nextRect = rectsWithPadding[i + interval];
      if (Utils.DOM.clientRectsOverlap(currRect, nextRect)) {
        return false;
      }
    }
    return true;
  }

  public invalidateCache() {
    super.invalidateCache();
    (this._measurer as Typesetter.CacheMeasurer).reset();
  }
}
