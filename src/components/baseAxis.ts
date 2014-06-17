///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Axis extends Abstract.Component {
    public static TICK_LABEL_CLASS = "tick-label";
    public axisElement: D3.Selection;
    public _ticksContainer: D3.Selection;
    public _ticks: D3.UpdateSelection;
    public _baseline: D3.Selection;
    public _scale: Abstract.Scale;
    public _formatter: Abstract.Formatter;
    public _orientation: string;
    private _tickLength = 5;
    private _tickLabelPadding = 3;
    public _width: any = "auto";
    public _height: any = "auto";
    public _computedWidth: number;
    public _computedHeight: number;

    /**
     * Creates a BaseAxis.
     *
     * @constructor
     * @param {Scale} scale The Scale to base the BaseAxis on.
     * @param {string} orientation The orientation of the BaseAxis (top/bottom/left/right)
     * @param {Formatter} [formatter]
     */
    constructor(scale: Abstract.Scale, orientation: string, formatter?: Abstract.Formatter) {
      super();
      this._scale = scale;
      this.orient(orientation);

      this.classed("axis", true);
      if (this._isHorizontal()) {
        this.classed("x-axis", true);
      } else {
        this.classed("y-axis", true);
      }

      if (formatter == null) {
        formatter = new Plottable.Formatter.General();
        formatter.showOnlyUnchangedValues(false);
      }
      this.formatter(formatter);

      this._registerToBroadcaster(this._scale, () => this.rescale());
    }

    public _isHorizontal() {
      return this._orientation === "top" || this._orientation === "bottom";
    }

    public _setup() {
      super._setup();
      this._ticksContainer = this.content.append("g").classed("ticks-container", true);
      this._baseline = this.content.append("line").classed("baseline", true);
      return this;
    }

    /*
     * Function for generating tick values in data-space (as opposed to pixel values).
     * To be implemented by subclasses.
     */
    public _getTickValues(): any[] {
      return [];
    }

    public _doRender() {
      var tickValues = this._getTickValues();
      this._ticks = this._ticksContainer.selectAll(".tick").data(tickValues, (d) => d);
      var tickEnterSelection = this._ticks.enter().append("g").classed("tick", true);
      tickEnterSelection.append("line").classed("tick-mark", true);
      this._ticks.exit().remove();

      var tickXTransformFunction = this._isHorizontal() ? (d: any) => this._scale.scale(d) : (d: any) => 0;
      var tickYTransformFunction = this._isHorizontal() ? (d: any) => 0 : (d: any) => this._scale.scale(d);

      var tickTransformGenerator = (d: any, i: number) => {
        return "translate(" + tickXTransformFunction(d) + ", " + tickYTransformFunction(d) + ")";
      };

      this._baseline.attr(this._generateBaselineAttrHash());
      this._ticks.select("line").attr(this._generateTickMarkAttrHash());
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

    public _invalidateLayout() {
      super._invalidateLayout();
      this._computedWidth = null;
      this._computedHeight = null;
    }

    /**
     * Gets the current width.
     *
     * @returns {number} The current width.
     */
    public width(): number;
    /**
     * Sets a user-specified width.
     *
     * @param {number|String} w A fixed width for the Axis, or "auto" for automatic mode.
     * @returns {Axis} The calling Axis.
     */
    public width(w: any): Axis;
    public width(w?: any): any {
      if (w == null) {
        if (this._width === "auto") {
          return this._computedWidth;
        }
        return <number> this._width;
      } else {
        if (this._isHorizontal()) {
          throw new Error("width cannot be set on a horizontal Axis");
        }
        if (w !== "auto" && w < 0) {
          throw new Error("invalid value for width");
        }
        this._width = w;
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Gets the current height.
     *
     * @returns {number} The current height.
     */
    public height(): number;
    /**
     * Sets a user-specified height.
     *
     * @param {number|String} w A fixed height for the Axis, or "auto" for automatic mode.
     * @returns {Axis} The calling Axis.
     */
    public height(h: any): Axis;
    public height(h?: any): any {
      if (h == null) {
        if (this._height === "auto") {
          return this._computedHeight;
        }
        return <number> this._height;
      } else {
        if (!this._isHorizontal()) {
          throw new Error("height cannot be set on a vertical Axis");
        }
        if (h !== "auto" && h < 0) {
          throw new Error("invalid value for height");
        }
        this._height = h;
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Sets a new tick formatter.
     *
     * @param {Abstract.Formatter} formatter
     * @returns {BaseAxis} The calling BaseAxis.
     */
    public formatter(formatter: Abstract.Formatter) {
      this._formatter = formatter;
      this._invalidateLayout();
      return this;
    }

    /**
     * Gets or sets the length of each tick mark.
     *
     * @param {number} [length] The length of each tick.
     * @returns {number|BaseAxis} The current tick mark length, or the calling BaseAxis.
     */
    public tickLength(): number;
    public tickLength(length: number): Axis;
    public tickLength(length?: number): any {
      if (length == null) {
        return this._tickLength;
      } else {
        if (length < 0) {
          throw new Error("tick length must be positive");
        }
        this._tickLength = length;
        this._invalidateLayout();
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
    public tickLabelPadding(padding: number): Axis;
    public tickLabelPadding(padding?: number): any {
      if (padding == null) {
        return this._tickLabelPadding;
      } else {
        if (padding < 0) {
          throw new Error("tick label padding must be positive");
        }
        this._tickLabelPadding = padding;
        this._invalidateLayout();
        return this;
      }
    }

    public orient(): string;
    public orient(newOrientation: string): Axis;
    public orient(newOrientation?: string): any {
      if (newOrientation == null) {
        return this._orientation;
      } else {
        var newOrientationLC = newOrientation.toLowerCase();
        if (newOrientationLC !== "top" &&
            newOrientationLC !== "bottom" &&
            newOrientationLC !== "left" &&
            newOrientationLC !== "right") {
          throw new Error("unsupported orientation");
        }
        this._orientation = newOrientationLC;
        this._render();
        return this;
      }
    }
  }
}
}
