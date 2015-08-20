///<reference path="../reference.ts" />

module Plottable {

export interface DragLineCallback<D> { (dragLineLayer: Components.DragLineLayer<D>): void; };

export module Components {
  export class DragLineLayer<D> extends GuideLineLayer<D> {
    private _dragInteraction: Interactions.Drag;
    private _detectionRadius = 3;
    private _detectionEdge: d3.Selection<void>;
    private _enabled = true;

    private _dragStartCallbacks: Utils.CallbackSet<DragLineCallback<D>>;
    private _dragCallbacks: Utils.CallbackSet<DragLineCallback<D>>;
    private _dragEndCallbacks: Utils.CallbackSet<DragLineCallback<D>>;
    private _disconnectInteractionCallbacks: () => void;

    constructor(orientation: string) {
      super(orientation);
      this.addClass("drag-line-layer");
      this.addClass("enabled");

      this._dragInteraction = new Plottable.Interactions.Drag();
      this._dragInteraction.attachTo(this);

      let grabbedLine = (p: Point) => {
        return (this._isVertical() &&
                 p.x >= this.pixelPosition() - this.detectionRadius() &&
                 p.x <= this.pixelPosition() + this.detectionRadius()
               ) ||
               (
                 !this._isVertical() &&
                 p.y >= this.pixelPosition() - this.detectionRadius() &&
                 p.y <= this.pixelPosition() + this.detectionRadius()
               );
      };

      let dragging = false;
      let dragStartCallback = (start: Point) => {
        if (grabbedLine(start)) {
          dragging = true;
          this._dragStartCallbacks.callCallbacks(this);
        }
      };
      this._dragInteraction.onDragStart(dragStartCallback);
      let dragCallback = (start: Point, end: Point) => {
        if (dragging) {
          this._setPixelPositionWithoutChangingMode(this._isVertical() ? end.x : end.y);
          this._dragCallbacks.callCallbacks(this);
        }
      };
      this._dragInteraction.onDrag(dragCallback);
      let dragEndCallback = (start: Point, end: Point) => {
        if (dragging) {
          dragging = false;
          this._dragEndCallbacks.callCallbacks(this);
        }
      };
      this._dragInteraction.onDragEnd(dragEndCallback);

      this._disconnectInteractionCallbacks = () => {
        this._dragInteraction.offDragStart(dragStartCallback);
        this._dragInteraction.offDrag(dragCallback);
        this._dragInteraction.offDragEnd(dragEndCallback);
        delete this._disconnectInteractionCallbacks;
      };

      this._dragStartCallbacks = new Utils.CallbackSet<DragLineCallback<D>>();
      this._dragCallbacks = new Utils.CallbackSet<DragLineCallback<D>>();
      this._dragEndCallbacks = new Utils.CallbackSet<DragLineCallback<D>>();
    }

    protected _setup() {
      super._setup();
      this._detectionEdge = this.content().append("line").style({
                              opacity: 0,
                              fill: "pink",
                              "pointer-events": "visibleStroke"
                            }).classed("drag-edge", true);
    }

    public renderImmediately() {
      super.renderImmediately();
      this._detectionEdge.attr({
        x1: this._isVertical() ? this.pixelPosition() : 0,
        y1: this._isVertical() ? 0 : this.pixelPosition(),
        x2: this._isVertical() ? this.pixelPosition() : this.width(),
        y2: this._isVertical() ? this.height() : this.pixelPosition(),
        "stroke-width": this._detectionRadius * 2
      });

      return this;
    }
    /**
     * Gets the detection radius of the drag line in pixels.
     */
    public detectionRadius(): number;
    /**
     * Sets the detection radius of the drag line in pixels.
     *
     * @param {number} detectionRadius
     * @return {DragLineLayer<D>} The calling DragLineLayer.
     */
    public detectionRadius(detectionRadius: number): DragLineLayer<D>;
    public detectionRadius(detectionRadius?: number): any {
      if (detectionRadius == null) {
        return this._detectionRadius;
      }
      if (detectionRadius < 0) {
        throw new Error("detection radius cannot be negative.");
      }
      this._detectionRadius = detectionRadius;
      this.render();
      return this;
    }

    /**
     * Gets whether the DragLineLayer is enabled.
     */
    public enabled(): boolean;
    /**
     * Enables or disables the DragLineLayer.
     *
     * @param {boolean} enabled
     * @return {DragLineLayer<D>} The calling DragLineLayer.
     */
    public enabled(enabled: boolean): DragLineLayer<D>;
    public enabled(enabled?: boolean): any {
      if (enabled == null) {
        return this._enabled;
      }
      this._enabled = enabled;
      if (enabled) {
        this.addClass("enabled");
      } else {
        this.removeClass("enabled");
      }
      this._dragInteraction.enabled(enabled);
      return this;
    }

    /**
     * Sets the callback to be called when dragging starts.
     * The callback will be passed the calling DragLineLayer.
     *
     * @param {DragLineCallback<D>} callback
     * @returns {DragLineLayer<D>} The calling DragLineLayer.
     */
    public onDragStart(callback: DragLineCallback<D>) {
      this._dragStartCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called when dragging starts.
     *
     * @param {DragLineCallback<D>} callback
     * @returns {DragLineLayer<D>} The calling DragLineLayer.
     */
    public offDragStart(callback: DragLineCallback<D>) {
      this._dragStartCallbacks.delete(callback);
      return this;
    }

    /**
     * Sets a callback to be called during dragging.
     * The callback will be passed the calling DragLineLayer.
     *
     * @param {DragLineCallback<D>} callback
     * @returns {DragLineLayer<D>} The calling DragLineLayer.
     */
    public onDrag(callback: DragLineCallback<D>) {
      this._dragCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called during dragging.
     *
     * @param {DragLineCallback<D>} callback
     * @returns {DragLineLayer<D>} The calling DragLineLayer.
     */
    public offDrag(callback: DragLineCallback<D>) {
      this._dragCallbacks.delete(callback);
      return this;
    }

    /**
     * Sets a callback to be called when dragging ends.
     * The callback will be passed the calling DragLineLayer.
     *
     * @param {DragLineCallback<D>} callback
     * @returns {DragLineLayer<D>} The calling DragLineLayer.
     */
    public onDragEnd(callback: DragLineCallback<D>) {
      this._dragEndCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called when dragging ends.
     *
     * @param {DragLineCallback<D>} callback
     * @returns {DragLineLayer<D>} The calling DragLineLayer.
     */
    public offDragEnd(callback: DragLineCallback<D>) {
      this._dragEndCallbacks.delete(callback);
      return this;
    }

    public destroy() {
      super.destroy();
      this._dragStartCallbacks.forEach((callback) => this._dragStartCallbacks.delete(callback));
      this._dragCallbacks.forEach((callback) => this._dragCallbacks.delete(callback));
      this._dragEndCallbacks.forEach((callback) => this._dragEndCallbacks.delete(callback));
      this._disconnectInteractionCallbacks();
    }
  }
}
}
