//<reference path="../../reference.ts" />

module Plottable {
export module Axes {
  export class Numeric extends Axis {

    private _tickLabelPositioning = "center";
    // Whether or not first/last tick label will still be displayed even if
    // the label is cut off.
    private _showFirstTickLabel = false;
    private _showLastTickLabel = false;
    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;

    /**
     * Constructs a NumericAxis.
     *
     * Just as an CategoryAxis is for rendering an OrdinalScale, a NumericAxis
     * is for rendering a QuantitativeScaleScale.
     *
     * @constructor
     * @param {QuantitativeScaleScale} scale The QuantitativeScaleScale to base the axis on.
     * @param {string} orientation The orientation of the QuantitativeScaleScale (top/bottom/left/right)
     * @param {Formatter} formatter A function to format tick labels (default Formatters.general()).
     */
    constructor(scale: QuantitativeScale<number>, orientation: string, formatter = Formatters.general()) {
      super(scale, orientation, formatter);
    }

    protected setup() {
      super.setup();
      this._measurer = new SVGTypewriter.Measurers.Measurer(this.tickLabelContainer, Axis.TICK_LABEL_CLASS);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper().maxLines(1);
    }

    public _computeWidth() {
      var tickValues = this._getTickValues();
      var textLengths = tickValues.map((v: any) => {
        var formattedValue = this.formatter()(v);
        return this._measurer.measure(formattedValue).width;
      });

      var maxTextLength = Utils.Methods.max(textLengths, 0);

      if (this._tickLabelPositioning === "center") {
        this.computedWidth = this._maxLabelTickLength() + this.tickLabelPadding() + maxTextLength;
      } else {
        this.computedWidth = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + maxTextLength);
      }

      return this.computedWidth;
    }

    public _computeHeight() {
      var textHeight = this._measurer.measure().height;

      if (this._tickLabelPositioning === "center") {
        this.computedHeight = this._maxLabelTickLength() + this.tickLabelPadding() + textHeight;
      } else {
        this.computedHeight = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + textHeight);
      }

      return this.computedHeight;
    }

    protected _getTickValues(): any[] {
      var scale = (<QuantitativeScale<number>> this.scale);
      var domain = scale.domain();
      var min = domain[0] <= domain[1] ? domain[0] : domain[1];
      var max = domain[0] >= domain[1] ? domain[0] : domain[1];
      if (min === domain[0]) {
        return scale.ticks().filter((i: number) => i >= min && i <= max);
      } else {
        return scale.ticks().filter((i: number) => i >= min && i <= max).reverse();
      }
    }

    protected _rescale() {
      if (!this.isSetup) {
        return;
      }

      if (!this._isHorizontal()) {
        var reComputedWidth = this._computeWidth();
        if (reComputedWidth > this.width() || reComputedWidth < (this.width() - this.gutter())) {
          this.invalidateLayout();
          return;
        }
      }

      this.render();
    }

    public doRender() {
      super.doRender();

      var tickLabelAttrHash = {
        x: <any> 0,
        y: <any> 0,
        dx: "0em",
        dy: "0.3em"
      };

      var tickMarkLength = this._maxLabelTickLength();
      var tickLabelPadding = this.tickLabelPadding();

      var tickLabelTextAnchor = "middle";

      var labelGroupTransformX = 0;
      var labelGroupTransformY = 0;
      var labelGroupShiftX = 0;
      var labelGroupShiftY = 0;
      if (this._isHorizontal()) {
        switch(this._tickLabelPositioning) {
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
        switch(this._tickLabelPositioning) {
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
      switch(this.orientation()) {
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
      var tickLabels = this.tickLabelContainer
                           .selectAll("." + Axis.TICK_LABEL_CLASS)
                           .data(tickLabelValues);
      tickLabels.enter().append("text").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();

      tickLabels.style("text-anchor", tickLabelTextAnchor)
                .style("visibility", "inherit")
                .attr(tickLabelAttrHash)
                .text((s: any) => {
                  var formattedText = this.formatter()(s);
                  if (!this._isHorizontal()) {
                    var availableTextSpace = this.width() - this.tickLabelPadding();
                    availableTextSpace -= this._tickLabelPositioning === "center" ? this._maxLabelTickLength() : 0;
                    formattedText = this._wrapper.wrap(formattedText, this._measurer, availableTextSpace).wrappedText;
                  }
                  return formattedText;
                });

      var labelGroupTransform = "translate(" + labelGroupTransformX + ", " + labelGroupTransformY + ")";
      this.tickLabelContainer.attr("transform", labelGroupTransform);

      this._showAllTickMarks();

      if (!this.showEndTickLabels()) {
        this._hideEndTickLabels();
      }

      this._hideOverflowingTickLabels();
      this._hideOverlappingTickLabels();

      if (this._tickLabelPositioning === "bottom" ||
          this._tickLabelPositioning === "top"    ||
          this._tickLabelPositioning === "left"   ||
          this._tickLabelPositioning === "right") {
        this._hideTickMarksWithoutLabel();
      }
    }

    private _showAllTickMarks() {
      var visibleTickMarks = this.tickMarkContainer
                                 .selectAll("." + Axis.TICK_MARK_CLASS)
                                 .each(function() {
                                   d3.select(this).style("visibility", "inherit");
                                 });
    }

    /**
     * Hides the Tick Marks which have no corresponding Tick Labels
     */
    private _hideTickMarksWithoutLabel() {
      var visibleTickMarks = this.tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS);
      var visibleTickLabels = this.tickLabelContainer
                                  .selectAll("." + Axis.TICK_LABEL_CLASS)
                                  .filter(function(d: any, i: number) {
                                    var visibility = d3.select(this).style("visibility");
                                    return (visibility === "inherit") || (visibility === "visible");
                                  });

      var labelNumbersShown: number[] = [];
      visibleTickLabels.each((labelNumber: number) => labelNumbersShown.push(labelNumber));

      visibleTickMarks.each(function(e, i) {
        if (labelNumbersShown.indexOf(e) === -1) {
            d3.select(this).style("visibility", "hidden");
        }
      });
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
     * @param {string} position If provided, the relative position of the tick label.
     *                          [top/center/bottom] for a vertical NumericAxis,
     *                          [left/center/right] for a horizontal NumericAxis.
     *                          Defaults to center.
     * @returns {Numeric} The calling Axis.Numeric.
     */
    public tickLabelPosition(position: string): Numeric;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return this._tickLabelPositioning;
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
        this._tickLabelPositioning = positionLC;
        this.invalidateLayout();
        return this;
      }
    }

    /**
     * Gets whether or not the tick labels at the end of the graph are
     * displayed when partially cut off.
     *
     * @param {string} orientation Where on the scale to change tick labels.
     *                 On a "top" or "bottom" axis, this can be "left" or
     *                 "right". On a "left" or "right" axis, this can be "top"
     *                 or "bottom".
     * @returns {boolean} The current setting.
     */
    public showEndTickLabel(orientation: string): boolean;
    /**
     * Sets whether or not the tick labels at the end of the graph are
     * displayed when partially cut off.
     *
     * @param {string} orientation If provided, where on the scale to change tick labels.
     *                 On a "top" or "bottom" axis, this can be "left" or
     *                 "right". On a "left" or "right" axis, this can be "top"
     *                 or "bottom".
     * @param {boolean} show Whether or not the given tick should be
     * displayed.
     * @returns {Numeric} The calling NumericAxis.
     */
    public showEndTickLabel(orientation: string, show: boolean): Numeric;
    public showEndTickLabel(orientation: string, show?: boolean): any {
      if ((this._isHorizontal() && orientation === "left") ||
          (!this._isHorizontal() && orientation === "bottom")) {
        if (show === undefined) {
          return this._showFirstTickLabel;
        } else {
          this._showFirstTickLabel = show;
          this.render();
          return this;
        }
      } else if ((this._isHorizontal() && orientation === "right") ||
                 (!this._isHorizontal() && orientation === "top")) {
        if (show === undefined) {
          return this._showLastTickLabel;
        } else {
          this._showLastTickLabel = show;
          this.render();
          return this;
        }
      } else {
        throw new Error("Attempt to show " + orientation + " tick label on a " +
                        (this._isHorizontal() ? "horizontal" : "vertical") +
                        " axis");
      }
    }

    private _hideEndTickLabels() {
      var boundingBox = this.boundingBox.node().getBoundingClientRect();
      var tickLabels = this.tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      if (tickLabels[0].length === 0) {
        return;
      }
      var firstTickLabel = tickLabels[0][0];
      if (!Utils.DOM.boxIsInside(firstTickLabel.getBoundingClientRect(), boundingBox)) {
        d3.select(firstTickLabel).style("visibility", "hidden");
      }
      var lastTickLabel = tickLabels[0][tickLabels[0].length - 1];
      if (!Utils.DOM.boxIsInside(lastTickLabel.getBoundingClientRect(), boundingBox)) {
        d3.select(lastTickLabel).style("visibility", "hidden");
      }
    }

    // Responsible for hiding any tick labels that break out of the bounding container
    private _hideOverflowingTickLabels() {
      var boundingBox = this.boundingBox.node().getBoundingClientRect();
      var tickLabels = this.tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      if (tickLabels.empty()) {
        return;
      }
      tickLabels.each(function(d: any, i: number) {
        if (!Utils.DOM.boxIsInside(this.getBoundingClientRect(), boundingBox)) {
          d3.select(this).style("visibility", "hidden");
        }
      });
    }

    private _hideOverlappingTickLabels() {
      var visibleTickLabels = this.tickLabelContainer
                                    .selectAll("." + Axis.TICK_LABEL_CLASS)
                                    .filter(function(d: any, i: number) {
                                      var visibility = d3.select(this).style("visibility");
                                      return (visibility === "inherit") || (visibility === "visible");
                                    });
      var lastLabelClientRect: ClientRect;

      var visibleTickLabelRects = visibleTickLabels[0].map((label: HTMLScriptElement) => label.getBoundingClientRect());
      var interval = 1;

      while (!this._hasOverlapWithInterval(interval, visibleTickLabelRects) && interval < visibleTickLabelRects.length) {
        interval += 1;
      }

      visibleTickLabels.each(function (d: string, i: number) {
        var tickLabel = d3.select(this);
        if (i % interval !== 0) {
          tickLabel.style("visibility", "hidden");
        }
      });
    }

    /**
     * The method is responsible for evenly spacing the labels on the axis.
     * @return test to see if taking every `interval` recrangle from `rects`
     *         will result in labels not overlapping
     *
     * For top, bottom, left, right positioning of the thicks, we want the padding
     * between the labels to be 3x, such that the label will be  `padding` distance
     * from the tick and 2 * `padding` distance (or more) from the next tick
     *
     */
    private _hasOverlapWithInterval(interval: number, rects: ClientRect[]): boolean {

      var padding = this.tickLabelPadding();

      if (this._tickLabelPositioning === "bottom" ||
          this._tickLabelPositioning === "top"    ||
          this._tickLabelPositioning === "left"   ||
          this._tickLabelPositioning === "right"  ) {
        padding *= 3;
      }

      for (var i = 0; i < rects.length - (interval); i += interval) {
        var currRect = rects[i];
        var nextRect = rects[i + interval];
        if (this._isHorizontal()) {
          if (currRect.right + padding >= nextRect.left) {
            return false;
          }
        } else {
          if (currRect.top - padding <= nextRect.bottom) {
            return false;
          }
        }
      }
      return true;
    }
  }
}
}
