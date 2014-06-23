///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Numeric extends Abstract.Axis {
    public _scale: Abstract.QuantitiveScale;
    private tickLabelPositioning = "center";

    /**
     * Creates a NumericAxis.
     *
     * @constructor
     * @param {QuantitiveScale} scale The QuantitiveScale to base the NumericAxis on.
     * @param {string} orientation The orientation of the QuantitiveScale (top/bottom/left/right)
     * @param {Formatter} [formatter] A function to format tick labels.
     */
    constructor(scale: Abstract.QuantitiveScale, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);
    }

    public _computeWidth() {
      // generate a test value to measure width
      var tickValues = this._getTickValues();
      var valueLength = function(v: any) {
        var logLength = Math.floor(Math.log(Math.abs(v)) / Math.LN10);
        return (logLength > 0) ? logLength : 1; // even the smallest number takes 1 character
      };
      var pow10 = Math.max.apply(null, tickValues.map(valueLength));
      var precision = this._formatter.precision();
      var testValue = -(Math.pow(10, pow10) + Math.pow(10, -precision)); // leave room for negative sign

      var testTextEl = this._tickLabelContainer.append("text").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      var formattedTestValue = this._formatter.format(testValue);
      var textLength = (<SVGTextElement> testTextEl.text(formattedTestValue).node()).getComputedTextLength();
      testTextEl.remove();

      if (this.tickLabelPositioning === "center") {
        this._computedWidth = this.tickLength() + this.tickLabelPadding() + textLength;
      } else {
        this._computedWidth = Math.max(this.tickLength(), this.tickLabelPadding() + textLength);
      }

      return this._computedWidth;
    }

    public _computeHeight() {
      var testTextEl = this._tickLabelContainer.append("text").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      var textHeight = Util.DOM.getBBox(testTextEl.text("test")).height;
      testTextEl.remove();

      if (this.tickLabelPositioning === "center") {
        this._computedHeight = this.tickLength() + this.tickLabelPadding() + textHeight;
      } else {
        this._computedHeight = Math.max(this.tickLength(), this.tickLabelPadding()+ textHeight);
      }

      return this._computedHeight;
    }

    public _getTickValues(): any[] {
      return this._scale.ticks(10);
    }

    public _doRender() {
      super._doRender();

      var tickLabelAttrHash = {
        x: <any> 0,
        y: <any> 0,
        dx: "0em",
        dy: "0.3em"
      };

      var tickMarkLength = this.tickLength();
      var tickLabelPadding = this.tickLabelPadding();

      var tickLabelTextAnchor = "middle";

      var labelGroupTransformX = 0;
      var labelGroupTransformY = 0;
      var labelGroupShiftX = 0;
      var labelGroupShiftY = 0;
      if (this._isHorizontal()) {
        switch(this.tickLabelPositioning) {
          case "left":
            tickLabelTextAnchor = "end";
            labelGroupTransformX = -tickLabelPadding;
            labelGroupShiftY = tickLabelPadding;
            break;
          case "center":
            labelGroupShiftY = tickMarkLength + tickLabelPadding;
            break;
          case "right":
            tickLabelTextAnchor = "start";
            labelGroupTransformX = tickLabelPadding;
            labelGroupShiftY = tickLabelPadding;
            break;
        }
      } else {
        switch(this.tickLabelPositioning) {
          case "top":
            tickLabelAttrHash["dy"] = "-0.3em";
            labelGroupShiftX = tickLabelPadding;
            labelGroupTransformY = -tickLabelPadding;
            break;
          case "center":
            labelGroupShiftX = tickMarkLength + tickLabelPadding;
            break;
          case "bottom":
            tickLabelAttrHash["dy"] = "1em";
            labelGroupShiftX = tickLabelPadding;
            labelGroupTransformY = tickLabelPadding;
            break;
        }
      }

      var tickMarkAttrHash = this._generateTickMarkAttrHash();
      switch(this._orientation) {
        case "bottom":
          tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
          tickLabelAttrHash["dy"] = "0.95em";
          labelGroupTransformY = tickMarkAttrHash["y1"] + labelGroupShiftY;
          break;

        case "top":
          tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
          tickLabelAttrHash["dy"] = "-.25em";
          labelGroupTransformY = tickMarkAttrHash["y1"] - labelGroupShiftY;
          break;

        case "left":
          tickLabelTextAnchor = "end";
          labelGroupTransformX = tickMarkAttrHash["x1"] - labelGroupShiftX;
          tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
          break;

        case "right":
          tickLabelTextAnchor = "start";
          labelGroupTransformX = tickMarkAttrHash["x1"] + labelGroupShiftX;
          tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
          break;
      }

      var tickLabelValues = this._getTickValues();
      var tickLabels = this._tickLabelContainer
                           .selectAll("." + Abstract.Axis.TICK_LABEL_CLASS)
                           .data(tickLabelValues);
      tickLabels.enter().append("text").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();

      var formatFunction = (d: any) => this._formatter.format(d);
      tickLabels.style("text-anchor", tickLabelTextAnchor)
                .style("visibility", "visible")
                .attr(tickLabelAttrHash)
                .text(formatFunction);

      var labelGroupTransform = "translate(" + labelGroupTransformX + ", " + labelGroupTransformY + ")";
      this._tickLabelContainer.attr("transform", labelGroupTransform);

      if (!this.showEndTickLabels()) {
        this.hideEndTickLabels();
      }

      this.hideOverlappingTickLabels();

      return this;
    }

    /**
     * Gets the tick label position relative to the tick marks.
     *
     * @returns {string} The current tick label position.
     */
    public tickLabelPosition(): string;
    /**
     * Sets the tick label position relative to the tick marks.
     *
     * @param {string} position The relative position of the tick label.
     *                          [top/center/bottom] for a vertical NumericAxis,
     *                          [left/center/right] for a horizontal NumericAxis.
     * @returns {NumericAxis} The calling NumericAxis.
     */
    public tickLabelPosition(position: string): Axis.Numeric;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return this.tickLabelPositioning;
      } else {
        var positionLC = position.toLowerCase();
        if (this._isHorizontal()) {
          if (!(positionLC === "left" || positionLC === "center" || positionLC === "right")) {
            throw new Error(positionLC + " is not a valid tick label position for a horizontal NumericAxis");
          }
        } else {
          if (!(positionLC === "top" || positionLC === "center" || positionLC === "bottom")) {
            throw new Error(positionLC + " is not a valid tick label position for a vertical NumericAxis");
          }
        }
        this.tickLabelPositioning = positionLC;
        this._invalidateLayout();
        return this;
      }
    }

    private hideEndTickLabels() {
      var boundingBox = this.element.select(".bounding-box")[0][0].getBoundingClientRect();

      var isInsideBBox = (tickBox: ClientRect) => {
        return (
          Math.floor(boundingBox.left) <= Math.ceil(tickBox.left) &&
          Math.floor(boundingBox.top)  <= Math.ceil(tickBox.top)  &&
          Math.floor(tickBox.right)  <= Math.ceil(boundingBox.left + this.availableWidth) &&
          Math.floor(tickBox.bottom) <= Math.ceil(boundingBox.top  + this.availableHeight)
        );
      };

      var tickLabels = this._tickLabelContainer.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS);
      var firstTickLabel = tickLabels[0][0];
      if (!isInsideBBox(firstTickLabel.getBoundingClientRect())) {
        d3.select(firstTickLabel).style("visibility", "hidden");
      }
      var lastTickLabel = tickLabels[0][tickLabels[0].length-1];
      if (!isInsideBBox(lastTickLabel.getBoundingClientRect())) {
        d3.select(lastTickLabel).style("visibility", "hidden");
      }
    }

    private hideOverlappingTickLabels() {
      var visibleTickLabels = this._tickLabelContainer
                                    .selectAll("." + Abstract.Axis.TICK_LABEL_CLASS)
                                    .filter(function(d: any, i: number) {
                                      return d3.select(this).style("visibility") === "visible";
                                    });
      var lastLabelClientRect: ClientRect;

      function boxesOverlap(boxA: ClientRect, boxB: ClientRect) {
        if (boxA.right < boxB.left) { return false; }
        if (boxA.left > boxB.right) { return false; }
        if (boxA.bottom < boxB.top) { return false; }
        if (boxA.top > boxB.bottom) { return false; }
        return true;
      }

      visibleTickLabels.each(function (d: any) {
        var clientRect = this.getBoundingClientRect();
        var tickLabel = d3.select(this);
        if (lastLabelClientRect != null && boxesOverlap(clientRect, lastLabelClientRect)) {
          tickLabel.style("visibility", "hidden");
        } else {
          lastLabelClientRect = clientRect;
          tickLabel.style("visibility", "visible");
        }
      });
    }
  }
}
}
