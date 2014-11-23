///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Crosshair extends Hover {
    private crosshairContainer: D3.Selection;
    private verticalLine: D3.Selection;
    private horizontalLine: D3.Selection;
    private circle: D3.Selection;
    private _iconRadius = 3;

    public _anchor(component: Hoverable, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this.crosshairContainer = this._componentToListenTo._foregroundContainer.append("g")
                                                         .style("visibility", "hidden")
                                                         .classed({
                                                           "interaction": true,
                                                           "crosshair": true
                                                         });

      this.verticalLine = this.crosshairContainer.append("line").classed("vertical", true);
      this.horizontalLine = this.crosshairContainer.append("line").classed("horizontal", true);
    }

    private drawCrosshair(points: Point[]) {
      var circles = this.crosshairContainer.selectAll("circle").data(points);
      circles.enter().append("circle");
      circles.exit().remove();
      circles.attr({
        "r": this._iconRadius,
        "cx": (p: Point) => p.x,
        "cy": (p: Point) => p.y
      });
      this.verticalLine.attr({
        x1: points[0].x,
        y1: 0,
        x2: points[0].x,
        y2: this._componentToListenTo.height()
      });
      this.horizontalLine.attr({
        x1: 0,
        y1: points[0].y,
        x2: this._componentToListenTo.width(),
        y2: points[0].y
      });
    }

    /**
     * Gets the crosshair icon radius.
     *
     * @return {number} The crosshair icon radius.
     */
    public iconRadius(): number;
    /**
     * Sets the crosshair icon radius.
     *
     * @param {number} r The desired crosshair icon radius.
     * @return {Crosshair} The calling Interaction.Crosshair.
     */
    public iconRadius(r: number): Crosshair;
    public iconRadius(r?: number): any {
      if (r == null) {
        return this._iconRadius;
      }
      this._iconRadius = r;
      return this;
    }

    public _handleHoverOver(p: Point) {
      super._handleHoverOver(p);
      var currentHoverData = this.getCurrentHoverData();
      if (currentHoverData.pixelPositions != null) {
        this.crosshairContainer.style("visibility", "visible");
        this.drawCrosshair(currentHoverData.pixelPositions);
      } else {
        this.crosshairContainer.style("visibility", "hidden");
      }
    }

    public _handleHoverEnd(p: Point) {
      super._handleHoverEnd(p);
      this.crosshairContainer.style("visibility", "hidden");
    }
  }
}
}
