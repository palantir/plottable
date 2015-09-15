///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class SelectionBoxLayer extends Component {
    protected _box: d3.Selection<void>;
    private _boxArea: d3.Selection<void>;
    private _boxVisible = false;
    private _boxBounds: Bounds = {
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 }
    };
    private _boxLeftDataValue: number | { valueOf(): number };
    private _boxRightDataValue: number | { valueOf(): number };
    private _boxTopDataValue: number | { valueOf(): number };
    private _boxBottomDataValue: number | { valueOf(): number };
    private _xScale: QuantitativeScale<number | { valueOf(): number }>;
    private _yScale: QuantitativeScale<number | { valueOf(): number }>;
    private _adjustBoundsCallback: ScaleCallback<QuantitativeScale<number | { valueOf(): number }>>;

    constructor() {
      super();
      this.addClass("selection-box-layer");
      this._adjustBoundsCallback = () => {
        this.bounds({
          topLeft: {
            x: this._xScale ? this._xScale.scale(this._boxLeftDataValue) : this._boxBounds.topLeft.x,
            y: this._yScale ? this._yScale.scale(this._boxTopDataValue) : this._boxBounds.topLeft.y
          },
          bottomRight: {
            x: this._xScale ? this._xScale.scale(this._boxRightDataValue) : this._boxBounds.bottomRight.x,
            y: this._yScale ? this._yScale.scale(this._boxBottomDataValue) : this._boxBounds.bottomRight.y
          }
        });
      };
    }

    protected _setup() {
      super._setup();

      this._box = this.content().append("g").classed("selection-box", true).remove();
      this._boxArea = this._box.append("rect").classed("selection-area", true);
    }

    protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
      return {
        width: availableWidth,
        height: availableHeight
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
    public bounds(newBounds: Bounds): SelectionBoxLayer;
    public bounds(newBounds?: Bounds): any {
      if (newBounds == null) {
        return this._boxBounds;
      }

      this._setBounds(newBounds);
      this.render();
      return this;
    }

    protected _setBounds(newBounds: Bounds) {
      let topLeft: Point = {
        x: Math.min(newBounds.topLeft.x, newBounds.bottomRight.x),
        y: Math.min(newBounds.topLeft.y, newBounds.bottomRight.y)
      };
      let bottomRight: Point = {
        x: Math.max(newBounds.topLeft.x, newBounds.bottomRight.x),
        y: Math.max(newBounds.topLeft.y, newBounds.bottomRight.y)
      };
      this._boxBounds = {
        topLeft: topLeft,
        bottomRight: bottomRight
      };
      this._bindBoxDataValues();
    }

    public renderImmediately() {
      super.renderImmediately();
      if (this._boxVisible) {
        let t = this._boxBounds.topLeft.y;
        let b = this._boxBounds.bottomRight.y;
        let l = this._boxBounds.topLeft.x;
        let r = this._boxBounds.bottomRight.x;

        this._boxArea.attr({
          x: l, y: t, width: r - l, height: b - t
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
    public boxVisible(show: boolean): SelectionBoxLayer;
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
    public xScale(xScale: QuantitativeScale<number | { valueOf(): number }>): SelectionBoxLayer;
    public xScale(xScale?: QuantitativeScale<number | { valueOf(): number }>): any {
      if (xScale == null) {
        return this._xScale;
      }
      if (this._xScale != null) {
        this._xScale.offUpdate(this._adjustBoundsCallback);
      }
      this._xScale = xScale;
      this._xScale.onUpdate(this._adjustBoundsCallback);
      this._bindBoxDataValues();
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
    public yScale(yScale: QuantitativeScale<number | { valueOf(): number }>): SelectionBoxLayer;
    public yScale(yScale?: QuantitativeScale<number | { valueOf(): number }>): any {
      if (yScale == null) {
        return this._yScale;
      }
      if (this._yScale != null) {
        this._yScale.offUpdate(this._adjustBoundsCallback);
      }
      this._yScale = yScale;
      this._yScale.onUpdate(this._adjustBoundsCallback);
      this._bindBoxDataValues();
      return this;
    }

    /**
     * Gets the data values backing the left and right edges of the box.
     *
     * Returns an undefined array if the edges are not backed by a scale.
     */
    public xExtent(): (number | { valueOf(): number })[] {
      // Explicit typing for Typescript 1.4
      return [this._boxLeftDataValue, this._boxRightDataValue];
    }

    /**
     * Gets the data values backing the top and bottom edges of the box.
     *
     * Returns an undefined array if the edges are not backed by a scale.
     */
    public yExtent(): (number | { valueOf(): number })[] {
      // Explicit typing for Typescript 1.4
      return [this._boxTopDataValue, this._boxBottomDataValue];
    }

    private _bindBoxDataValues() {
      this._boxLeftDataValue = this._xScale ? this._xScale.invert(this._boxBounds.topLeft.x) : null;
      this._boxTopDataValue = this._yScale ? this._yScale.invert(this._boxBounds.topLeft.y) : null;
      this._boxRightDataValue = this._xScale ? this._xScale.invert(this._boxBounds.bottomRight.x) : null;
      this._boxBottomDataValue = this._yScale ? this._yScale.invert(this._boxBounds.bottomRight.y) : null;
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
}
}
