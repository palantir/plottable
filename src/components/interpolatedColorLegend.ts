///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class InterpolatedColorLegend extends Component {
    private static _DEFAULT_NUM_SWATCHES = 11;

    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;
    private _writer: SVGTypewriter.Writers.Writer;
    private _scale: Scales.InterpolatedColor;
    private _orientation: String ;
    private _textPadding = 5;
    private _formatter: Formatter;
    private _expands: boolean;

    private _swatchContainer: d3.Selection<void>;
    private _swatchBoundingBox: d3.Selection<void>;
    private _lowerLabel: d3.Selection<void>;
    private _upperLabel: d3.Selection<void>;
    private _redrawCallback: ScaleCallback<Scales.InterpolatedColor>;

    /**
     * The css class applied to the legend labels.
     */
    public static LEGEND_LABEL_CLASS = "legend-label";

    /**
     * Creates an InterpolatedColorLegend.
     *
     * The InterpolatedColorLegend consists of a sequence of swatches that show the
     * associated InterpolatedColor Scale sampled at various points.
     * Two labels show the maximum and minimum values of the InterpolatedColor Scale.
     *
     * @constructor
     * @param {Scales.InterpolatedColor} interpolatedColorScale
     */
    constructor(interpolatedColorScale: Scales.InterpolatedColor) {
      super();
      if (interpolatedColorScale == null ) {
        throw new Error("InterpolatedColorLegend requires a interpolatedColorScale");
      }
      this._scale = interpolatedColorScale;
      this._redrawCallback = (scale) => this.redraw();
      this._scale.onUpdate(this._redrawCallback);
      this._formatter = Formatters.general();
      this._orientation = "horizontal";
      this._expands = false;

      this.addClass("legend");
      this.addClass("interpolated-color-legend");
    }

    public destroy() {
      super.destroy();
      this._scale.offUpdate(this._redrawCallback);
    }

    /**
     * Gets the Formatter for the labels.
     */
    public formatter(): Formatter;
    /**
     * Sets the Formatter for the labels.
     *
     * @param {Formatter} formatter
     * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
     */
    public formatter(formatter: Formatter): InterpolatedColorLegend;
    public formatter(formatter?: Formatter): any {
      if (formatter === undefined) {
        return this._formatter;
      }
      this._formatter = formatter;
      this.redraw();
      return this;
    }

    /**
     * Gets whether the InterpolatedColorLegend expands to occupy all offered space in the long direction
     */
    public expands(): boolean;
    /**
     * Sets whether the InterpolatedColorLegend expands to occupy all offered space in the long direction
     *
     * @param {expands} boolean
     * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
     */
    public expands(expands: boolean): InterpolatedColorLegend;
    public expands(expands?: boolean): any {
      if (expands == null) {
        return this._expands;
      }
      this._expands = expands;
      this.redraw();
      return this;
    }

    private static _ensureOrientation(orientation: string) {
      orientation = orientation.toLowerCase();
      if (orientation === "horizontal" || orientation === "left" || orientation === "right") {
        return orientation;
      } else {
        throw new Error("\"" + orientation + "\" is not a valid orientation for InterpolatedColorLegend");
      }
    }

    /**
     * Gets the orientation.
     */
    public orientation(): string;
    /**
     * Sets the orientation.
     *
     * @param {string} orientation One of "horizontal"/"left"/"right".
     * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
     */
    public orientation(orientation: string): InterpolatedColorLegend;
    public orientation(orientation?: string): any {
      if (orientation == null) {
        return this._orientation;
      } else {
        this._orientation = InterpolatedColorLegend._ensureOrientation(orientation);
        this.redraw();
        return this;
      }
    }

    public fixedWidth() {
      return !this.expands() || this._isVertical();
    }

    public fixedHeight() {
      return !this.expands() || !this._isVertical();
    }

    private _generateTicks(numSwatches = InterpolatedColorLegend._DEFAULT_NUM_SWATCHES) {
      let domain = this._scale.domain();
      let slope = (domain[1] - domain[0]) / (numSwatches - 1);
      let ticks: number[] = [];
      for (let i = 0; i < numSwatches; i++) {
        ticks.push(domain[0] + slope * i);
      }
      return ticks;
    }

    protected _setup() {
      super._setup();

      this._swatchContainer = this.content().append("g").classed("swatch-container", true);
      this._swatchBoundingBox = this.content().append("rect").classed("swatch-bounding-box", true);
      this._lowerLabel = this.content().append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);
      this._upperLabel = this.content().append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);

      this._measurer = new SVGTypewriter.Measurers.Measurer(this.content());
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper();
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper);
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      let textHeight = this._measurer.measure().height;
      let padding = textHeight;

      let domain = this._scale.domain();
      let labelWidths = domain.map((d: number) => this._measurer.measure(this._formatter(d)).width);

      let desiredHeight: number;
      let desiredWidth: number;
      let numSwatches = InterpolatedColorLegend._DEFAULT_NUM_SWATCHES;
      if (this._isVertical()) {
        let longestWidth = Utils.Math.max(labelWidths, 0);
        desiredWidth = padding + textHeight + this._textPadding + longestWidth + padding;
        desiredHeight = numSwatches * textHeight;
      } else {
        desiredHeight = padding + textHeight + padding;
        desiredWidth = labelWidths[0] + numSwatches * textHeight
                       + labelWidths[1];
      }

      return {
        minWidth: desiredWidth,
        minHeight: desiredHeight
      };
    }

    private _isVertical() {
      return this._orientation !== "horizontal";
    }

    public renderImmediately() {
      super.renderImmediately();

      let domain = this._scale.domain();

      let text0 = this._formatter(domain[0]);
      let text0Width = this._measurer.measure(text0).width;
      let text1 = this._formatter(domain[1]);
      let text1Width = this._measurer.measure(text1).width;

      let textHeight = this._measurer.measure().height;
      let padding = textHeight;
      let textPadding = this._textPadding;

      let upperLabelShift: Point = { x: 0, y: 0 };
      let lowerLabelShift: Point = { x: 0, y: 0 };
      let lowerWriteOptions = {
                selection: this._lowerLabel,
                xAlign: "center",
                yAlign: "center",
                textRotation: 0
            };
      let upperWriteOptions = {
                selection: this._upperLabel,
                xAlign: "center",
                yAlign: "center",
                textRotation: 0
            };

      let swatchWidth: number;
      let swatchHeight: number;
      let swatchX: (d: any, i: number) => number;
      let swatchY: (d: any, i: number) => number;

      let boundingBoxAttr: { [key: string]: number } = {
        x: 0,
        y: this._isVertical() ? 0 : padding,
        width: 0,
        height: 0
      };

      let numSwatches = InterpolatedColorLegend._DEFAULT_NUM_SWATCHES;

      if (this.expands() && textHeight > 0) {
        let offset = this._isVertical() ? 0 :  2 * textPadding - text0Width - text1Width;
        let fullLength = this._isVertical() ? this.height() : this.width();
        numSwatches = Math.max(Math.floor((fullLength - offset) / textHeight), numSwatches);
      }

      if (this._isVertical()) {
        let longestTextWidth = Math.max(text0Width, text1Width);
        swatchWidth = Math.max(this.width() - 2 * padding - textPadding - longestTextWidth, 0);
        swatchHeight = Math.max(this.height() / numSwatches, 0);
        swatchY = (d: any, i: number) => (numSwatches - (i + 1)) * swatchHeight;

        upperWriteOptions.yAlign = "top";
        upperLabelShift.y = 0;
        lowerWriteOptions.yAlign = "bottom";
        lowerLabelShift.y = 0;

        if (this._orientation === "left") {
          swatchX = (d: any, i: number) => padding + longestTextWidth + textPadding;
          upperWriteOptions.xAlign = "right";
          upperLabelShift.x = -(padding + swatchWidth + textPadding);
          lowerWriteOptions.xAlign = "right";
          lowerLabelShift.x = -(padding + swatchWidth + textPadding);
        } else { // right
          swatchX = (d: any, i: number) => padding;
          upperWriteOptions.xAlign = "left";
          upperLabelShift.x = padding + swatchWidth + textPadding;
          lowerWriteOptions.xAlign = "left";
          lowerLabelShift.x = padding + swatchWidth + textPadding;
        }
        boundingBoxAttr["width"] = swatchWidth;
        boundingBoxAttr["height"] = numSwatches * swatchHeight;
      } else { // horizontal
        swatchWidth = Math.max( ((this.width() - 2 * textPadding - text0Width - text1Width) / numSwatches), 0);
        swatchHeight = Math.max( (this.height() - 2 * padding), 0);
        swatchX = (d: any, i: number) => (text0Width + textPadding) + i * swatchWidth;
        swatchY = (d: any, i: number) => padding;

        upperWriteOptions.xAlign = "right";
        upperLabelShift.x = 0;
        lowerWriteOptions.xAlign = "left";
        lowerLabelShift.x = 0;

        boundingBoxAttr["width"] = numSwatches * swatchWidth;
        boundingBoxAttr["height"] = swatchHeight;
      }
      boundingBoxAttr["x"] = swatchX(null, 0); // position of the first swatch

      this._upperLabel.text(""); // clear the upper label
      this._writer.write(text1, this.width(), this.height(), upperWriteOptions);
      let upperTranslateString = "translate(" + upperLabelShift.x + ", " + upperLabelShift.y + ")";
      this._upperLabel.attr("transform", upperTranslateString);

      this._lowerLabel.text(""); // clear the lower label
      this._writer.write(text0, this.width(), this.height(), lowerWriteOptions);
      let lowerTranslateString = "translate(" + lowerLabelShift.x + ", " + lowerLabelShift.y + ")";
      this._lowerLabel.attr("transform", lowerTranslateString);

      this._swatchBoundingBox.attr(boundingBoxAttr);

      let ticks = this._generateTicks(numSwatches);
      let swatches = this._swatchContainer.selectAll("rect.swatch").data(ticks);
      swatches.enter().append("rect").classed("swatch", true);
      swatches.exit().remove();
      swatches.attr({
        "fill": (d: any, i: number) => this._scale.scale(d),
        "width": swatchWidth,
        "height": swatchHeight,
        "x": swatchX,
        "y": swatchY
      });
      return this;
    }

  }
}
}
