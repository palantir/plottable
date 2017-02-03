import * as d3 from "d3";

import { Bounds, Point } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { Component } from "./component";

export enum PropertyMode { VALUE, PIXEL }

export class SelectionBoxLayer extends Component {
  protected _box: d3.Selection<void>;
  private _boxArea: d3.Selection<void>;
  private _boxVisible = false;
  private _boxBounds: Bounds = {
    topLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
  };
  private _xExtent: (number | { valueOf(): number })[];
  private _yExtent: (number | { valueOf(): number })[];
  private _xScale: QuantitativeScale<number | { valueOf(): number }>;
  private _yScale: QuantitativeScale<number | { valueOf(): number }>;
  private _adjustBoundsCallback: ScaleCallback<QuantitativeScale<number | { valueOf(): number }>>;
  protected _xBoundsMode = PropertyMode.PIXEL;
  protected _yBoundsMode = PropertyMode.PIXEL;

  constructor() {
    super();
    this.addClass("selection-box-layer");
    this._adjustBoundsCallback = () => {
      this.render();
    };
    this._clipPathEnabled = true;
    this._xExtent = [undefined, undefined];
    this._yExtent = [undefined, undefined];
  }

  protected _setup() {
    super._setup();

    this._box = this.content().append("g").classed("selection-box", true).remove();
    this._boxArea = this._box.append("rect").classed("selection-area", true);
  }

  protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
    return {
      width: availableWidth,
      height: availableHeight,
    };
  }

  /**
   * Gets the Bounds of the box.
   */
  public bounds(): Bounds;
  /**
   * Sets the Bounds of the box.
   *
   * @param {Bounds} newBounds
   * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
   */
  public bounds(newBounds: Bounds): this;
  public bounds(newBounds?: Bounds): any {
    if (newBounds == null) {
      return this._getBounds();
    }

    this._setBounds(newBounds);
    this._xBoundsMode = PropertyMode.PIXEL;
    this._yBoundsMode = PropertyMode.PIXEL;
    this.render();
    return this;
  }

  protected _setBounds(newBounds: Bounds) {
    let topLeft: Point = {
      x: Math.min(newBounds.topLeft.x, newBounds.bottomRight.x),
      y: Math.min(newBounds.topLeft.y, newBounds.bottomRight.y),
    };
    let bottomRight: Point = {
      x: Math.max(newBounds.topLeft.x, newBounds.bottomRight.x),
      y: Math.max(newBounds.topLeft.y, newBounds.bottomRight.y),
    };
    this._boxBounds = {
      topLeft: topLeft,
      bottomRight: bottomRight,
    };
  }

  private _getBounds(): Bounds {
    return {
      topLeft: {
        x: this._xBoundsMode === PropertyMode.PIXEL ?
          this._boxBounds.topLeft.x :
          (this._xScale == null ?
            0 :
            Math.min(this.xScale().scale(this.xExtent()[0]), this.xScale().scale(this.xExtent()[1]))),
        y: this._yBoundsMode === PropertyMode.PIXEL ?
          this._boxBounds.topLeft.y :
          (this._yScale == null ?
            0 :
            Math.min(this.yScale().scale(this.yExtent()[0]), this.yScale().scale(this.yExtent()[1]))),
      },
      bottomRight: {
        x: this._xBoundsMode === PropertyMode.PIXEL ?
          this._boxBounds.bottomRight.x :
          (this._xScale == null ?
            0 :
            Math.max(this.xScale().scale(this.xExtent()[0]), this.xScale().scale(this.xExtent()[1]))),
        y: this._yBoundsMode === PropertyMode.PIXEL ?
          this._boxBounds.bottomRight.y :
          (this._yScale == null ?
            0 :
            Math.max(this.yScale().scale(this.yExtent()[0]), this.yScale().scale(this.yExtent()[1]))),
      },
    };
  }

  public renderImmediately() {
    super.renderImmediately();
    if (this._boxVisible) {
      let bounds = this.bounds();
      let t = bounds.topLeft.y;
      let b = bounds.bottomRight.y;
      let l = bounds.topLeft.x;
      let r = bounds.bottomRight.x;

      if (!(Utils.Math.isValidNumber(t) &&
        Utils.Math.isValidNumber(b) &&
        Utils.Math.isValidNumber(l) &&
        Utils.Math.isValidNumber(r))) {
        throw new Error("bounds have not been properly set");
      }

      this._boxArea.attr({
        x: l, y: t, width: r - l, height: b - t,
      });
      (<Node> this.content().node()).appendChild(<Node> this._box.node());
    } else {
      this._box.remove();
    }
    return this;
  }

  /**
   * Gets whether the box is being shown.
   */
  public boxVisible(): boolean;
  /**
   * Shows or hides the selection box.
   *
   * @param {boolean} show Whether or not to show the box.
   * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
   */
  public boxVisible(show: boolean): this;
  public boxVisible(show?: boolean): any {
    if (show == null) {
      return this._boxVisible;
    }

    this._boxVisible = show;
    this.render();
    return this;
  }

  public fixedWidth() {
    return true;
  }

  public fixedHeight() {
    return true;
  }

  /**
   * Gets the x scale for this SelectionBoxLayer.
   */
  public xScale(): QuantitativeScale<number | { valueOf(): number }>;
  /**
   * Sets the x scale for this SelectionBoxLayer.
   *
   * @returns {SelectionBoxLayer} The calling SelectionBoxLayer.
   */
  public xScale(xScale: QuantitativeScale<number | { valueOf(): number }>): this;
  public xScale(xScale?: QuantitativeScale<number | { valueOf(): number }>): any {
    if (xScale == null) {
      return this._xScale;
    }
    if (this._xScale != null) {
      this._xScale.offUpdate(this._adjustBoundsCallback);
    }
    this._xScale = xScale;
    this._xBoundsMode = PropertyMode.VALUE;
    this._xScale.onUpdate(this._adjustBoundsCallback);
    this.render();
    return this;
  }

  /**
   * Gets the y scale for this SelectionBoxLayer.
   */
  public yScale(): QuantitativeScale<number | { valueOf(): number }>;
  /**
   * Sets the y scale for this SelectionBoxLayer.
   *
   * @returns {SelectionBoxLayer} The calling SelectionBoxLayer.
   */
  public yScale(yScale: QuantitativeScale<number | { valueOf(): number }>): this;
  public yScale(yScale?: QuantitativeScale<number | { valueOf(): number }>): any {
    if (yScale == null) {
      return this._yScale;
    }
    if (this._yScale != null) {
      this._yScale.offUpdate(this._adjustBoundsCallback);
    }
    this._yScale = yScale;
    this._yBoundsMode = PropertyMode.VALUE;
    this._yScale.onUpdate(this._adjustBoundsCallback);
    this.render();
    return this;
  }

  /**
   * Gets the data values backing the left and right edges of the box.
   *
   * Returns an undefined array if the edges are not backed by a scale.
   */
  public xExtent(): (number | { valueOf(): number })[];
  /**
   * Sets the data values backing the left and right edges of the box.
   */
  public xExtent(xExtent: (number | { valueOf(): number })[]): this;
  public xExtent(xExtent?: (number | { valueOf(): number })[]): any {
    // Explicit typing for Typescript 1.4
    if (xExtent == null) {
      return this._getXExtent();
    }
    this._setXExtent(xExtent);
    this._xBoundsMode = PropertyMode.VALUE;
    this.render();
    return this;
  }

  private _getXExtent(): (number | { valueOf(): number })[] {
    return this._xBoundsMode === PropertyMode.VALUE ?
      this._xExtent :
      (this._xScale == null ?
          [undefined, undefined] :
          [
            this._xScale.invert(this._boxBounds.topLeft.x),
            this._xScale.invert(this._boxBounds.bottomRight.x),
          ]
      );
  }

  protected _setXExtent(xExtent: (number | { valueOf(): number })[]) {
    this._xExtent = xExtent;
  }

  /**
   * Gets the data values backing the top and bottom edges of the box.
   *
   * Returns an undefined array if the edges are not backed by a scale.
   */
  public yExtent(): (number | { valueOf(): number })[];
  /**
   * Sets the data values backing the top and bottom edges of the box.
   */
  public yExtent(yExtent: (number | { valueOf(): number })[]): this;
  public yExtent(yExtent?: (number | { valueOf(): number })[]): any {
    // Explicit typing for Typescript 1.4
    if (yExtent == null) {
      return this._getYExtent();
    }
    this._setYExtent(yExtent);
    this._yBoundsMode = PropertyMode.VALUE;
    this.render();
    return this;
  }

  private _getYExtent(): (number | { valueOf(): number })[] {
    return this._yBoundsMode === PropertyMode.VALUE ?
      this._yExtent :
      (this._yScale == null ?
          [undefined, undefined] :
          [
            this._yScale.invert(this._boxBounds.topLeft.y),
            this._yScale.invert(this._boxBounds.bottomRight.y),
          ]
      );
  }

  protected _setYExtent(yExtent: (number | { valueOf(): number })[]) {
    this._yExtent = yExtent;
  }

  public destroy() {
    super.destroy();
    if (this._xScale != null) {
      this.xScale().offUpdate(this._adjustBoundsCallback);
    }
    if (this._yScale != null) {
      this.yScale().offUpdate(this._adjustBoundsCallback);
    }
  }
}
