///<reference path="../reference.ts" />

module Plottable {
  export class CategoryAxis extends Component {
    private _scale: OrdinalScale;
    private orientation: string;
    private isVertical: boolean;

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
      var testG = this.content.append("g");
      var textResult = this.writeText(offeredWidth, offeredHeight, testG);
      testG.remove();

      if (textResult.usedWidth > offeredWidth || textResult.usedHeight > offeredHeight) {
        debugger;
      }

      return {
        width : textResult.usedWidth,
        height: textResult.usedHeight,
        wantsWidth : !textResult.textFits,
        wantsHeight: !textResult.textFits
      };
    }

    private writeText(axisWidth: number, axisHeight: number, targetElement: D3.Selection): TextUtils.IWriteTextResult {
      var ticks = targetElement.selectAll(".tick").data(this._scale.domain());
      ticks.enter().append("g").classed("tick", true);
      ticks.exit().remove();
      var self = this;
      var textWriteResults: TextUtils.IWriteTextResult[] = [];
      ticks.each(function (d: string, i: number) {
        var startAndWidth = self._scale.fullBandStartAndWidth(d);
        var bandWidth = startAndWidth[1];
        var bandStartPosition = startAndWidth[0];
        var width  = self.isVertical ? axisWidth : bandWidth;
        var height = self.isVertical ? bandWidth : axisHeight;
        d3.select(this).selectAll("g").remove();
        var g = d3.select(this).append("g");
        var x = self.isVertical ? 0 : bandStartPosition;
        var y = self.isVertical ? bandStartPosition : 0;
        g.attr("transform", "translate(" + x + "," + y + ")");
        var xAlign: {[s: string]: string} = {left: "right", right: "left", top: "center", bottom: "center"};
        var yAlign: {[s: string]: string} = {left: "center", right: "center", top: "bottom", bottom: "top"};

        var textWriteResult = TextUtils.writeText(d, g, width, height, xAlign[self.orientation], yAlign[self.orientation]);
        textWriteResults.push(textWriteResult);
      });

      var widthFn = this.isVertical ? d3.max : d3.sum;
      var heightFn = this.isVertical ? d3.sum : d3.max;
      return {
        textFits: textWriteResults.every((t: TextUtils.IWriteTextResult) => t.textFits),
        usedWidth : widthFn(textWriteResults, (t: TextUtils.IWriteTextResult) => t.usedWidth),
        usedHeight: heightFn(textWriteResults, (t: TextUtils.IWriteTextResult) => t.usedHeight)
      };

    }

    public _doRender() {
      this.writeText(this.availableWidth, this.availableHeight, this.content);
      return this;
    }
  }
}
