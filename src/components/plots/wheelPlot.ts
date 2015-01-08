///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /*
   * A WheelPlot is the radial analog to a GridPlot. A WheelPlot is used to shade the cells created by radially slicing
   * a set of concentric circles (rings). Each datum is a cell, and the value can control the color of the cell.
   *
   * Primary projection attributes:
   *   "fill" - Accessor determining the color of each sector
   *   "ring" - Accessor to extract the value determining the radii of the cell
   *   "slice" - Accessor to extract the value determining the start and end angles of the cell
   *   "value" - Accessor to extract the value determining the value of a datum (and thus the fill)
   */
  export class Wheel extends AbstractPlot {
    public _radiusScale: Scale.Ordinal;
    public _angleScale: Scale.Ordinal;

    /**
     * Constructs a WheelPlot.
     *
     * @constructor
     */
    constructor(ringScale: Scale.Ordinal, sliceScale: Scale.Ordinal, colorScale: Scale.AbstractScale<any, string>) {
      super();
      this.classed("wheel-plot", true);

      this._radiusScale = ringScale.copy();
      this._angleScale = sliceScale.copy();

      // no padding between adjacent cells
      this._radiusScale.rangeType("bands", 0, 0);
      this._angleScale.rangeType("bands", 0, 0);
      this._angleScale.range([0, 2 * Math.PI]);
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
    }

    public _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector = super._generateAttrToProjector();

      // fill the whole plot with arcs
      this._radiusScale.range([this._radiusScale.range()[0], Math.min(this.width(), this.height()) / 2]);

      // radii & angles for each arc segment in the wheel
      attrToProjector["inner-radius"] = (d: any) => this._radiusScale.scale(attrToProjector["ring"](d));
      attrToProjector["outer-radius"] = (d: any) => this._radiusScale.scale(attrToProjector["ring"](d)) + this._radiusScale.rangeBand();
      attrToProjector["start-angle"] = (d: any) => this._angleScale.scale(attrToProjector["slice"](d));
      attrToProjector["end-angle"] = (d: any) => this._angleScale.scale(attrToProjector["slice"](d)) + this._angleScale.rangeBand();

      return attrToProjector;
    }

    public _getDrawer(key: string): _Drawer.AbstractDrawer {
      return new Plottable._Drawer.Wheel(key).setClass("arc");
    }
  }
}
}
