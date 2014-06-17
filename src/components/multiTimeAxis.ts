///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Multi extends Time {
    public _intervals: D3.Time.Interval[];

    /**
     * Creates a MultiTimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);
      this._intervals = [];
     }

     public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requestedWidth = this._width;
      var requestedHeight = this._height;

      if (this._computedHeight == null) {
          this._computedHeight = (this.tickLength() + this.tickLabelPadding()) * this._intervals.length + this._measureTextHeight();
      }
      requestedWidth = 0;
      requestedHeight = (this._height === "auto") ? this._computedHeight : this._height;

      return {
          width: Math.min(offeredWidth, requestedWidth),
          height: Math.min(offeredHeight, requestedHeight),
          wantsWidth: false,
          wantsHeight: offeredHeight < requestedHeight
      };
    }

    public addInterval(interval: D3.Time.Interval): Multi {
      this._intervals.push(interval);
      return this;
    }

    public _getTickValues(): any[] {
      var set = d3.set();
      this._intervals.forEach((v) =>
        set = Util.Methods.union(set, d3.set(this._scale.tickInterval(v)))
      );
      return set.values().map((d) => new Date(d));
    }

    public _measureTextHeight(): number {
      var fakeTickLabel = this._tickLabelsG.append("g").classed("tick-label", true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    public _doRender() {
      super._doRender();
      var numIntervals = this._intervals.length;
      var topTicks = this._scale.tickInterval(this._intervals[numIntervals - 1]);
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(topTicks, (d) => d);
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabels.selectAll("text").attr("transform", "translate(0," + (this._orientation === "bottom" ?
          (this.tickLength() * numIntervals + this._measureTextHeight()) :
          (this.availableHeight - this.tickLength() * numIntervals)) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => this._formatter.format(d))
                                  .style("text-anchor", "middle");

      this._intervals.forEach((v) => {
          var index = this._intervals.indexOf(v);
          var tickValues = this._scale.tickInterval(v);
          var selection = this._ticksContainer.selectAll(".tick").filter((d) =>
              tickValues.map((x) => x.valueOf()).indexOf(d.valueOf()) >= 0
          );
          selection.select("line").attr("y2", this.tickLength() * (index + 1));
      });
      return this;
    }
  }
}
}
