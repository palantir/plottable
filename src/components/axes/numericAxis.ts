//<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class Numeric extends AbstractAxis {

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
     * is for rendering a QuantitativeScale.
     *
     * @constructor
     * @param {QuantitativeScale} scale The QuantitativeScale to base the axis on.
     * @param {string} orientation The orientation of the QuantitativeScale (top/bottom/left/right)
     * @param {Formatter} formatter A function to format tick labels (default Formatters.general()).
     */
    constructor(scale: Scale.AbstractQuantitative<number>, orientation: string, formatter = Formatters.general()) {
      super(scale, orientation, formatter);
    }

    protected _setup() {
      super._setup();
      this._measurer = new SVGTypewriter.Measurers.Measurer(this._tickLabelContainer, AbstractAxis.TICK_LABEL_CLASS);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper().maxLines(1);
    }

    public _computeWidth() {
      var tickValues = this._getTickValues();
      var textLengths = tickValues.map((v: any) => {
        var formattedValue = this.formatter()(v);
        return this._measurer.measure(formattedValue).width;
      });

      var maxTextLength = _Util.Methods.max(textLengths, 0);

      if (this._tickLabelPositioning === "center") {
        this._computedWidth = this._maxLabelTickLength() + this.tickLabelPadding() + maxTextLength;
      } else {
        this._computedWidth = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + maxTextLength);
      }

      return this._computedWidth;
    }

    public _computeHeight() {
      var textHeight = this._measurer.measure().height;

      if (this._tickLabelPositioning === "center") {
        this._computedHeight = this._maxLabelTickLength() + this.tickLabelPadding() + textHeight;
      } else {
        this._computedHeight = Math.max(this._maxLabelTickLength(), this.tickLabelPadding()+ textHeight);
      }

      return this._computedHeight;
    }

    protected _getTickValues(): any[] {
      return (<Scale.AbstractQuantitative<number>> this._scale).ticks();
    }

    protected _rescale() {
      if (!this._isSetup) {
        return;
      }

      if (!this._isHorizontal()) {
        var reComputedWidth = this._computeWidth();
        if (reComputedWidth > this.width() || reComputedWidth < (this.width() - this.gutter())) {
          this._invalidateLayout();
          return;
        }
      }

      this._render();
    }

    public _doRender() {
      super._doRender();

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
      switch(this.orient()) {
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
                           .selectAll("." + AbstractAxis.TICK_LABEL_CLASS)
                           .data(tickLabelValues);
      tickLabels.enter().append("text").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();

      tickLabels.style("text-anchor", tickLabelTextAnchor)
                .style("visibility", "visible")
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
      this._tickLabelContainer.attr("transform", labelGroupTransform);

      if (!this.showEndTickLabels()) {
        this._hideEndTickLabels();
      }

      this._hideOverlappingTickLabels();
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
        this._invalidateLayout();
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
          this._render();
          return this;
        }
      } else if ((this._isHorizontal() && orientation === "right") ||
                 (!this._isHorizontal() && orientation === "top")) {
        if (show === undefined) {
          return this._showLastTickLabel;
        } else {
          this._showLastTickLabel = show;
          this._render();
          return this;
        }
      } else {
        throw new Error("Attempt to show " + orientation + " tick label on a " +
                        (this._isHorizontal() ? "horizontal" : "vertical") +
                        " axis");
      }
    }
}
}
}
