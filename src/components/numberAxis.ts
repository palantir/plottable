///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Number extends Abstract.Axis {
    public _scale: Abstract.QuantitiveScale;
    private computedWidth: number;
    private computedHeight: number;

    /**
     * Creates a NumberAxis.
     *
     * @constructor
     * @param {QuantitiveScale} scale The QuantitiveScale to base the NumberAxis on.
     * @param {string} orientation The orientation of the QuantitiveScale (top/bottom/left/right)
     * @param {Formatter} [formatter] A function to format tick labels.
     */
    constructor(scale: Abstract.QuantitiveScale, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);
    }


    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requestedWidth = this._width;
      var requestedHeight = this._height;

      var fakeTick: D3.Selection;
      var testTextEl: D3.Selection;
      if (this._isHorizontal()) {
        if (this.computedHeight == null) {
          fakeTick = this._ticksContainer.append("g").classed("tick", true);
          testTextEl = fakeTick.append("text").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
          var textHeight = Util.DOM.getBBox(testTextEl.text("test")).height;
          this.computedHeight = this.tickLength() + this.tickLabelPadding() + textHeight;
          fakeTick.remove();
        }

        requestedWidth = 0;
        requestedHeight = (this._height == null) ? this.computedHeight : this._height;
      } else { // vertical
        if (this.computedWidth == null) {
          // generate a test value to measure width
          var tickValues = this._getTickValues();
          var valueLength = function(v: any) {
            var logLength = Math.floor(Math.log(Math.abs(v)) / Math.LN10);
            return (logLength > 0) ? logLength : 1; // even the smallest number takes 1 character
          };
          var pow10 = Math.max.apply(null, tickValues.map(valueLength));
          var precision = this._formatter.precision();
          var testValue = -(Math.pow(10, pow10) + Math.pow(10, -precision)); // leave room for negative sign

          fakeTick = this._ticksContainer.append("g").classed("tick", true);
          testTextEl = fakeTick.append("text").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
          var formattedTestValue = this._formatter.format(testValue);
          var textLength = (<SVGTextElement> testTextEl.text(formattedTestValue).node()).getComputedTextLength();
          this.computedWidth = this.tickLength() + this.tickLabelPadding() + textLength;
          fakeTick.remove();
        }
        requestedWidth = (this._width == null) ? this.computedWidth : this._width;
        requestedHeight = 0;
      }

      return {
        width : Math.min(offeredWidth, requestedWidth),
        height: Math.min(offeredHeight, requestedHeight),
        wantsWidth: !this._isHorizontal() && offeredWidth < requestedWidth,
        wantsHeight: this._isHorizontal() && offeredHeight < requestedHeight
      };
    }

    public _getTickValues(): any[] {
      return this._scale.ticks(10);
    }

    public _doRender() {
      super._doRender();

      var tickLabelTextAnchor = "middle";
      var tickLabelAttrHash = {
        x: 0,
        y: 0,
        dx: "0em",
        dy: "0.3em"
      };
      var tickMarkAttrHash = this._generateTickMarkAttrHash();
      switch(this._orientation) {
        case "bottom":
          tickLabelAttrHash["y"] = tickMarkAttrHash["y2"] + this.tickLabelPadding();
          tickLabelAttrHash["dy"] = "0.95em";
          break;

        case "top":
          tickLabelAttrHash["y"] = tickMarkAttrHash["y2"] - this.tickLabelPadding();
          tickLabelAttrHash["dy"] = "-.25em";
          break;

        case "left":
          tickLabelTextAnchor = "end";
          tickLabelAttrHash["x"] = tickMarkAttrHash["x2"] - this.tickLabelPadding();
          break;

        case "right":
          tickLabelTextAnchor = "start";
          tickLabelAttrHash["x"] = tickMarkAttrHash["x2"] + this.tickLabelPadding();
          break;
      }

      var formatFunction = (d: any) => this._formatter.format(d);
      this._ticks.each(function(d: any, i: number) {
        var d3El = d3.select(this);
        var textEl = d3El.select("text");
        if (textEl.empty()) {
          textEl = d3El.append("text");
        }
        textEl.classed("tick-label", true)
              .style("text-anchor", tickLabelTextAnchor)
              .attr(tickLabelAttrHash)
              .text(formatFunction(d));
      });

      return this;
    }

    public _invalidateLayout() {
      super._invalidateLayout();
      this.computedWidth = null;
      this.computedHeight = null;
    }
  }
}
}
