///<reference path="../reference.ts" />

module Plottable {
export module Entity {
  export class SelectionBox {
    private _parentNode: Element;
    private _box: D3.Selection;
    private _core: D3.Selection;
    private _edgeT: D3.Selection;
    private _edgeB: D3.Selection;
    private _edgeL: D3.Selection;
    private _edgeR: D3.Selection;
    private _cornerTL: D3.Selection;
    private _cornerTR: D3.Selection;
    private _cornerBL: D3.Selection;
    private _cornerBR: D3.Selection;

    private _topLeft: Point = { x: 0, y: 0 };
    private _bottomRight: Point = { x: 0, y: 0 };

    private _detectionRadius = 2;

    constructor(parent: D3.Selection) {
      this._parentNode = parent.node();
      this._box = parent.append("g").classed("selection-box", true).remove();
      this._core = this._box.append("rect").classed("selection-area", true);

      var createLine = () => this._box.append("line").style({
                               "opacity": 0,
                               "stroke": "pink",
                               "stroke-width": 2 * this._detectionRadius
                             });
      this._edgeT = createLine().classed("selection-edge-tb", true);
      this._edgeB = createLine().classed("selection-edge-tb", true);
      this._edgeL = createLine().classed("selection-edge-lr", true);
      this._edgeR = createLine().classed("selection-edge-lr", true);

      var createCorner = () => this._box.append("circle")
                                   .attr("r", this._detectionRadius)
                                   .style({
                                     "opacity": 0,
                                     "fill": "pink"
                                   });
      this._cornerTL = createCorner().classed("selection-corner-tl", true);
      this._cornerTR = createCorner().classed("selection-corner-tr", true);
      this._cornerBL = createCorner().classed("selection-corner-bl", true);
      this._cornerBR = createCorner().classed("selection-corner-br", true);
    }

    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): SelectionBox;
    public classed(cssClass: string, addClass?: boolean): any {
      if (addClass == null) {
        if (cssClass == null) {
          return false;
        } else {
          return this._box.classed(cssClass);
        }
      } else {
        if (cssClass != null) {
          this._box.classed(cssClass, addClass);
        }
        return this;
      }
    }

    public setBounds(topLeft: Point, bottomRight: Point) {
      this._topLeft = topLeft;
      this._bottomRight = bottomRight;
      var w = this._bottomRight.x - this._topLeft.x;
      var h = this._bottomRight.y - this._topLeft.y;

      this._core.attr({
        width: w, height: h
      });

      this._edgeT.attr({
        x1: 0, y1: 0, x2: w, y2: 0
      });
      this._edgeB.attr({
        x1: 0, y1: h, x2: w, y2: h
      });
      this._edgeL.attr({
        x1: 0, y1: 0, x2: 0, y2: h
      });
      this._edgeR.attr({
        x1: w, y1: 0, x2: w, y2: h
      });

      this._cornerTR.attr({ cx: w, cy: 0 });
      this._cornerBL.attr({ cx: 0, cy: h });
      this._cornerBR.attr({ cx: w, cy: h });

      this._box.attr("transform", "translate("+this._topLeft.x+", "+this._topLeft.y+")");
      this._parentNode.appendChild(this._box.node());
      return this;
    }

    public detectionRadius(): number;
    public detectionRadius(radius: number): SelectionBox;
    public detectionRadius(radius?: number): any {
      if (radius == null) {
        return this._detectionRadius;
      }
      if (radius < 0) {
        throw new Error("Detection radius cannot be negative.");
      }
      this._detectionRadius = radius;
      this._edgeT.style("stroke-width", 2 * this._detectionRadius);
      this._edgeB.style("stroke-width", 2 * this._detectionRadius);
      this._edgeL.style("stroke-width", 2 * this._detectionRadius);
      this._edgeR.style("stroke-width", 2 * this._detectionRadius);
      this._cornerTL.attr("r", this._detectionRadius);
      this._cornerTR.attr("r", this._detectionRadius);
      this._cornerBL.attr("r", this._detectionRadius);
      this._cornerBR.attr("r", this._detectionRadius);
    }

    public dismiss() {
      this._box.remove();
      return this;
    }
  }
}
}
