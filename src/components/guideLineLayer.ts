/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { Component } from "./component";

enum PropertyMode { VALUE, PIXEL }

export class GuideLineLayer<D> extends Component {
  public static ORIENTATION_VERTICAL = "vertical";
  public static ORIENTATION_HORIZONTAL = "horizontal";

  private _orientation: string;
  private _value: D;
  private _scale: QuantitativeScale<D>;
  private _pixelPosition: number;
  private _scaleUpdateCallback: ScaleCallback<QuantitativeScale<D>>;
  private _guideLine: SimpleSelection<void>;
  private _mode = PropertyMode.VALUE;

  constructor(orientation: string) {
    super();
    if (orientation !== GuideLineLayer.ORIENTATION_VERTICAL && orientation !== GuideLineLayer.ORIENTATION_HORIZONTAL) {
      throw new Error(orientation + " is not a valid orientation for GuideLineLayer");
    }
    this._orientation = orientation;
    this._clipPathEnabled = true;
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
    this._guideLine.attr({
      x1: this._isVertical() ? this.pixelPosition() : 0,
      y1: this._isVertical() ? 0 : this.pixelPosition(),
      x2: this._isVertical() ? this.pixelPosition() : this.width(),
      y2: this._isVertical() ? this.height() : this.pixelPosition(),
    });
    return this;
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
    let previousScale = this._scale;
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

  public destroy() {
    super.destroy();
    if (this.scale() != null) {
      this.scale().offUpdate(this._scaleUpdateCallback);
    }
  }
}
