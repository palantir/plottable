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
      if (offeredWidth < 0 || offeredHeight < 0) {
        return {
          width: 0,
          height: 0,
          wantsWidth: this.isVertical,
          wantsHeight: !this.isVertical
        };
      }
      if (this.isVertical) {
        this._scale.range([offeredHeight, 0]);
      } else {
        this._scale.range([0, offeredWidth]);
      }
      var bandWidth: number = this._scale.rangeBand();
      var width  = this.isVertical ? offeredWidth : bandWidth;
      var height = this.isVertical ? bandWidth : offeredHeight;
      var textResult = this.writeText(width, height);

      var desiredWidth  = this.isVertical ? textResult.usedWidth : 0;
      var desiredHeight = this.isVertical ? 0 : textResult.usedHeight;
      var wantsWidth    = this.isVertical ? !textResult.textFits : false;
      var wantsHeight   = this.isVertical ? false : !textResult.textFits;
      console.log("OW:" + offeredWidth + ", " + ", OH:" + offeredHeight + ", DW:" + desiredWidth + ", DH:" + desiredHeight);
      this.content.selectAll(".tick").remove();

      return {
        width : desiredWidth,
        height: desiredHeight,
        wantsWidth : wantsWidth,
        wantsHeight: wantsHeight
      };
    }

    private writeText(axisWidth: number, axisHeight: number): TextUtils.IWriteTextResult {
      var bandWidth: number = this._scale.rangeBand();
      var ticks = this.content.selectAll(".tick").data(this._scale.domain());
      ticks.enter().append("g").classed("tick", true);
      ticks.exit().remove();
      var width  = this.isVertical ? axisWidth : bandWidth;
      var height = this.isVertical ? bandWidth : axisHeight;
      var self = this;
      var textWriteResults: TextUtils.IWriteTextResult[] = [];
      ticks.each(function (d: string, i: number) {
        var bandStartPosition: number = self._scale.scale(d);
        d3.select(this).selectAll("g").remove();
        var g = d3.select(this).append("g");

        var x = self.isVertical ? 0 : bandStartPosition;
        var y = self.isVertical ? bandStartPosition : 0;
        g.attr("transform", "translate(" + x + "," + y + ")");
        var o = self.orientation;
        var anchor = (o === "top" || o === "bottom") ? "middle" : o;
        var xOrient = this.isVertical ? "left" : "middle";
        var yOrient = "middle";
        var textWriteResult = TextUtils.writeText(d, g, width, height, xOrient, yOrient);
        textWriteResults.push(textWriteResult);
      });

      return {
        textFits: textWriteResults.every((t: TextUtils.IWriteTextResult) => t.textFits),
        usedWidth : d3.max(textWriteResults, (t: TextUtils.IWriteTextResult) => t.usedWidth),
        usedHeight: d3.max(textWriteResults, (t: TextUtils.IWriteTextResult) => t.usedHeight)
      };

    }

    public _doRender() {
      this.writeText(this.availableWidth, this.availableHeight);
      return this;
    }
  }
}
