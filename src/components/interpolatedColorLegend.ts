///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class InterpolatedColorLegend extends Component {
    private measurer: SVGTypewriter.Measurers.Measurer;
    private wrapper: SVGTypewriter.Wrappers.Wrapper;
    private writer: SVGTypewriter.Writers.Writer;
    private scale: Scales.InterpolatedColor;
    private orientation: String ;
    private padding = 5;
    private numSwatches = 10;
    private _formatter: Formatter;

    private swatchContainer: D3.Selection;
    private swatchBoundingBox: D3.Selection;
    private lowerLabel: D3.Selection;
    private upperLabel: D3.Selection;

    /**
     * The css class applied to the legend labels.
     */
    public static LEGEND_LABEL_CLASS = "legend-label";

    /**
     * Creates an InterpolatedColorLegend.
     *
     * The InterpolatedColorLegend consists of a sequence of swatches, showing the
     * associated Scale.InterpolatedColor sampled at various points. Two labels
     * show the maximum and minimum values of the Scale.InterpolatedColor.
     *
     * @constructor
     * @param {Scale.InterpolatedColor} interpolatedColorScale
     * @param {string} orientation (horizontal/left/right).
     * @param {Formatter} The labels are formatted using this function.
     */
    constructor(interpolatedColorScale: Scales.InterpolatedColor, orientation = "horizontal", formatter = Formatters.general()) {
      super();
      if (interpolatedColorScale == null ) {
        throw new Error("InterpolatedColorLegend requires a interpolatedColorScale");
      }
      this.scale = interpolatedColorScale;
      this.scale.broadcaster.registerListener(this, () => this.invalidateLayout());
      this._formatter = formatter;
      this.orientation = InterpolatedColorLegend.ensureOrientation(orientation);

      this.fixedWidthFlag = true;
      this.fixedHeightFlag = true;
      this.classed("legend", true).classed("interpolated-color-legend", true);
    }

    public remove() {
      super.remove();
      this.scale.broadcaster.deregisterListener(this);
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
      this.invalidateLayout();
      return this;
    }

    private static ensureOrientation(orientation: string) {
      orientation = orientation.toLowerCase();
      if (orientation === "horizontal" || orientation === "left" || orientation === "right") {
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
        return this.orientation;
      } else {
        this.orientation = InterpolatedColorLegend.ensureOrientation(newOrientation);
        this.invalidateLayout();
        return this;
      }
    }

    private generateTicks() {
      var domain = this.scale.domain();
      var slope = (domain[1] - domain[0]) / this.numSwatches;
      var ticks: number[] = [];
      for (var i = 0; i <= this.numSwatches; i++) {
        ticks.push(domain[0] + slope * i);
      }
      return ticks;
    }

    protected setup() {
      super.setup();

      this.swatchContainer = this._content.append("g").classed("swatch-container", true);
      this.swatchBoundingBox = this._content.append("rect").classed("swatch-bounding-box", true);
      this.lowerLabel = this._content.append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);
      this.upperLabel = this._content.append("g").classed(InterpolatedColorLegend.LEGEND_LABEL_CLASS, true);

      this.measurer = new SVGTypewriter.Measurers.Measurer(this._content);
      this.wrapper = new SVGTypewriter.Wrappers.Wrapper();
      this.writer = new SVGTypewriter.Writers.Writer(this.measurer, this.wrapper);
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      var textHeight = this.measurer.measure().height;

      var ticks = this.generateTicks();
      var numSwatches = ticks.length;

      var domain = this.scale.domain();
      var labelWidths = domain.map((d: number) => this.measurer.measure(this._formatter(d)).width);

      var desiredHeight: number;
      var desiredWidth: number;
      if (this.isVertical()) {
        var longestWidth = Utils.Methods.max(labelWidths, 0);
        desiredWidth = this.padding + textHeight + this.padding + longestWidth + this.padding;
        desiredHeight = this.padding + numSwatches * textHeight + this.padding;
      } else {
        desiredHeight = this.padding + textHeight + this.padding;
        desiredWidth = this.padding + labelWidths[0] + this.padding
                        + numSwatches * textHeight
                        + this.padding + labelWidths[1] + this.padding;
      }

      return {
        width: desiredWidth,
        height: desiredHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private isVertical() {
      return this.orientation !== "horizontal";
    }

    public doRender() {
      super.doRender();

      var domain = this.scale.domain();

      var textHeight = this.measurer.measure().height;
      var text0 = this._formatter(domain[0]);
      var text0Width = this.measurer.measure(text0).width;
      var text1 = this._formatter(domain[1]);
      var text1Width = this.measurer.measure(text1).width;

      var ticks = this.generateTicks();
      var numSwatches = ticks.length;

      var padding = this.padding;

      var upperLabelShift: Point = { x: 0, y: 0 };
      var lowerLabelShift: Point = { x: 0, y: 0 };
      var lowerWriteOptions = {
                selection: this.lowerLabel,
                xAlign: "center",
                yAlign: "center",
                textRotation: 0
            };
      var upperWriteOptions = {
                selection: this.upperLabel,
                xAlign: "center",
                yAlign: "center",
                textRotation: 0
            };

      var swatchWidth: number;
      var swatchHeight: number;
      var swatchX: (d: any, i: number) => number;
      var swatchY: (d: any, i: number) => number;

      var boundingBoxAttr = {
        x: 0,
        y: padding,
        width: 0,
        height: 0
      };

      if (this.isVertical()) {
        var longestTextWidth = Math.max(text0Width, text1Width);
        swatchWidth = Math.max( (this.width() - 3 * padding - longestTextWidth), 0);
        swatchHeight = Math.max( ((this.height() - 2 * padding) / numSwatches), 0);
        swatchY = (d: any, i: number) => padding + (numSwatches - (i + 1)) * swatchHeight;

        upperWriteOptions.yAlign = "top";
        upperLabelShift.y = padding;
        lowerWriteOptions.yAlign = "bottom";
        lowerLabelShift.y = -padding;

        if (this.orientation === "left") {
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
        swatchWidth = Math.max( ((this.width() - 4 * padding - text0Width - text1Width) / numSwatches), 0);
        swatchHeight = Math.max( (this.height() - 2 * padding), 0);
        swatchX = (d: any, i: number) => (padding + text0Width + padding) + i * swatchWidth;
        swatchY = (d: any, i: number) => padding;

        upperWriteOptions.xAlign = "right";
        upperLabelShift.x = -padding;
        lowerWriteOptions.xAlign = "left";
        lowerLabelShift.x = padding;

        boundingBoxAttr.width = numSwatches * swatchWidth;
        boundingBoxAttr.height = swatchHeight;
      }
      boundingBoxAttr.x = swatchX(null, 0); // position of the first swatch

      this.upperLabel.text(""); // clear the upper label
      this.writer.write(text1, this.width(), this.height(), upperWriteOptions);
      var upperTranslateString = "translate(" + upperLabelShift.x + ", " + upperLabelShift.y + ")";
      this.upperLabel.attr("transform", upperTranslateString);

      this.lowerLabel.text(""); // clear the lower label
      this.writer.write(text0, this.width(), this.height(), lowerWriteOptions);
      var lowerTranslateString = "translate(" + lowerLabelShift.x + ", " + lowerLabelShift.y + ")";
      this.lowerLabel.attr("transform", lowerTranslateString);

      this.swatchBoundingBox.attr(boundingBoxAttr);

      var swatches = this.swatchContainer.selectAll("rect.swatch").data(ticks);
      swatches.enter().append("rect").classed("swatch", true);
      swatches.exit().remove();
      swatches.attr({
        "fill": (d: any, i: number) => this.scale.scale(d),
        "width": swatchWidth,
        "height": swatchHeight,
        "x": swatchX,
        "y": swatchY
      });
    }

  }
}
}
