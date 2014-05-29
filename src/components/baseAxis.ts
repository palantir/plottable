///<reference path="../reference.ts" />

module Plottable {
  export class BaseAxis extends Component {
    public axisElement: D3.Selection;
    private baseline: D3.Selection;
    private scale: Scale;
    private orientation: string;
    public _formatter: (n: any) => string;
    private _tickLength = 5;
    private _tickLabelPadding = 3;
    private isHorizontal = true;
    public _showEndTickLabels = false;
    private _maxWidth = 0;
    private _maxHeight = 0;

    /**
     * Creates a BaseAxis.
     *
     * @constructor
     * @param {Scale} scale The Scale to base the NumberAxis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {(n: any) => string} [formatter] A function to format tick labels.
     */
    constructor(scale: Scale, orientation: string, formatter?: (n: any) => string) {
      super();
      this.scale = scale;
      var orientationLC = orientation.toLowerCase();

      if (orientationLC !== "top" &&
          orientationLC !== "bottom" &&
          orientationLC !== "left" &&
          orientationLC !== "right") {
        throw new Error("unsupported orientation for Axis");
      }
      this.orientation = orientationLC;

      this.classed("axis", true);
      if (this.orientation === "top" || this.orientation === "bottom") {
        this.isHorizontal = true;
        this.classed("x-axis", true);
        this._maxHeight = 30;
      } else {
        this.isHorizontal = false;
        this.classed("y-axis", true);
        this._maxWidth = 50;
      }

      this._formatter = (formatter != null) ? formatter : (n: any) => String(n);

      this._registerToBroadcaster(this.scale, () => this.rescale());
    }

    public _setup() {
      super._setup();
      this.baseline = this.content.append("line").classed("baseline", true);
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      return {
        width : Math.min(offeredWidth, this._maxWidth),
        height: Math.min(offeredHeight, this._maxHeight),
        wantsWidth: !this.isHorizontal && offeredWidth < this._maxWidth,
        wantsHeight: this.isHorizontal && offeredHeight < this._maxHeight
      };
    }

    // function for generating ticks; to be overriden by subclasses
    public _getTicks(): any[] {
      return [];
    }

    public _doRender() {
      var domain = this.scale.domain();

      var baselineAttributes = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      };

      var tickValues = this._getTicks();

      var tickSelection = this.content.selectAll(".tick").data(tickValues);
      var tickEnterSelection = tickSelection.enter().append("g").classed("tick", true);
      tickEnterSelection.append("line").classed("tick-mark", true);
      tickSelection.exit().remove();

      var tickGroupAttrHash = {
        x: (d: any) => 0,
        y: (d: any) => 0
      };

      if (this.isHorizontal) {
        tickGroupAttrHash["x"] = (d: any) => this.scale.scale(d);
      } else {
        tickGroupAttrHash["y"] = (d: any) => this.scale.scale(d);
      }

      var tickTransformGenerator = (d: any, i: number) => {
        return "translate(" + tickGroupAttrHash["x"](d) + ", " + tickGroupAttrHash["y"](d) + ")";
      };

      var tickMarkAttrHash = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      };

      switch(this.orientation) {
        case "bottom":
          baselineAttributes.x2 = this.availableWidth;

          tickMarkAttrHash["y2"] = this._tickLength;
          break;

        case "top":
          baselineAttributes.x2 = this.availableWidth;
          baselineAttributes.y1 = this.availableHeight;
          baselineAttributes.y2 = this.availableHeight;

          tickMarkAttrHash["y1"] = this.availableHeight;
          tickMarkAttrHash["y2"] = this.availableHeight - this._tickLength;
          break;

        case "left":
          baselineAttributes.x1 = this.availableWidth;
          baselineAttributes.x2 = this.availableWidth;
          baselineAttributes.y2 = this.availableHeight;

          tickMarkAttrHash["x1"] = this.availableWidth;
          tickMarkAttrHash["x2"] = this.availableWidth - this._tickLength;
          break;

        case "right":
          baselineAttributes.y2 = this.availableHeight;

          tickMarkAttrHash["x2"] = this._tickLength;
          break;
      }

      this.baseline.attr(baselineAttributes);
      tickSelection.select("text").text(this._formatter);
      tickSelection.each(function (d: any) {
        var tick = d3.select(this);
        tick.select("line").attr(tickMarkAttrHash);
      });
      tickSelection.attr("transform", tickTransformGenerator);

      return this;
    }

    private rescale() {
      return (this.element != null) ? this._render() : null;
    }

    /**
     * Sets a new tick formatter.
     *
     * @param {(n: any) => string} formatter A function to format tick labels.
     * @returns {BaseAxis} The calling BaseAxis.
     */
    public formatter(formatFunction: (n: any) => string) {
      this._formatter = formatFunction;
      return this;
    }

    /**
     * Gets or sets the length of each tick mark.
     *
     * @param {number} [length] The length of each tick.
     * @returns {number|BaseAxis} The current tick mark length, or the calling BaseAxis.
     */
    public tickLength(): number;
    public tickLength(length: number): BaseAxis;
    public tickLength(length?: number): any {
      if (length == null) {
        return this._tickLength;
      } else {
        this._tickLength = length;
        return this;
      }
    }

    /**
     * Gets or sets the padding between each tick mark and its associated label.
     *
     * @param {number} [length] The length of each tick.
     * @returns {number|BaseAxis} The current tick mark length, or the calling BaseAxis.
     */
    public tickLabelPadding(): number;
    public tickLabelPadding(padding: number): BaseAxis;
    public tickLabelPadding(padding?: number): any {
      if (padding == null) {
        return this._tickLabelPadding;
      } else {
        this._tickLabelPadding = padding;
        return this;
      }
    }

    public showEndTickLabels(): boolean;
    public showEndTickLabels(show: boolean): BaseAxis;
    public showEndTickLabels(show?: boolean): any {
      if (show == null) {
        return this._showEndTickLabels;
      }
      this._showEndTickLabels = show;
      return this;
    }

    public maxWidth(): number;
    public maxWidth(width: number): BaseAxis;
    public maxWidth(width?: number): any {
      if (width == null) {
        return this._maxWidth;
      } else {
        this._maxWidth = width;
        return this;
      }
    }


    public maxHeight(): number;
    public maxHeight(height: number): BaseAxis;
    public maxHeight(height?: number): any {
      if (height == null) {
        return this._maxHeight;
      } else {
        this._maxHeight = height;
        return this;
      }
    }
  }
}
