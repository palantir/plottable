///<reference path="../reference.ts" />

module Plottable {
  export class CategoryAxis extends Component {
    private _scale: OrdinalScale;
    private orientation: string;
    private isVertical: boolean;
    private _height = 50;
    private _width = 80;

    constructor(scale: OrdinalScale, orientation = "bottom") {
      super();
      this.classed("category-axis", true).classed("axis", true);
      this._scale = scale;
      var orientLC = orientation.toLowerCase();
      this.orientation = orientLC;
      if (["left", "right", "top", "bottom"].indexOf(orientLC) === -1) {
        throw new Error(orientation + " is not a valid category axis orientation");
      }
      this.isVertical = (orientLC === "left" || orientLC === "right");
      if (scale.rangeType() !== "bands") {
        throw new Error("Only rangeBands category axes are implemented");
      }
      this._registerToBroadcaster(this._scale, () => this._invalidateLayout());
    }

    public height(newHeight: number) {
      if (this.isVertical) {
        throw new Error("Setting height on a vertical axis is meaningless");
      }
      this._height = newHeight;
      return this;
    }

    public width(newWidth: number) {
      if (!this.isVertical) {
        throw new Error("Setting width on a horizontal axis is meaningless");
      }
      this._width = newWidth;
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number) {
      var desiredWidth  = this.isVertical ? this._width : 0;
      var desiredHeight = this.isVertical ? 0 : this._height;
      return {
        width : Math.min(offeredWidth , desiredWidth ),
        height: Math.min(offeredHeight, desiredHeight),
        wantsWidth : offeredWidth  < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    public _doRender() {
      var bandWidth: number = this._scale.rangeBand();
      this._scale.domain().forEach((s: string) => {
        var bandStartPosition: number = this._scale.scale(s);
        var g = this.content.append("g");

        var x = this.isVertical ? 0 : bandStartPosition;
        var y = this.isVertical ? bandStartPosition : 0;
        g.attr("transform", "translate(" + x + "," + y + ")");
        var o = this.orientation;
        var anchor = (o === "top" || o === "bottom") ? "middle" : o;
        var width  = this.isVertical ? this.availableWidth : bandWidth;
        var height = this.isVertical ? bandWidth : this.availableHeight;
        TextUtils.writeText(s, g, width, height, anchor);
      });
      return this;
    }
  }
}
