///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class InterpolatedColorLegend extends AbstractComponent {
    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;
    private _writer: SVGTypewriter.Writers.Writer;
    private _scale: Scale.InterpolatedColor;

    private _formatter: Formatter;
    private _orientation: String;
    private _ticks: number[];

    private _linearGradient: D3.Selection;
    private _linearGradientIdentifier: String;

    private _swatchContainer: D3.Selection;
    private _swatchBoundingBox: D3.Selection;
    private _lowerLabel: D3.Selection;
    private _upperLabel: D3.Selection;

    private _isExpanded = false;
    private _isGradient = false;
    private _numSwatches = 10;
    private _padding = 5;

    /**
     * The css class applied to the legend labels.
     */
    public static LEGEND_LABEL_CLASS = "legend-label";

    /**
     * Prefix for the CSS id on <linearGradient>
     */
    public static LINEARGRADIENT_PREFIX_ID = "legend-lineargradient-"

    /**
     * Creates an InterpolatedColorLegend.
     *
     * The InterpolatedColorLegend consists of a sequence of swatches, showing the
     * associated Scale.InterpolatedColor sampled at various points. Two labels
     * show the maximum and minimum values of the Scale.InterpolatedColor.
     *
     * @constructor
     * @param {Scale.InterpolatedColor} interpolatedColorScale
     * @param {string} orientation (top/bottom/left/right).
     * @param {Formatter} The labels are formatted using this function.
     */
    constructor(interpolatedColorScale: Scale.InterpolatedColor, orientation: string, formatter = Formatters.general()) {
      super();
      if (interpolatedColorScale == null ) {
        throw new Error("InterpolatedColorLegend requires a interpolatedColorScale");
      }
      this._scale = interpolatedColorScale;
      this._scale.broadcaster.registerListener(this, () => this._invalidateLayout());
      this._formatter = formatter;
      this._orientation = InterpolatedColorLegend._ensureOrientation(orientation);
      this._linearGradientIdentifier = InterpolatedColorLegend.LINEARGRADIENT_PREFIX_ID + this.getID();

      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
      this.classed("legend", true).classed("interpolated-color-legend", true);
    }

    public remove() {
      super.remove();
      this._scale.broadcaster.deregisterListener(this);
    }

    /**
     * Gets the current formatter on the InterpolatedColorLegend.
     *
     * @returns {Formatter} The current Formatter.
     */
    public formatter(): Formatter;
    /**
     * Sets the current formatter on the InterpolatedColorLegend.
     *
     * @param {Formatter} formatter If provided, data will be passed though `formatter(data)`.
     * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
     */
    public formatter(formatter: Formatter): InterpolatedColorLegend;
    public formatter(formatter?: Formatter): any {
      if (formatter === undefined) {
        return this._formatter;
      }
      this._formatter = formatter;
      this._invalidateLayout();
      return this;
    }

    private static _ensureOrientation(orientation: string) {
      orientation = orientation.toLowerCase();
      if (orientation === "top" || orientation === "bottom" || orientation === "left" || orientation === "right") {
        return orientation;
      } else {
        throw new Error("\"" + orientation + "\" is not a valid orientation for InterpolatedColorLegend");
      }
    }

    /**
     * Gets the orientation of the InterpolatedColorLegend.
     *
     * @returns {string} The current orientation.
     */
    public orient(): string;
    /**
     * Sets the orientation of the InterpolatedColorLegend.
     *
     * @param {string} newOrientation The desired orientation (horizontal/left/right).
     *
     * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
     */
    public orient(newOrientation: string): InterpolatedColorLegend;
    public orient(newOrientation?: string): any {
      if (newOrientation == null) {
        return this._orientation;
      } else {
        this._orientation = InterpolatedColorLegend._ensureOrientation(newOrientation);
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Apply a gradient to the InterpolatedColorLegend.
     *
     * @param {boolean} isGradient Whether there should be a gradient or not.
     *
     * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
     */
     public gradient(isGradient: boolean): InterpolatedColorLegend {
       this._isGradient = isGradient;
       return this;
     }

     /**
      * Expand the InterpolatedColorLegend to the full length/height of the chart.
      *
      * @param {boolean} isExpanded Whether the legend is expanded or not.
      *
      * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
      */
    public expand(isExpanded: boolean): InterpolatedColorLegend {
      this._isExpanded = isExpanded;
      return this;
    }

    private _generateTicks() {
      var domain = this._scale.domain();
      var slope = (domain[1] - domain[0]) / this._numSwatches;
      var ticks: number[] = [];
      for (var i = 0; i <= this._numSwatches; i++) {
        ticks.push(domain[0] + slope * i);
      }
      return ticks;
    }

    protected _setup() {
      super._setup();
      this._ticks = this._generateTicks();

      // Uses SVG <linearGradient> to establish a gradient that can be used as a fill for SVG elements
      if (this._isGradient) {
        this._linearGradient = this._content.append("linearGradient").attr("id", this._linearGradientIdentifier);
        if (this._isVertical()) {
          this._linearGradient.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
        } else {
          this._linearGradient.attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
        }
        this._linearGradient.selectAll("stop").data(this._ticks).enter().append("stop")
          .attr({
          "offset": (d: any, i: number) => i * (100 / this._numSwatches) + "%",
          "stop-color": (d: any, i: number) => this._scale.scale(d)
        });
      }

      this._swatchContainer = this._content.append("g").classed("swatch-container", true);
      this._swatchBoundingBox = this._content.append("rect").classed("swatch-bounding-box", true);
      this._lowerLabel = this._content.append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);
      this._upperLabel = this._content.append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);

      this._measurer = new SVGTypewriter.Measurers.Measurer(this._content);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper();
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper);
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var textHeight = this._measurer.measure().height;

      var ticks = this._generateTicks();
      var numSwatches = ticks.length;

      var domain = this._scale.domain();
      var labelWidths = domain.map((d: number) => this._measurer.measure(this._formatter(d)).width);

      var desiredHeight: number;
      var desiredWidth: number;
      if (this._isVertical()) {
        var longestWidth = _Util.Methods.max(labelWidths, 0);
        desiredWidth = this._padding + textHeight + this._padding + longestWidth + this._padding;
        desiredHeight = offeredHeight;
      } else {
        desiredHeight = textHeight * 2 + this._padding * 3;
        desiredWidth = offeredWidth;
      }

      return {
        width : desiredWidth,
        height: desiredHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private _isVertical() {
        return this._orientation === "left" || this._orientation === "right";
    }

    public _doRender() {
      super._doRender();

      var domain = this._scale.domain();

      var textHeight = this._measurer.measure().height;
      var lowerText = this._formatter(domain[0]);
      var lowerTextWidth = this._measurer.measure(lowerText).width;
      var upperText = this._formatter(domain[1]);
      var upperTextWidth = this._measurer.measure(upperText).width;

      var ticks = this._generateTicks();
      var numSwatches = ticks.length;

      var padding = this._padding;

      var upperLabelShift: Point = { x: 0, y: 0 };
      var lowerLabelShift: Point = { x: 0, y: 0 };
      var lowerWriteOptions = {
                selection: this._lowerLabel,
                xAlign: "center",
                yAlign: "center",
                textRotation: 0
            };
      var upperWriteOptions = {
                selection: this._upperLabel,
                xAlign: "center",
                yAlign: "center",
                textRotation: 0
            };

      // Width of each individual swatch box
      var swatchWidth: number;
      // Height of each individual swatch box
      var swatchHeight: number;
      var swatchX: (d: any, i: number) => number;
      var swatchY: (d: any, i: number) => number;

      var boundingBoxAttr = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };

      if (this._isVertical()) {
        var longestTextWidth = Math.max(lowerTextWidth, upperTextWidth);
        swatchWidth = Math.max(textHeight, 0);
        swatchHeight = this._isExpanded ? this.height() / numSwatches : swatchWidth;
        swatchY = (d: any, i: number) => (numSwatches - (i + 1)) * swatchHeight;

        upperWriteOptions.yAlign = "top";
        lowerWriteOptions.yAlign = "bottom";
        lowerLabelShift.y = -(this.height() - numSwatches * swatchHeight);

        if (this._orientation === "left") {
          swatchX = (d: any, i: number) => padding + longestTextWidth + padding;
          upperWriteOptions.xAlign = "right";
          upperLabelShift.x = -(padding + swatchWidth + padding);
          lowerWriteOptions.xAlign = "right";
          lowerLabelShift.x = -(padding + swatchWidth + padding);
        } else { // right
          swatchX = (d: any, i: number) => padding;
          upperWriteOptions.xAlign = "left";
          upperLabelShift.x = padding + swatchWidth + padding;
          lowerWriteOptions.xAlign = "left";
          lowerLabelShift.x = padding + swatchWidth + padding;
        }
        boundingBoxAttr.width = swatchWidth;
        boundingBoxAttr.height = numSwatches * swatchHeight;
      } else { // horizontal
        swatchHeight = Math.max(textHeight, 0);
        swatchWidth = this._isExpanded ? this.width() / numSwatches : swatchHeight;
        var swatchCenter = this.width() / 2;
        swatchX = (d: any, i: number) => this._isExpanded ? i * swatchWidth :
                                         swatchCenter - (numSwatches / 2 * swatchWidth) + i * swatchWidth;
        swatchY = (d: any, i: number) => this._orientation === "top" ? this.height() - padding - textHeight : padding;

        upperWriteOptions.xAlign = "right";
        upperLabelShift.x = -(swatchCenter - numSwatches / 2 * swatchWidth);
        lowerWriteOptions.xAlign = "left";
        lowerLabelShift.x = swatchCenter - numSwatches / 2 * swatchWidth;

        if (this._orientation === "top") { // place labels above color scale
          boundingBoxAttr.y = this.height() - padding - textHeight;
          lowerLabelShift.y = -padding;
          upperLabelShift.y = -padding;
        } else { // place labels below color scale
          boundingBoxAttr.y = padding;
          lowerLabelShift.y = padding;
          upperLabelShift.y = padding;
        }

        boundingBoxAttr.width = numSwatches * swatchWidth;
        boundingBoxAttr.height = swatchHeight;
      }
      boundingBoxAttr.x = swatchX(null, 0); // position of the first swatch

      if (this._isExpanded) {
        if (this._isVertical()) {
          lowerLabelShift.y = 0;
          boundingBoxAttr.height = this.height();
        } else {
          lowerLabelShift.x = 0;
          upperLabelShift.x = 0;
          boundingBoxAttr.width = this.width();
          boundingBoxAttr.height = swatchHeight;
        }
      }

      this._upperLabel.text(""); // clear the upper label
      this._writer.write(upperText, this.width(), this.height(), upperWriteOptions);
      var upperTranslateString = "translate(" + upperLabelShift.x + ", " + upperLabelShift.y + ")";
      this._upperLabel.attr("transform", upperTranslateString);

      this._lowerLabel.text(""); // clear the lower label
      this._writer.write(lowerText, this.width(), this.height(), lowerWriteOptions);
      var lowerTranslateString = "translate(" + lowerLabelShift.x + ", " + lowerLabelShift.y + ")";
      this._lowerLabel.attr("transform", lowerTranslateString);

      this._swatchBoundingBox.attr(boundingBoxAttr);

      if (this._isGradient) {
        var swatch = this._swatchContainer.selectAll("rect.swatch").data([0]);
        var swatchAttr: any = boundingBoxAttr;
        swatchAttr.fill = "url(#" + this._linearGradientIdentifier + ")";
        swatch.enter().append("rect").classed("swatch", true).attr(swatchAttr);
        swatch.exit().remove();
      } else {
        var swatches = this._swatchContainer.selectAll("rect.swatch").data(ticks);
        swatches.enter().append("rect").classed("swatch", true);
        swatches.exit().remove();
        swatches.attr({
          "fill": (d: any, i: number) => this._scale.scale(d),
          "width": swatchWidth,
          "height": swatchHeight,
          "x": swatchX,
          "y": swatchY
        });
      }
    }
  }
}
}
