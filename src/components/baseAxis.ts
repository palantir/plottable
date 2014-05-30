///<reference path="../reference.ts" />

module Plottable {
  export class BaseAxis extends Component {
    public axisElement: D3.Selection;
    public _ticks: D3.UpdateSelection;
    public _baseline: D3.Selection;
    public _scale: Scale;
    public _formatter: (n: any) => string;
    public _orientation: string;
    private _tickLength = 5;
    private _tickLabelPadding = 3;
    private _maxWidth = 0;
    private _maxHeight = 0;

    /**
     * Creates a BaseAxis.
     *
     * @constructor
     * @param {Scale} scale The Scale to base the BaseAxis on.
     * @param {string} orientation The orientation of the BaseAxis (top/bottom/left/right)
     * @param {(n: any) => string} [formatter] A function to format tick labels.
     */
    constructor(scale: Scale, orientation: string, formatter?: (n: any) => string) {
      super();
      this._scale = scale;
      var orientationLC = orientation.toLowerCase();

      if (orientationLC !== "top" &&
          orientationLC !== "bottom" &&
          orientationLC !== "left" &&
          orientationLC !== "right") {
        throw new Error("unsupported orientation");
      }
      this._orientation = orientationLC;

      this.classed("axis", true);
      if (this._orientation === "top" || this._orientation === "bottom") {
        this.classed("x-axis", true);
        this._maxHeight = 30;
      } else {
        this.classed("y-axis", true);
        this._maxWidth = 50;
      }

      this._formatter = (formatter != null) ? formatter : (n: any) => String(n);

      this._registerToBroadcaster(this._scale, () => this.rescale());
    }

    public _isHorizontal() {
      return this._orientation === "top" || this._orientation === "bottom";
    }

    public _setup() {
      super._setup();
      this._baseline = this.content.append("line").classed("baseline", true);
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      return {
        width : Math.min(offeredWidth, this._maxWidth),
        height: Math.min(offeredHeight, this._maxHeight),
        wantsWidth: !this._isHorizontal() && offeredWidth < this._maxWidth,
        wantsHeight: this._isHorizontal() && offeredHeight < this._maxHeight
      };
    }

    /*
     * Function for generating tick values in data-space (as opposed to pixel values); to be overriden by subclasses
     */
    public _getTickValues(): any[] {
      return [];
    }

    public _doRender() {
      var tickValues = this._getTickValues();
      this._ticks = this.content.selectAll(".tick").data(tickValues);
      var tickEnterSelection = this._ticks.enter().append("g").classed("tick", true);
      tickEnterSelection.append("line").classed("tick-mark", true);
      this._ticks.exit().remove();

      var tickGroupAttrHash = {
        x: (d: any) => 0,
        y: (d: any) => 0
      };

      if (this._isHorizontal()) {
        tickGroupAttrHash["x"] = (d: any) => this._scale.scale(d);
      } else {
        tickGroupAttrHash["y"] = (d: any) => this._scale.scale(d);
      }

      var tickTransformGenerator = (d: any, i: number) => {
        return "translate(" + tickGroupAttrHash["x"](d) + ", " + tickGroupAttrHash["y"](d) + ")";
      };

      var tickMarkAttrHash = this._generateTickMarkAttrHash();

      this._baseline.attr(this._generateBaselineAttrHash());
      this._ticks.each(function (d: any) {
        var tick = d3.select(this);
        tick.select("line").attr(tickMarkAttrHash);
      });
      this._ticks.attr("transform", tickTransformGenerator);

      return this;
    }

    public _generateBaselineAttrHash() {
      var baselineAttrHash = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      };

      switch(this._orientation) {
        case "bottom":
          baselineAttrHash.x2 = this.availableWidth;
          break;

        case "top":
          baselineAttrHash.x2 = this.availableWidth;
          baselineAttrHash.y1 = this.availableHeight;
          baselineAttrHash.y2 = this.availableHeight;
          break;

        case "left":
          baselineAttrHash.x1 = this.availableWidth;
          baselineAttrHash.x2 = this.availableWidth;
          baselineAttrHash.y2 = this.availableHeight;
          break;

        case "right":
          baselineAttrHash.y2 = this.availableHeight;
          break;
      }

      return baselineAttrHash;
    }

    public _generateTickMarkAttrHash() {
      var tickMarkAttrHash = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      };

      switch(this._orientation) {
        case "bottom":
          tickMarkAttrHash["y2"] = this._tickLength;
          break;

        case "top":
          tickMarkAttrHash["y1"] = this.availableHeight;
          tickMarkAttrHash["y2"] = this.availableHeight - this._tickLength;
          break;

        case "left":
          tickMarkAttrHash["x1"] = this.availableWidth;
          tickMarkAttrHash["x2"] = this.availableWidth - this._tickLength;
          break;

        case "right":
          tickMarkAttrHash["x2"] = this._tickLength;
          break;
      }

      return tickMarkAttrHash;
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


    /**
     * Gets or sets the maximum width of the BaseAxis.
     *
     * @param {number} [width] The desired maximum width.
     * @returns {number|BaseAxis} The current maximum width, or the calling BaseAxis.
     */
    public maxWidth(): number;
    public maxWidth(width: number): BaseAxis;
    public maxWidth(width?: number): any {
      if (width == null) {
        return this._maxWidth;
      } else {
        if (this._isHorizontal()) {
          throw new Error("Can't set width on a horizontal axis");
        }
        this._maxWidth = width;
        return this;
      }
    }

    /**
     * Gets or sets the maximum height of the BaseAxis.
     *
     * @param {number} [height] The desired maximum height.
     * @returns {number|BaseAxis} The current maximum height, or the calling BaseAxis.
     */
    public maxHeight(): number;
    public maxHeight(height: number): BaseAxis;
    public maxHeight(height?: number): any {
      if (height == null) {
        return this._maxHeight;
      } else {
        if (!this._isHorizontal()) {
          throw new Error("Can't set height on a vertical axis");
        }
        this._maxHeight = height;
        return this;
      }
    }
  }
}
