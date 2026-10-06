/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Typesettable from "typesettable";

import { Point, SimpleSelection } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { IScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { Component, XAlignment, YAlignment } from "./component";

enum PropertyMode { VALUE, PIXEL }

export class GuideLineLayer<D> extends Component {
  public static ORIENTATION_VERTICAL = "vertical";
  public static ORIENTATION_HORIZONTAL = "horizontal";

  /**
   * Distance in pixels between the guide line and its label, and between the
   * label and the edge of the layer it is aligned against.
   */
  private static _DEFAULT_LABEL_PADDING_PX = 5;

  private _orientation: string;
  private _value: D;
  private _scale: QuantitativeScale<D>;
  private _pixelPosition: number;
  private _scaleUpdateCallback: IScaleCallback<QuantitativeScale<D>>;
  private _guideLine: SimpleSelection<void>;
  private _mode = PropertyMode.VALUE;

  private _label: string = null;
  private _labelPadding = GuideLineLayer._DEFAULT_LABEL_PADDING_PX;
  private _labelXAlignment: XAlignment = "right";
  private _labelYAlignment: YAlignment = "top";
  private _labelContainer: SimpleSelection<void>;
  private _measurer: Typesettable.CacheMeasurer;
  private _writer: Typesettable.Writer;

  constructor(orientation: string) {
    super();
    if (orientation !== GuideLineLayer.ORIENTATION_VERTICAL && orientation !== GuideLineLayer.ORIENTATION_HORIZONTAL) {
      throw new Error(orientation + " is not a valid orientation for GuideLineLayer");
    }
    this._orientation = orientation;
    this._overflowHidden = true;
    this.addClass("guide-line-layer");
    if (this._isVertical()) {
      this.addClass("vertical");
    } else {
      this.addClass("horizontal");
    }
    this._scaleUpdateCallback = () => {
      this._syncPixelPositionAndValue();
      this.render();
    };
  }

  protected _setup() {
    super._setup();
    this._guideLine = this.content().append("line").classed("guide-line", true);
    this._labelContainer = this.content().append("g").classed("guide-line-label", true);
    const context = new Typesettable.SvgContext(this._labelContainer.node() as SVGElement);
    this._measurer = new Typesettable.CacheMeasurer(context);
    this._writer = new Typesettable.Writer(this._measurer, context);
  }

  protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
    return {
      width: availableWidth,
      height: availableHeight,
    };
  }

  protected _isVertical() {
    return this._orientation === GuideLineLayer.ORIENTATION_VERTICAL;
  }

  public fixedWidth() {
    return true;
  }

  public fixedHeight() {
    return true;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    if (this.scale() != null) {
      if (this._isVertical()) {
        this.scale().range([0, this.width()]);
      } else {
        this.scale().range([this.height(), 0]);
      }
    }
    return this;
  }

  public renderImmediately() {
    super.renderImmediately();
    this._syncPixelPositionAndValue();
    this._guideLine.attrs({
      x1: this._isVertical() ? this.pixelPosition() : 0,
      y1: this._isVertical() ? 0 : this.pixelPosition(),
      x2: this._isVertical() ? this.pixelPosition() : this.width(),
      y2: this._isVertical() ? this.height() : this.pixelPosition(),
    });
    this._renderLabel();
    return this;
  }

  public invalidateCache() {
    super.invalidateCache();
    if (this._measurer != null) {
      this._measurer.reset();
    }
  }

  /**
   * Draws label() next to the guide line, positioned according to
   * labelXAlignment() and labelYAlignment().
   */
  private _renderLabel() {
    // HACKHACK Typesettable cannot remove its own content - #21 on Typesettable.
    this._labelContainer.selectAll("g").remove();
    if (this._label == null || this._label === "") {
      return;
    }
    if (!Utils.Math.isValidNumber(this.pixelPosition())) {
      // the guide line itself has nowhere to be drawn yet, so neither has its label
      return;
    }
    const { width: textWidth, height: textHeight } = this._measurer.measure(this._label);
    const { x, y } = this._labelOrigin(textWidth, textHeight);
    this._labelContainer.attr("transform", `translate(${x},${y})`);
    this._writer.write(this._label, textWidth, textHeight, { xAlign: "left", yAlign: "top" });
  }

  /**
   * Computes the top-left corner of the label's bounding box in the layer's
   * pixel space.
   *
   * Along the axis the guide line runs on, the alignment positions the label
   * within the bounds of the layer. Across that axis, it picks which side of
   * the guide line the label sits on.
   */
  private _labelOrigin(textWidth: number, textHeight: number): Point {
    const position = this.pixelPosition();
    const padding = this._labelPadding;

    const acrossVertical = { // vertical guide line: x picks a side of the line
      center: position - textWidth / 2,
      left: position - padding - textWidth,
      right: position + padding,
    };
    const alongHorizontal = { // vertical guide line: y slides along the line
      bottom: this.height() - padding - textHeight,
      center: (this.height() - textHeight) / 2,
      top: padding,
    };
    const alongVertical = { // horizontal guide line: x slides along the line
      center: (this.width() - textWidth) / 2,
      left: padding,
      right: this.width() - padding - textWidth,
    };
    const acrossHorizontal = { // horizontal guide line: y picks a side of the line
      bottom: position + padding,
      center: position - textHeight / 2,
      top: position - padding - textHeight,
    };

    return this._isVertical()
      ? { x: acrossVertical[this._labelXAlignment], y: alongHorizontal[this._labelYAlignment] }
      : { x: alongVertical[this._labelXAlignment], y: acrossHorizontal[this._labelYAlignment] };
  }

  // sets pixelPosition() or value() based on the other, depending on which was the last one set
  private _syncPixelPositionAndValue() {
    if (this.scale() == null) {
      return;
    }
    if (this._mode === PropertyMode.VALUE && this.value() != null) {
      this._pixelPosition = this.scale().scale(this.value());
    } else if (this._mode === PropertyMode.PIXEL && this.pixelPosition() != null) {
      this._value = this.scale().invert(this.pixelPosition());
    }
  }

  protected _setPixelPositionWithoutChangingMode(pixelPosition: number) {
    this._pixelPosition = pixelPosition;
    if (this.scale() != null) {
      this._value = this.scale().invert(this.pixelPosition());
    }
    this.render();
  }

  /**
   * Gets the QuantitativeScale on the GuideLineLayer.
   *
   * @return {QuantitativeScale<D>}
   */
  public scale(): QuantitativeScale<D>;
  /**
   * Sets the QuantitativeScale on the GuideLineLayer.
   * If value() was the last property set, pixelPosition() will be updated according to the new scale.
   * If pixelPosition() was the last property set, value() will be updated according to the new scale.
   *
   * @param {QuantitativeScale<D>} scale
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public scale(scale: QuantitativeScale<D>): this;
  public scale(scale?: QuantitativeScale<D>): any {
    if (scale == null) {
      return this._scale;
    }
    const previousScale = this._scale;
    if (previousScale != null) {
      previousScale.offUpdate(this._scaleUpdateCallback);
    }
    this._scale = scale;
    this._scale.onUpdate(this._scaleUpdateCallback);
    this._syncPixelPositionAndValue();
    this.redraw();
    return this;
  }

  /**
   * Gets the value of the guide line in data-space.
   *
   * @return {D}
   */
  public value(): D;
  /**
   * Sets the value of the guide line in data-space.
   * If the GuideLineLayer has a scale, pixelPosition() will be updated now and whenever the scale updates.
   *
   * @param {D} value
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public value(value: D): this;
  public value(value?: D): any {
    if (value == null) {
      return this._value;
    }
    this._value = value;
    this._mode = PropertyMode.VALUE;
    this._syncPixelPositionAndValue();
    this.render();
    return this;
  }

  /**
   * Gets the position of the guide line in pixel-space.
   *
   * @return {number}
   */
  public pixelPosition(): number;
  /**
   * Sets the position of the guide line in pixel-space.
   * If the GuideLineLayer has a scale, the value() will be updated now and whenever the scale updates.
   *
   * @param {number} pixelPosition
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public pixelPosition(pixelPosition: number): this;
  public pixelPosition(pixelPosition?: number): any {
    if (pixelPosition == null) {
      return this._pixelPosition;
    }
    if (!Utils.Math.isValidNumber(pixelPosition)) {
      throw new Error("pixelPosition must be a finite number");
    }
    this._pixelPosition = pixelPosition;
    this._mode = PropertyMode.PIXEL;
    this._syncPixelPositionAndValue();
    this.render();
    return this;
  }

  /**
   * Gets the text drawn next to the guide line.
   *
   * @return {string} The label text, or null if the GuideLineLayer has no label.
   */
  public label(): string;
  /**
   * Sets the text drawn next to the guide line.
   *
   * Pass null or "" to remove the label. Use labelXAlignment() and
   * labelYAlignment() to position it.
   *
   * @param {string} label
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public label(label: string): this;
  public label(label?: string): any {
    // unlike other properties, null is a meaningful value here (it clears the
    // label), so only `undefined` selects the getter
    if (label === undefined) {
      return this._label;
    }
    if (label !== null && typeof label !== "string") {
      throw new Error("label must be a string or null");
    }
    this._label = label;
    this.render();
    return this;
  }

  /**
   * Gets the space in pixels between the label and the guide line.
   *
   * @return {number}
   */
  public labelPadding(): number;
  /**
   * Sets the space in pixels between the label and the guide line, and between
   * the label and the edge of the layer it is aligned against.
   *
   * @param {number} labelPadding
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public labelPadding(labelPadding: number): this;
  public labelPadding(labelPadding?: number): any {
    if (labelPadding == null) {
      return this._labelPadding;
    }
    if (!Utils.Math.isValidNumber(labelPadding) || labelPadding < 0) {
      throw new Error("labelPadding must be a finite non-negative number");
    }
    this._labelPadding = labelPadding;
    this.render();
    return this;
  }

  /**
   * Gets the horizontal placement of the label.
   *
   * @return {string} One of "left"/"center"/"right".
   */
  public labelXAlignment(): XAlignment;
  /**
   * Sets the horizontal placement of the label.
   *
   * On a vertical GuideLineLayer this picks the side of the guide line the
   * label sits on: "left" puts it before the line, "right" after it, and
   * "center" straddles it. On a horizontal GuideLineLayer it slides the label
   * along the line, between the left and right edges of the layer.
   *
   * This is independent of xAlignment(), which positions the GuideLineLayer
   * itself within its parent and has no effect on a layer that always fills
   * the space offered to it.
   *
   * @param {string} labelXAlignment One of "left"/"center"/"right".
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public labelXAlignment(labelXAlignment: XAlignment): this;
  public labelXAlignment(labelXAlignment?: XAlignment): any {
    if (labelXAlignment == null) {
      return this._labelXAlignment;
    }
    const alignment = labelXAlignment.toLowerCase() as XAlignment;
    if (XAlignment[alignment] !== alignment) {
      throw new Error("Unsupported alignment: " + labelXAlignment);
    }
    this._labelXAlignment = alignment;
    this.render();
    return this;
  }

  /**
   * Gets the vertical placement of the label.
   *
   * @return {string} One of "top"/"center"/"bottom".
   */
  public labelYAlignment(): YAlignment;
  /**
   * Sets the vertical placement of the label.
   *
   * On a horizontal GuideLineLayer this picks the side of the guide line the
   * label sits on: "top" puts it above the line, "bottom" below it, and
   * "center" straddles it. On a vertical GuideLineLayer it slides the label
   * along the line, between the top and bottom edges of the layer.
   *
   * This is independent of yAlignment(), which positions the GuideLineLayer
   * itself within its parent and has no effect on a layer that always fills
   * the space offered to it.
   *
   * @param {string} labelYAlignment One of "top"/"center"/"bottom".
   * @return {GuideLineLayer<D>} The calling GuideLineLayer.
   */
  public labelYAlignment(labelYAlignment: YAlignment): this;
  public labelYAlignment(labelYAlignment?: YAlignment): any {
    if (labelYAlignment == null) {
      return this._labelYAlignment;
    }
    const alignment = labelYAlignment.toLowerCase() as YAlignment;
    if (YAlignment[alignment] !== alignment) {
      throw new Error("Unsupported alignment: " + labelYAlignment);
    }
    this._labelYAlignment = alignment;
    this.render();
    return this;
  }

  public destroy() {
    super.destroy();
    if (this.scale() != null) {
      this.scale().offUpdate(this._scaleUpdateCallback);
    }
  }
}
