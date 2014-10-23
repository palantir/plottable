///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class Numeric extends AbstractAxis {
    public _scale: Scale.AbstractQuantitative<number>;
    private _tickLabelMode: string;
    private tickLabelPositioning = "center";
    // Whether or not first/last tick label will still be displayed even if
    // the label is cut off.
    private showFirstTickLabel = false;
    private showLastTickLabel = false;
    private measurer: _Util.Text.TextMeasurer;

    /**
     * Constructs a NumericAxis.
     *
     * Just as an CategoryAxis is for rendering an OrdinalScale, a NumericAxis
     * is for rendering a QuantitativeScale.
     *
     * @constructor
     * @param {QuantitativeScale} scale The QuantitativeScale to base the axis on.
     * @param {string} orientation The orientation of the QuantitativeScale (top/bottom/left/right)
     * @param {Formatter} formatter A function to format tick labels (default Formatters.general(3, false)).
     * @param {string} mode A way how tick label should be rendered (point/interval, default point)
     */
    constructor(scale: Scale.AbstractQuantitative<number>,
                orientation: string,
                formatter = Formatters.general(3, false),
                mode = "point") {
      super(scale, orientation, formatter);
      this.tickLabelMode(mode);
    }

    public _setup() {
      super._setup();
      this.measurer = _Util.Text.getTextMeasurer(this._tickLabelContainer.append("text").classed(AbstractAxis.TICK_LABEL_CLASS, true));
    }

    /**
     * Gets the current mode on the axis's tick labels. 
     *
     * @returns {string} The current tick label mode.
     */
    public tickLabelMode(): string;
    /**
     * Sets the current mode on the axis's tick labels. 
     *
     * @param {string} mode If provided, tick labels will be rendered in this mode(point/interval).
     * @returns {Axis} The calling Axis.
     */
    public tickLabelMode(mode: string): Numeric;
    public tickLabelMode(mode?: string): any {
      if(mode === undefined) {
        return this._tickLabelMode;
      } else {
        mode = mode.toLowerCase();
        if (mode !== "point" && mode !== "interval") {
          throw new Error ("unsupported tick label mode: " + mode);
        }
        this._tickLabelMode = mode;
        this._invalidateLayout();
        return this;
      }
    }

    public _computeWidth() {
      var tickValues = this._getTickValues();
      var textLengths = tickValues.map((v: any) => {
        var formattedValue = this._formatter(v);
        return this.measurer(formattedValue).width;
      });

      var maxTextLength = _Util.Methods.max(textLengths, 0);

      if (this.tickLabelPositioning === "center" && this._tickLabelMode === "point") {
        this._computedWidth = this._maxLabelTickLength() + this.tickLabelPadding() + maxTextLength;
      } else {
        this._computedWidth = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + maxTextLength);
      }

      return this._computedWidth;
    }

    public _computeHeight() {
      var textHeight = this.measurer(_Util.Text.HEIGHT_TEXT).height;

      if (this.tickLabelPositioning === "center" && this._tickLabelMode === "point") {
        this._computedHeight = this._maxLabelTickLength() + this.tickLabelPadding() + textHeight;
      } else {
        this._computedHeight = Math.max(this._maxLabelTickLength(), this.tickLabelPadding()+ textHeight);
      }

      return this._computedHeight;
    }

    public _getTickValues(): any[] {
      return this._scale.ticks();
    }

    public _getTickLabelValues(): any[] {
      var tickLabels: any[] = [];
      if(this._tickLabelMode === "point" || this.tickLabelPositioning !== "center") {
        return tickLabels = this._scale.ticks();
      } else {
        var ticks = this._scale.ticks();
        ticks.forEach((tick: any, i: number) => {
          if (i !== 0) {
            tickLabels.push((ticks[i - 1] + tick) / 2);
          }
        });
        return tickLabels;
      }
    }

    public _rescale() {
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

      var tickMarkOffset = this._tickLabelMode === "point" ? this._maxLabelTickLength() : 0;
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
            labelGroupShiftY = tickMarkOffset + tickLabelPadding;
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
            labelGroupShiftX = tickMarkOffset + tickLabelPadding;
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

      var tickLabelValues = this._getTickLabelValues();
      var tickLabels = this._tickLabelContainer
                           .selectAll("." + AbstractAxis.TICK_LABEL_CLASS)
                           .data(tickLabelValues);
      tickLabels.enter().append("text").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();

      tickLabels.style("text-anchor", tickLabelTextAnchor)
                .style("visibility", "visible")
                .attr(tickLabelAttrHash)
                .text(this._formatter);

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
          return this.showFirstTickLabel;
        } else {
          this.showFirstTickLabel = show;
          this._render();
          return this;
        }
      } else if ((this._isHorizontal() && orientation === "right") ||
                 (!this._isHorizontal() && orientation === "top")) {
        if (show === undefined) {
          return this.showLastTickLabel;
        } else {
          this.showLastTickLabel = show;
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
