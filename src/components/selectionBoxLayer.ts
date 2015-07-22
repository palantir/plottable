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
    private _xScale: QuantitativeScale<any>;
    private _yScale: QuantitativeScale<any>;
    private _renderCallback: ScaleCallback<QuantitativeScale<any>>;

    constructor() {
      super();
      this.addClass("selection-box-layer");
      this._renderCallback = () => this.render();
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
      var topLeft: Point = {
        x: Math.min(newBounds.topLeft.x, newBounds.bottomRight.x),
        y: Math.min(newBounds.topLeft.y, newBounds.bottomRight.y)
      };
      var bottomRight: Point = {
        x: Math.max(newBounds.topLeft.x, newBounds.bottomRight.x),
        y: Math.max(newBounds.topLeft.y, newBounds.bottomRight.y)
      };
      this._boxBounds = {
        topLeft: topLeft,
        bottomRight: bottomRight
      };
    }

    public renderImmediately() {
      if (this._boxVisible) {
        var scaledBoxBounds = this._scaledBoxBounds();
        var t = scaledBoxBounds.topLeft.y;
        var b = scaledBoxBounds.bottomRight.y;
        var l = scaledBoxBounds.topLeft.x;
        var r = scaledBoxBounds.bottomRight.x;

        this._boxArea.attr({
          x: l, y: t, width: r - l, height: b - t
        });
        (<Node> this.content().node()).appendChild(<Node> this._box.node());
      } else {
        this._box.remove();
      }
      return this;
    }

    private _scaledBoxBounds() {
      var scalePoint = (point: Point) => {
        return {
          x: this._xScale ? this._xScale.scale(point.x) : point.x,
          y: this._yScale ? this._yScale.scale(point.x) : point.y
        };
      };
      var scaledBoxBounds = {
        topLeft: scalePoint(this._boxBounds.topLeft),
        bottomRight: scalePoint(this._boxBounds.bottomRight)
      };
      return {
        topLeft: {
          x: Math.min(scaledBoxBounds.topLeft.x, scaledBoxBounds.bottomRight.x),
          y: Math.min(scaledBoxBounds.topLeft.y, scaledBoxBounds.bottomRight.y)
        },
        bottomRight: {
          x: Math.max(scaledBoxBounds.topLeft.x, scaledBoxBounds.bottomRight.x),
          y: Math.max(scaledBoxBounds.topLeft.y, scaledBoxBounds.bottomRight.y)
        }
      };
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

    public xScale(): QuantitativeScale<any>;
    public xScale(xScale: QuantitativeScale<any>): SelectionBoxLayer;
    public xScale(xScale?: QuantitativeScale<any>): any {
      if (xScale == null) {
        return this._xScale;
      }
      this._xScale = xScale;
      xScale.onUpdate(this._renderCallback);
      return this;
    }

    public yScale(): QuantitativeScale<any>;
    public yScale(yScale: QuantitativeScale<any>): SelectionBoxLayer;
    public yScale(yScale?: QuantitativeScale<any>): any {
      if (yScale == null) {
        return this._yScale;
      }
      this._yScale = yScale;
      yScale.onUpdate(this._renderCallback);
      return this;
    }
  }
}
}
