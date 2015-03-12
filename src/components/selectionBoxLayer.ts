///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class SelectionBoxLayer extends AbstractComponent {
    private _box: D3.Selection;
    private _boxArea: D3.Selection;
    private _boxEdgeT: D3.Selection;
    private _boxEdgeB: D3.Selection;
    private _boxEdgeL: D3.Selection;
    private _boxEdgeR: D3.Selection;
    private _boxCornerTL: D3.Selection;
    private _boxCornerTR: D3.Selection;
    private _boxCornerBL: D3.Selection;
    private _boxCornerBR: D3.Selection;

    private _boxBounds: Bounds = {
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 }
    };
    private _boxEdgeWidth = 2;

    constructor() {
      super();
      this.classed("selection-box", true);
    }

    protected _setup() {
      super._setup();

      this._box = this._content.append("g").classed("selection-box", true).remove();
      this._boxArea = this._box.append("rect").classed("selection-area", true);

      var createLine = () => this._box.append("line").style({
                               "opacity": 0,
                               "stroke": "pink",
                               "stroke-width": this._boxEdgeWidth
                             });
      this._boxEdgeT = createLine().classed("selection-edge-tb", true);
      this._boxEdgeB = createLine().classed("selection-edge-tb", true);
      this._boxEdgeL = createLine().classed("selection-edge-lr", true);
      this._boxEdgeR = createLine().classed("selection-edge-lr", true);

      var createCorner = () => this._box.append("circle")
                                   .attr("r", this._boxEdgeWidth / 2)
                                   .style({
                                     "opacity": 0,
                                     "fill": "pink"
                                   });
      this._boxCornerTL = createCorner().classed("selection-corner-tl", true);
      this._boxCornerTR = createCorner().classed("selection-corner-tr", true);
      this._boxCornerBL = createCorner().classed("selection-corner-bl", true);
      this._boxCornerBR = createCorner().classed("selection-corner-br", true);
    }

    public bounds(): Bounds;
    /**
     * Sets the bounds of the box, and draws the box.
     *
     * @param {Bounds} newBounds The desired bounds of the box.
     * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
     */
    public bounds(newBounds: Bounds): SelectionBoxLayer;
    public bounds(newBounds?: Bounds): any {
      if (newBounds == null) {
        return this._boxBounds;
      }

      this._boxBounds = newBounds;
      this._render();
      return this;
    }

    public _doRender() {
      var l = this._boxBounds.topLeft.x;
      var r = this._boxBounds.bottomRight.x;
      var t = this._boxBounds.topLeft.y;
      var b = this._boxBounds.bottomRight.y;

      this._boxArea.attr({
        x: l, y: t, width: r - l, height: b - t
      });

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

      this._content.node().appendChild(this._box.node());
    }

    /**
     * Gets the edge width of the box.
     *
     * @return {number}
     */
    public edgeWidth(): number;
    /**
     * Sets the edge width of the box.
     *
     * @param {number} width The desired edge width.
     * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
     */
    public edgeWidth(width: number): SelectionBoxLayer;
    public edgeWidth(width?: number): any {
      if (width == null) {
        return this._boxEdgeWidth;
      }
      if (width < 0) {
        throw new Error("Detection width cannot be negative.");
      }
      this._boxEdgeWidth = width;
      this._boxEdgeT.style("stroke-width", this._boxEdgeWidth);
      this._boxEdgeB.style("stroke-width", this._boxEdgeWidth);
      this._boxEdgeL.style("stroke-width", this._boxEdgeWidth);
      this._boxEdgeR.style("stroke-width", this._boxEdgeWidth);
      this._boxCornerTL.attr("r", this._boxEdgeWidth / 2);
      this._boxCornerTR.attr("r", this._boxEdgeWidth / 2);
      this._boxCornerBL.attr("r", this._boxEdgeWidth / 2);
      this._boxCornerBR.attr("r", this._boxEdgeWidth / 2);
    }

    public dismissBox() {
      this._box.remove();
    }
  }
}
}
