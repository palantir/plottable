/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Typesettable from "typesettable";

import { SimpleSelection, SpaceRequest } from "../core/interfaces";

import { Component } from "./component";

export type LabelFontSizePx = 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

export class Label extends Component {
  public static _MIN_FONT_SIZE_PX: LabelFontSizePx = 12;
  public static _MAX_FONT_SIZE_PX: LabelFontSizePx = 24;
  public static _DEFAULT_FONT_SIZE_PX: LabelFontSizePx = 12;

  protected _textContainer: SimpleSelection<void>;
  protected _text: string; // text assigned to the Label; may not be the actual text displayed due to truncation
  protected _angle: number;
  protected _measurer: Typesettable.CacheMeasurer;
  protected _wrapper: Typesettable.Wrapper;
  protected _writer: Typesettable.Writer;
  protected _padding: number;

  /**
   * A Label is a Component that displays a single line of text.
   *
   * @constructor
   * @param {string} [displayText=""] The text of the Label.
   * @param {number} [angle=0] The angle of the Label in degrees (-90/0/90). 0 is horizontal.
   */
  constructor(displayText = "", angle = 0) {
    super();
    this.addClass("label");
    this.text(displayText);
    this.angle(angle);
    this.xAlignment("center").yAlignment("center");
    this._padding = 0;
  }

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    const desiredWH = this._measurer.measure(this._text);
    const desiredWidth = (this.angle() === 0 ? desiredWH.width : desiredWH.height) + 2 * this.padding();
    const desiredHeight = (this.angle() === 0 ? desiredWH.height : desiredWH.width) + 2 * this.padding();
    return {
      minWidth: desiredWidth,
      minHeight: desiredHeight,
    };
  }

  protected _setup() {
    super._setup();
    this._textContainer = this.content().append("g");
    const context = new Typesettable.SvgContext(this._textContainer.node() as SVGElement);
    this._measurer = new Typesettable.CacheMeasurer(context);
    this._wrapper = new Typesettable.Wrapper();
    this._writer = new Typesettable.Writer(this._measurer, context, this._wrapper);
    this.text(this._text);
  }

  /**
   * Gets the Label's text.
   */
  public text(): string;
  /**
   * Sets the Label's text.
   *
   * @param {string} displayText
   * @returns {Label} The calling Label.
   */
  public text(displayText: string): this;
  public text(displayText?: string): any {
    if (displayText == null) {
      return this._text;
    } else {
      if (typeof displayText !== "string") {
        throw new Error("Label.text() only takes strings as input");
      }
      this._text = displayText;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the angle of the Label in degrees.
   */
  public angle(): number;
  /**
   * Sets the angle of the Label in degrees.
   *
   * @param {number} angle One of -90/0/90. 0 is horizontal.
   * @returns {Label} The calling Label.
   */
  public angle(angle: number): this;
  public angle(angle?: number): any {
    if (angle == null) {
      return this._angle;
    } else {
      angle %= 360;
      if (angle > 180) {
        angle -= 360;
      } else if (angle < -180) {
        angle += 360;
      }
      if (angle === -90 || angle === 0 || angle === 90) {
        this._angle = angle;
      } else {
        throw new Error(angle + " is not a valid angle for Label");
      }
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the amount of padding around the Label in pixels.
   */
  public padding(): number;
  /**
   * Sets the amount of padding around the Label in pixels.
   *
   * @param {number} padAmount
   * @returns {Label} The calling Label.
   */
  public padding(padAmount: number): this;
  public padding(padAmount?: number): any {
    if (padAmount == null) {
      return this._padding;
    } else {
      padAmount = +padAmount;
      if (padAmount < 0) {
        throw new Error(padAmount + " is not a valid padding value. Cannot be less than 0.");
      }
      this._padding = padAmount;
      this.redraw();
      return this;
    }
  }

  public fixedWidth() {
    return true;
  }

  public fixedHeight() {
    return true;
  }

  public renderImmediately() {
    super.renderImmediately();
    // HACKHACK Typesettable.remove existing content - #21 on Typesettable.
    this._textContainer.selectAll("g").remove();
    const textMeasurement = this._measurer.measure(this._text);
    const heightPadding = Math.max(Math.min((this.height() - textMeasurement.height) / 2, this.padding()), 0);
    const widthPadding = Math.max(Math.min((this.width() - textMeasurement.width) / 2, this.padding()), 0);
    this._textContainer.attr("transform", "translate(" + widthPadding + "," + heightPadding + ")");
    const writeWidth = this.width() - 2 * widthPadding;
    const writeHeight = this.height() - 2 * heightPadding;
    const writeOptions = {
      xAlign: this.xAlignment() as Typesettable.IXAlign,
      yAlign: this.yAlignment() as Typesettable.IYAlign,
      textRotation: this.angle(),
    };
    this._writer.write(this._text, writeWidth, writeHeight, writeOptions);
    return this;
  }

  public invalidateCache() {
    super.invalidateCache();
    this._measurer.reset();
  }
}

export class TitleLabel extends Label {
  public static TITLE_LABEL_CLASS = "title-label";

  /**
   * @constructor
   * @param {string} [text]
   * @param {number} [angle] One of -90/0/90. 0 is horizontal.
   */
  constructor(text?: string, angle?: number) {
    super(text, angle);
    this.addClass(TitleLabel.TITLE_LABEL_CLASS);
  }
}

export class AxisLabel extends Label {
  public static AXIS_LABEL_CLASS = "axis-label";

  /**
   * @constructor
   * @param {string} [text]
   * @param {number} [angle] One of -90/0/90. 0 is horizontal.
   */
  constructor(text?: string, angle?: number) {
    super(text, angle);
    this.addClass(AxisLabel.AXIS_LABEL_CLASS);
  }
}
