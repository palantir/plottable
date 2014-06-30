///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Time extends Abstract.Axis {
    public _scale: Scale.Time;
    /**
     * Creates a Time Axis
     * 
     * @constructor
     * @param {TimeScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string, formatter = new Plottable.Formatter.Time()) {
      super(scale, orientation, formatter);
      if (orientation !== "top" && orientation !== "bottom") {
        throw new Error ("Time Axis can only be horizontal for now");
      }
      this.classed("time-axis", true);
    }

    public _computeWidth() {
      return 0; // always horizontal, so never requires any width
    }

    public _computeHeight() {
      this._computedHeight = this.tickLength() + this.tickLabelPadding() + this.measureTextHeight();
      return this._computedHeight;
    }

    public _getTickValues(): string[] {
      return this._scale.ticks(7);
    }

    private measureTextHeight(): number {
      return Util.Text.getTextHeight(this._tickLabelContainer);
    }

    public _doRender() {
      super._doRender();
      var tickValues = this._getTickValues();
      var tickLabels = this._tickLabelContainer.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).data(tickValues);
      tickLabels.exit().remove();
      tickLabels.enter().append("text").classed(Abstract.Axis.TICK_LABEL_CLASS, true);

      var tickLabelAttrHash = {
        x: <any> 0,
        y: <any> 0,
        dx: "0em",
        dy: "0em"
      };
      var labelGroupTransformY = 0;
      var tickMarkAttrHash = this._generateTickMarkAttrHash();
      switch(this._orientation) {
        case "bottom":
          tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
          tickLabelAttrHash["dy"] = "0.95em";
          break;
        case "top":
          tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
          tickLabelAttrHash["dy"] = "-.25em";
          break;
      }

      tickLabels.text((d: any) => this._formatter.format(d))
                          .style("text-anchor", "middle")
                          .style("visibility", "visible")
                          .attr(tickLabelAttrHash);

      var labelGroupTransform = "translate(0," + tickMarkAttrHash["y2"] + ")";
      this._tickLabelContainer.attr("transform", labelGroupTransform);

      if (!this.showEndTickLabels()) {
        this._hideEndTickLabels();
      }
      this._hideOverlappingTickLabels();
      return this;
    }
  }
}
}
