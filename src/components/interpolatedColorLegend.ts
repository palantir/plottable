/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Typesettable from "typesettable";

import * as Configs from "../core/config";
import { Formatter } from "../core/formatters";
import * as Formatters from "../core/formatters";
import { Point, SimpleSelection, SpaceRequest } from "../core/interfaces";
import * as Scales from "../scales";
import { IScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { Component } from "./component";

export class InterpolatedColorLegend extends Component {
  private static _DEFAULT_NUM_SWATCHES = 11;

  private _measurer: Typesettable.CacheMeasurer;
  private _wrapper: Typesettable.Wrapper;
  private _writer: Typesettable.Writer;
  private _scale: Scales.InterpolatedColor;
  private _orientation: String;
  private _textPadding = 5;
  private _formatter: Formatter;
  private _expands: boolean;

  private _swatchContainer: SimpleSelection<void>;
  private _swatchBoundingBox: SimpleSelection<void>;
  private _lowerLabel: SimpleSelection<void>;
  private _upperLabel: SimpleSelection<void>;
  private _redrawCallback: IScaleCallback<Scales.InterpolatedColor>;

  /**
   * The css class applied to the legend labels.
   */
  public static LEGEND_LABEL_CLASS = "legend-label";

  /**
   * Creates an InterpolatedColorLegend.
   *
   * The InterpolatedColorLegend consists of a sequence of swatches that show the
   * associated InterpolatedColor Scale sampled at various points.
   * Two labels show the maximum and minimum values of the InterpolatedColor Scale.
   *
   * @constructor
   * @param {Scales.InterpolatedColor} interpolatedColorScale
   */
  constructor(interpolatedColorScale: Scales.InterpolatedColor) {
    super();
    if (interpolatedColorScale == null) {
      throw new Error("InterpolatedColorLegend requires a interpolatedColorScale");
    }
    this._scale = interpolatedColorScale;
    this._redrawCallback = (scale) => this.redraw();
    this._scale.onUpdate(this._redrawCallback);
    this._formatter = Formatters.general();
    this._orientation = "horizontal";
    this._expands = false;

    this.addClass("legend");
    this.addClass("interpolated-color-legend");
  }

  public destroy() {
    super.destroy();
    this._scale.offUpdate(this._redrawCallback);
  }

  /**
   * Gets the Formatter for the labels.
   */
  public formatter(): Formatter;
  /**
   * Sets the Formatter for the labels.
   *
   * @param {Formatter} formatter
   * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
   */
  public formatter(formatter: Formatter): this;
  public formatter(formatter?: Formatter): any {
    if (formatter === undefined) {
      return this._formatter;
    }
    this._formatter = formatter;
    this.redraw();
    return this;
  }

  /**
   * Gets whether the InterpolatedColorLegend expands to occupy all offered space in the long direction
   */
  public expands(): boolean;
  /**
   * Sets whether the InterpolatedColorLegend expands to occupy all offered space in the long direction
   *
   * @param {expands} boolean
   * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
   */
  public expands(expands: boolean): this;
  public expands(expands?: boolean): any {
    if (expands == null) {
      return this._expands;
    }
    this._expands = expands;
    this.redraw();
    return this;
  }

  private static _ensureOrientation(orientation: string) {
    orientation = orientation.toLowerCase();
    if (orientation === "horizontal" || orientation === "left" || orientation === "right") {
      return orientation;
    } else {
      throw new Error("\"" + orientation + "\" is not a valid orientation for InterpolatedColorLegend");
    }
  }

  /**
   * Gets the orientation.
   */
  public orientation(): string;
  /**
   * Sets the orientation.
   *
   * @param {string} orientation One of "horizontal"/"left"/"right".
   * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
   */
  public orientation(orientation: string): this;
  public orientation(orientation?: string): any {
    if (orientation == null) {
      return this._orientation;
    } else {
      this._orientation = InterpolatedColorLegend._ensureOrientation(orientation);
      this.redraw();
      return this;
    }
  }

  public fixedWidth() {
    return !this.expands() || this._isVertical();
  }

  public fixedHeight() {
    return !this.expands() || !this._isVertical();
  }

  private _generateTicks(numSwatches = InterpolatedColorLegend._DEFAULT_NUM_SWATCHES) {
    const domain = this._scale.domain();
    if (numSwatches === 1) {
      return [domain[0]];
    }
    const slope = (domain[1] - domain[0]) / (numSwatches - 1);
    const ticks: number[] = [];
    for (let i = 0; i < numSwatches; i++) {
      ticks.push(domain[0] + slope * i);
    }
    return ticks;
  }

  protected _setup() {
    super._setup();

    this._swatchContainer = this.content().append("g").classed("swatch-container", true);
    this._swatchBoundingBox = this.content().append("rect").classed("swatch-bounding-box", true);
    this._lowerLabel = this.content().append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);
    this._upperLabel = this.content().append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);

    const context = new Typesettable.SvgContext(this.content().node() as SVGElement);
    this._measurer = new Typesettable.CacheMeasurer(context);
    this._wrapper = new Typesettable.Wrapper();
    this._writer = new Typesettable.Writer(this._measurer, context, this._wrapper);
  }

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    const textHeight = this._measurer.measure().height;
    const padding = textHeight;

    const domain = this._scale.domain();
    const labelWidths = domain.map((d: number) => this._measurer.measure(this._formatter(d)).width);

    let desiredHeight: number;
    let desiredWidth: number;
    const numSwatches = InterpolatedColorLegend._DEFAULT_NUM_SWATCHES;
    if (this._isVertical()) {
      const longestWidth = Utils.Math.max(labelWidths, 0);
      desiredWidth = padding + textHeight + this._textPadding + longestWidth + this._textPadding;
      desiredHeight = numSwatches * textHeight;
    } else {
      desiredHeight = padding + textHeight + padding;
      desiredWidth = this._textPadding + labelWidths[0] + numSwatches * textHeight
        + labelWidths[1] + this._textPadding;
    }

    return {
      minWidth: desiredWidth,
      minHeight: desiredHeight,
    };
  }

  private _isVertical() {
    return this._orientation !== "horizontal";
  }

  public renderImmediately() {
    super.renderImmediately();

    const domain = this._scale.domain();

    const text0 = this._formatter(domain[0]);
    const text0Width = this._measurer.measure(text0).width;
    const text1 = this._formatter(domain[1]);
    const text1Width = this._measurer.measure(text1).width;

    const textHeight = this._measurer.measure().height;
    const textPadding = this._textPadding;

    const upperLabelShift: Point = { x: 0, y: 0 };
    const lowerLabelShift: Point = { x: 0, y: 0 };
    const lowerWriteOptions = {
      xAlign: "center",
      yAlign: "center",
      textRotation: 0,
    } as Typesettable.IWriteOptions;
    const upperWriteOptions = {
      xAlign: "center",
      yAlign: "center",
      textRotation: 0,
    } as Typesettable.IWriteOptions;

    let swatchWidth: number;
    let swatchHeight: number;
    let swatchX: (d: any, i: number) => number;
    let swatchY: (d: any, i: number) => number;

    const boundingBoxAttr: { [key: string]: number } = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    let padding: number;
    let numSwatches: number;

    if (this._isVertical()) {
      numSwatches = Math.floor(this.height());
      const longestTextWidth = Math.max(text0Width, text1Width);
      padding = (this.width() - longestTextWidth - 2 * this._textPadding) / 2;
      swatchWidth = Math.max(this.width() - padding - 2 * textPadding - longestTextWidth, 0);
      swatchHeight = 1;
      swatchY = (d: any, i: number) => this.height() - (i + 1);

      upperWriteOptions.yAlign = "top";
      upperLabelShift.y = 0;
      lowerWriteOptions.yAlign = "bottom";
      lowerLabelShift.y = 0;

      if (this._orientation === "left") {
        swatchX = (d: any, i: number) => textPadding + longestTextWidth + textPadding;
        upperWriteOptions.xAlign = "right";
        upperLabelShift.x = -(padding + swatchWidth + textPadding);
        lowerWriteOptions.xAlign = "right";
        lowerLabelShift.x = -(padding + swatchWidth + textPadding);
      } else { // right
        swatchX = (d: any, i: number) => padding;
        upperWriteOptions.xAlign = "left";
        upperLabelShift.x = padding + swatchWidth + textPadding;
        lowerWriteOptions.xAlign = "left";
        lowerLabelShift.x = padding + swatchWidth + textPadding;
      }
      boundingBoxAttr["width"] = swatchWidth;
      boundingBoxAttr["height"] = numSwatches * swatchHeight;
    } else { // horizontal
      padding = Math.max(textPadding, (this.height() - textHeight) / 2);
      numSwatches = Math.max(Math.floor(this.width() - textPadding * 4 - text0Width - text1Width), 0);
      swatchWidth = 1;
      swatchHeight = Math.max((this.height() - 2 * padding), 0);
      swatchX = (d: any, i: number) => Math.floor(text0Width + 2 * textPadding) + i;
      swatchY = (d: any, i: number) => padding;

      upperWriteOptions.xAlign = "right";
      upperLabelShift.x = -textPadding;
      lowerWriteOptions.xAlign = "left";
      lowerLabelShift.x = textPadding;

      boundingBoxAttr["y"] = padding;
      boundingBoxAttr["width"] = numSwatches * swatchWidth;
      boundingBoxAttr["height"] = swatchHeight;
    }
    boundingBoxAttr["x"] = swatchX(null, 0); // position of the first swatch

    this._upperLabel.text(""); // clear the upper label
    this._writer.write(text1, this.width(), this.height(), upperWriteOptions, this._upperLabel.node());
    const upperTranslateString = "translate(" + upperLabelShift.x + ", " + upperLabelShift.y + ")";
    this._upperLabel.attr("transform", upperTranslateString);

    this._lowerLabel.text(""); // clear the lower label
    this._writer.write(text0, this.width(), this.height(), lowerWriteOptions, this._lowerLabel.node());
    const lowerTranslateString = "translate(" + lowerLabelShift.x + ", " + lowerLabelShift.y + ")";
    this._lowerLabel.attr("transform", lowerTranslateString);

    this._swatchBoundingBox.attrs(boundingBoxAttr);

    const ticks = this._generateTicks(numSwatches);
    const swatchesUpdate = this._swatchContainer.selectAll("rect.swatch").data(ticks);
    const rects = swatchesUpdate.enter().append("rect").classed("swatch", true);;
    const swatches = swatchesUpdate.merge(rects);
    swatchesUpdate.exit().remove();
    swatches.attrs({
      fill: (d: any, i: number) => this._scale.scale(d),
      width: swatchWidth,
      height: swatchHeight,
      x: swatchX,
      y: swatchY,
      "shape-rendering": "crispEdges",
    });
    if (Configs.ADD_TITLE_ELEMENTS) {
      rects.append("title").text((d) => this._formatter(d));
    }
    return this;
  }

}
