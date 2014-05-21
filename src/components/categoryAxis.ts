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
      return {
        width: 0,
        height: Math.min(offeredHeight, this._height),
        wantsWidth: false,
        wantsHeight: offeredHeight < this._height
      };
    }

    public _doRender() {
      var bandWidth: number = this._scale.rangeBand();
      this._scale.domain().forEach((s: string) => {
        var bandStartPosition: number = this._scale.scale(s);
        var g = this.content.append("g");
        var bandWidthConverter = {"left": 0, "right": 1, "top": 0.5, "bottom": 0.5};
        var bandOffset = bandWidth * bandWidthConverter[this.orientation];
        var anchorConverter = {left: "left", right: "right", top: "middle", bottom: "middle"};
        var anchor = anchorConverter[this.orientation];
        g.attr("transform", "translate(" + (bandStartPosition + bandWidthOffset) + ",0)");
        TextUtils.writeTextHorizontally(s, g, bandWidth, this._height, anchor);
      });
      return this;
    }
  }
}
