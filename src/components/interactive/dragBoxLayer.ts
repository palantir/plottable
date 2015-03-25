///<reference path="../../reference.ts" />

module Plottable {
export module Component {
  export module Interactive {
    type _EdgeIndicator = {
      top: boolean;
      bottom: boolean;
      left: boolean;
      right: boolean;
    }

    export class DragBoxLayer extends Component.SelectionBoxLayer {
      private _dragInteraction: Interaction.Drag;
      private _boxEdgeT: D3.Selection;
      private _boxEdgeB: D3.Selection;
      private _boxEdgeL: D3.Selection;
      private _boxEdgeR: D3.Selection;
      private _boxCornerTL: D3.Selection;
      private _boxCornerTR: D3.Selection;
      private _boxCornerBL: D3.Selection;
      private _boxCornerBR: D3.Selection;
      private _detectionRadius = 3;

      private _xResizable = false;
      private _yResizable = false;
      private _grabbedEdges: _EdgeIndicator;
      private _initTL: Point;
      private _initBR: Point;

      constructor() {
        super();
        this.classed("drag-box-layer", true);

        this._dragInteraction = new Interaction.Drag();

        this._dragInteraction.onDragStart((s: Point) => {
          this.boxVisible(true);

          this._grabbedEdges = this._getEdges(s);
          if (!this._yResizable) {
            this._grabbedEdges.top = false;
            this._grabbedEdges.bottom = false;
          }
          if (!this._xResizable) {
            this._grabbedEdges.left = false;
            this._grabbedEdges.right = false;
          }

          if (!this._grabbedEdges.top && !this._grabbedEdges.bottom &&
              !this._grabbedEdges.left && !this._grabbedEdges.right) {
            this.bounds({
              topLeft: s,
              bottomRight: s
            });
            this._grabbedEdges.bottom = true;
            this._grabbedEdges.right = true;
          }
          var bounds = this.bounds();
          this._initTL = bounds.topLeft;
          this._initBR = bounds.bottomRight;
        });

        this._dragInteraction.onDrag((s: Point, e: Point) => {
          var topLeft = this._initTL;
          var bottomRight = this._initBR;

          if (this._grabbedEdges.bottom) {
            bottomRight.y = e.y;
          } else if (this._grabbedEdges.top) {
            topLeft.y = e.y;
          }

          if (this._grabbedEdges.right) {
            bottomRight.x = e.x;
          } else if (this._grabbedEdges.left) {
            topLeft.x = e.x;
          }

          this.bounds({
            topLeft: topLeft,
            bottomRight: bottomRight
          });
        });

        this._dragInteraction.onDragEnd((s: Point, e: Point) => {
          if (s.x === e.x && s.y === e.y) {
            this.boxVisible(false);
          }
        });

        this.registerInteraction(this._dragInteraction);
      }

      protected _setup() {
        super._setup();

        var createLine = () => this._box.append("line").style({
                                 "opacity": 0,
                                 "stroke": "pink"
                               });
        this._boxEdgeT = createLine().classed("drag-edge-tb", true);
        this._boxEdgeB = createLine().classed("drag-edge-tb", true);
        this._boxEdgeL = createLine().classed("drag-edge-lr", true);
        this._boxEdgeR = createLine().classed("drag-edge-lr", true);

        var createCorner = () => this._box.append("circle")
                                     .style({
                                       "opacity": 0,
                                       "fill": "pink"
                                     });
        this._boxCornerTL = createCorner().classed("drag-corner-tl", true);
        this._boxCornerTR = createCorner().classed("drag-corner-tr", true);
        this._boxCornerBL = createCorner().classed("drag-corner-bl", true);
        this._boxCornerBR = createCorner().classed("drag-corner-br", true);

        this.detectionRadius(this._detectionRadius);
      }

      private _getEdges(p: Point) {
        var edges = {
          top: false,
          bottom: false,
          left: false,
          right: false
        };

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

      public _doRender() {
        super._doRender();
        if (this.boxVisible()) {
          var bounds = this.bounds();
          var t = bounds.topLeft.y;
          var b = bounds.bottomRight.y;
          var l = bounds.topLeft.x;
          var r = bounds.bottomRight.x;

          this._boxEdgeT.attr({
            x1: l, y1: t, x2: r, y2: t
          });
          this._boxEdgeB.attr({
            x1: l, y1: b, x2: r, y2: b
          });
          this._boxEdgeL.attr({
            x1: l, y1: t, x2: l, y2: b
          });
          this._boxEdgeR.attr({
            x1: r, y1: t, x2: r, y2: b
          });

          this._boxCornerTL.attr({ cx: l, cy: t });
          this._boxCornerTR.attr({ cx: r, cy: t });
          this._boxCornerBL.attr({ cx: l, cy: b });
          this._boxCornerBR.attr({ cx: r, cy: b });
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
        if (this._isSetup) {
          this._boxEdgeT.style("stroke-width", this._detectionRadius * 2);
          this._boxEdgeB.style("stroke-width", this._detectionRadius * 2);
          this._boxEdgeL.style("stroke-width", this._detectionRadius * 2);
          this._boxEdgeR.style("stroke-width", this._detectionRadius * 2);
          this._boxCornerTL.attr("r", this._detectionRadius);
          this._boxCornerTR.attr("r", this._detectionRadius);
          this._boxCornerBL.attr("r", this._detectionRadius);
          this._boxCornerBR.attr("r", this._detectionRadius);
        }
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
          return this._xResizable || this._yResizable;
        }
        this._setResizable(canResize);
        this.classed("x-resizable", this._xResizable);
        this.classed("y-resizable", this._yResizable);
      }

      protected _setResizable(canResize: boolean) {
        this._xResizable = canResize;
        this._yResizable = canResize;
      }
    }
  }
}
}
