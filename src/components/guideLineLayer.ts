///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class GuideLineLayer<D> extends Component {
    public static ORIENTATION_VERTICAL = "vertical";
    public static ORIENTATION_HORIZONTAL = "horizontal";

    private _orientation: string;
    private _value: D;
    private _scale: QuantitativeScale<D>;
    private _pixelPosition: number;
    private _scaleUpdateCallback = () => {
      this._updatePixelPosition();
      this.render();
    };
    private _line: d3.Selection<void>;

    constructor(orientation: string) {
      super();
      if (orientation !== GuideLineLayer.ORIENTATION_VERTICAL && orientation !== GuideLineLayer.ORIENTATION_HORIZONTAL) {
        throw new Error(orientation + " is not a valid orientation for GuideLineLayer");
      }
      this._orientation = orientation;
      this._clipPathEnabled = true;
      this.addClass("guide-line-layer");
    }

    protected _setup() {
      super._setup();
      this._line = this.content().append("line").classed("guide-line", true);
    }

    protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
      return {
        width: availableWidth,
        height: availableHeight
      };
    }

    private _isVertical() {
      return this._orientation === GuideLineLayer.ORIENTATION_VERTICAL;
    }

    public fixedWidth() {
      return true;
    }

    public fixedHeight() {
      return true;
    }

    public renderImmediately() {
      super.renderImmediately();
      this._updatePixelPosition();
      this._line.attr({
        x1: this._isVertical() ? this.pixelPosition() : 0,
        y1: this._isVertical() ? 0 : this.pixelPosition(),
        x2: this._isVertical() ? this.pixelPosition() : this.width(),
        y2: this._isVertical() ? this.height() : this.pixelPosition()
      });
      return this;
    }

    private _updatePixelPosition() {
      if (this.scale() != null && this.value() != null) {
        this._pixelPosition = this.scale().scale(this.value());
      }
    }

    /**
     * Gets the QuantitativeScale on the GuideLineLayer.
     *
     * @return {QuantitativeScale<D>}
     */
    public scale(): QuantitativeScale<D>;
    /**
     * Sets the QuantitativeScale on the GuideLineLayer.
     * If the value of the guide line in data-space has been set,
     * the position of the guide line in pixel-space will be updated.
     *
     * @param {QuantitativeScale<D>} scale
     * @return {GuideLineLayer<D>} The calling GuideLineLayer.
     */
    public scale(scale: QuantitativeScale<D>): GuideLineLayer<D>;
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
      this._updatePixelPosition();
      this.render();
      return this;
    }

    /**
     * Gets the position of the guide line in data-space.
     *
     * @return {D}
     */
    public value(): D;
    /**
     * Sets the position of the guide line in data-space.
     * If the GuideLineLayer has a scale, the position of the line
     * in pixel-space will be updated accordingly.
     *
     * @param {D} value
     * @return {GuideLineLayer<D>} The calling GuideLineLayer.
     */
    public value(value: D): GuideLineLayer<D>;
    public value(value?: D): any {
      if (value == null) {
        return this._value;
      }
      this._value = value;
      this._updatePixelPosition();
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
     * If the GuideLineLayer has a scale, the position of the line
     * in data-space will be updated accordingly.
     *
     * @param {number} pixelPosition
     * @return {GuideLineLayer<D>} The calling GuideLineLayer.
     */
    public pixelPosition(pixelPosition: number): GuideLineLayer<D>;
    public pixelPosition(pixelPosition?: number): any {
      if (pixelPosition == null) {
        return this._pixelPosition;
      }
      this._pixelPosition = pixelPosition;
      if (this.scale() != null) {
        this._value = this.scale().invert(pixelPosition);
      }
      this.render();
      return this;
    }
  }
}
}
