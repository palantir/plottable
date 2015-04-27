///<reference path="../reference.ts" />

module Plottable {
export module Components {
  type _EdgeIndicator = {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  }

  export class DragBoxLayer extends Components.SelectionBoxLayer {
    private _dragInteraction: Interactions.Drag;
    private _detectionEdgeT: D3.Selection;
    private _detectionEdgeB: D3.Selection;
    private _detectionEdgeL: D3.Selection;
    private _detectionEdgeR: D3.Selection;
    private _detectionCornerTL: D3.Selection;
    private _detectionCornerTR: D3.Selection;
    private _detectionCornerBL: D3.Selection;
    private _detectionCornerBR: D3.Selection;

    private _detectionRadius = 3;
    private _resizable = false;
    protected _hasCorners = true;

    private _dragStartCallback: (b: Bounds) => any;
    private _dragCallback: (b: Bounds) => any;
    private _dragEndCallback: (b: Bounds) => any;

    constructor() {
      super();
      /*
       * Enable clipPath to hide _detectionEdge s and _detectionCorner s
       * that overlap with the edge of the DragBoxLayer. This prevents the
       * user's cursor from changing outside the DragBoxLayer, where they
       * wouldn't be able to grab the edges or corners for resizing.
       */
      this.clipPathEnabled = true;
      this.classed("drag-box-layer", true);

      this._dragInteraction = new Interactions.Drag();
      this._setUpCallbacks();
      this.registerInteraction(this._dragInteraction);
    }

    private _setUpCallbacks() {
      var resizingEdges: _EdgeIndicator;
      var topLeft: Point;
      var bottomRight: Point;
      var startedNewBox: boolean;

      this._dragInteraction.onDragStart((s: Point) => {
        resizingEdges = this._getResizingEdges(s);

        if (!this.boxVisible() ||
            (!resizingEdges.top && !resizingEdges.bottom &&
             !resizingEdges.left && !resizingEdges.right)
           ) {
          this.bounds({
            topLeft: s,
            bottomRight: s
          });
          startedNewBox = true;
        } else {
          startedNewBox = false;
        }

        this.boxVisible(true);
        var bounds = this.bounds();
        // copy points so changes to topLeft and bottomRight don't mutate bounds
        topLeft = { x: bounds.topLeft.x, y: bounds.topLeft.y };
        bottomRight = { x: bounds.bottomRight.x, y: bounds.bottomRight.y };
        if (this._dragStartCallback) {
          this._dragStartCallback(bounds);
        }
      });

      this._dragInteraction.onDrag((s: Point, e: Point) => {
        if (startedNewBox) {
          bottomRight.x = e.x;
          bottomRight.y = e.y;
        } else {
          if (resizingEdges.bottom) {
            bottomRight.y = e.y;
          } else if (resizingEdges.top) {
            topLeft.y = e.y;
          }

          if (resizingEdges.right) {
            bottomRight.x = e.x;
          } else if (resizingEdges.left) {
            topLeft.x = e.x;
          }
        }

        this.bounds({
          topLeft: topLeft,
          bottomRight: bottomRight
        });

        if (this._dragCallback) {
          this._dragCallback(this.bounds());
        }
      });

      this._dragInteraction.onDragEnd((s: Point, e: Point) => {
        if (startedNewBox && s.x === e.x && s.y === e.y) {
          this.boxVisible(false);
        }

        if (this._dragEndCallback) {
          this._dragEndCallback(this.bounds());
        }
      });
    }

    protected setup() {
      super.setup();

      var createLine = () => this._box.append("line").style({
                               "opacity": 0,
                               "stroke": "pink"
                             });
      this._detectionEdgeT = createLine().classed("drag-edge-tb", true);
      this._detectionEdgeB = createLine().classed("drag-edge-tb", true);
      this._detectionEdgeL = createLine().classed("drag-edge-lr", true);
      this._detectionEdgeR = createLine().classed("drag-edge-lr", true);

      if (this._hasCorners) {
        var createCorner = () => this._box.append("circle")
                                     .style({
                                       "opacity": 0,
                                       "fill": "pink"
                                     });
        this._detectionCornerTL = createCorner().classed("drag-corner-tl", true);
        this._detectionCornerTR = createCorner().classed("drag-corner-tr", true);
        this._detectionCornerBL = createCorner().classed("drag-corner-bl", true);
        this._detectionCornerBR = createCorner().classed("drag-corner-br", true);
      }
    }

    private _getResizingEdges(p: Point) {
      var edges = {
        top: false,
        bottom: false,
        left: false,
        right: false
      };

      if (!this.resizable()) {
        return edges;
      }

      var bounds = this.bounds();
      var t = bounds.topLeft.y;
      var b = bounds.bottomRight.y;
      var l = bounds.topLeft.x;
      var r = bounds.bottomRight.x;
      var rad = this._detectionRadius;

      if (l - rad <= p.x && p.x <= r + rad) {
        edges.top = (t - rad <= p.y && p.y <= t + rad);
        edges.bottom = (b - rad <= p.y && p.y <= b + rad);
      }

      if (t - rad <= p.y && p.y <= b + rad) {
        edges.left = (l - rad <= p.x && p.x <= l + rad);
        edges.right = (r - rad <= p.x && p.x <= r + rad);
      }

      return edges;
    }

    public doRender() {
      super.doRender();
      if (this.boxVisible()) {
        var bounds = this.bounds();
        var t = bounds.topLeft.y;
        var b = bounds.bottomRight.y;
        var l = bounds.topLeft.x;
        var r = bounds.bottomRight.x;

        this._detectionEdgeT.attr({
          x1: l, y1: t, x2: r, y2: t,
          "stroke-width": this._detectionRadius * 2
        });
        this._detectionEdgeB.attr({
          x1: l, y1: b, x2: r, y2: b,
          "stroke-width": this._detectionRadius * 2
        });
        this._detectionEdgeL.attr({
          x1: l, y1: t, x2: l, y2: b,
          "stroke-width": this._detectionRadius * 2
        });
        this._detectionEdgeR.attr({
          x1: r, y1: t, x2: r, y2: b,
          "stroke-width": this._detectionRadius * 2
        });

        if (this._hasCorners) {
          this._detectionCornerTL.attr({ cx: l, cy: t, r: this._detectionRadius });
          this._detectionCornerTR.attr({ cx: r, cy: t, r: this._detectionRadius });
          this._detectionCornerBL.attr({ cx: l, cy: b, r: this._detectionRadius });
          this._detectionCornerBR.attr({ cx: r, cy: b, r: this._detectionRadius });
        }
      }
    }

    /**
     * Gets the detection radius of the drag box.
     *
     * @return {number} The detection radius of the drag box.
     */
    public detectionRadius(): number;
    /**
     * Sets the detection radius of the drag box.
     *
     * @param {number} r The desired detection radius.
     * @return {DragBoxLayer} The calling DragBoxLayer.
     */
    public detectionRadius(r: number): DragBoxLayer;
    public detectionRadius(r?: number): any {
      if (r == null) {
        return this._detectionRadius;
      }
      if (r < 0) {
        throw new Error("detection radius cannot be negative.");
      }
      this._detectionRadius = r;
      this.render();
      return this;
    }

    /**
     * Gets whether or not the drag box is resizable.
     *
     * @return {boolean} Whether or not the drag box is resizable.
     */
    public resizable(): boolean;
    /**
     * Sets whether or not the drag box is resizable.
     *
     * @param {boolean} canResize Whether or not the drag box should be resizable.
     * @return {DragBoxLayer} The calling DragBoxLayer.
     */
    public resizable(canResize: boolean): DragBoxLayer;
    public resizable(canResize?: boolean): any {
      if (canResize == null) {
        return this._resizable;
      }
      this._resizable = canResize;
      this.setResizableClasses(canResize);
      return this;
    }

    // Sets resizable classes. Overridden by subclasses that only resize in one dimension.
    protected setResizableClasses(canResize: boolean) {
      this.classed("x-resizable", canResize);
      this.classed("y-resizable", canResize);
    }

    /**
     * Gets the callback that is called when dragging starts.
     *
     * @returns {(b: Bounds) => any} The callback called when dragging starts.
     */
    public onDragStart(): (b: Bounds) => any;
    /**
     * Sets the callback to be called when dragging starts.
     *
     * @param {(b: Bounds) => any} cb The callback to be called. Passed the current Bounds in pixels.
     * @returns {DragBoxLayer} The calling DragBoxLayer.
     */
    public onDragStart(cb: (b: Bounds) => any): DragBoxLayer;
    public onDragStart(cb?: (b: Bounds) => any): any {
      if (cb === undefined) {
        return this._dragStartCallback;
      } else {
        this._dragStartCallback = cb;
        return this;
      }
    }

    /**
     * Gets the callback that is called during dragging.
     *
     * @returns {(b: Bounds) => any} The callback called during dragging.
     */
    public onDrag(): (b: Bounds) => any;
    /**
     * Sets a callback to be called during dragging.
     *
     * @param {(b: Bounds) => any} cb The callback to be called. Passed the current Bounds in pixels.
     * @returns {DragBoxLayer} The calling DragBoxLayer.
     */
    public onDrag(cb: (b: Bounds) => any): DragBoxLayer;
    public onDrag(cb?: (b: Bounds) => any): any {
      if (cb === undefined) {
        return this._dragCallback;
      } else {
        this._dragCallback = cb;
        return this;
      }
    }

    /**
     * Gets the callback that is called when dragging ends.
     *
     * @returns {(b: Bounds) => any} The callback called when dragging ends.
     */
    public onDragEnd(): (b: Bounds) => any;
    /**
     * Sets a callback to be called when the dragging ends.
     *
     * @param {(b: Bounds) => any} cb The callback to be called. Passed the current Bounds in pixels.
     * @returns {DragBoxLayer} The calling DragBoxLayer.
     */
    public onDragEnd(cb: (b: Bounds) => any): DragBoxLayer;
    public onDragEnd(cb?: (b: Bounds) => any): any {
      if (cb === undefined) {
        return this._dragEndCallback;
      } else {
        this._dragEndCallback = cb;
        return this;
      }
    }

  }
}
}
