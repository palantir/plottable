///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Axis extends Abstract.Component {
    public static TICK_MARK_CLASS = "tick-mark";
    public static TICK_LABEL_CLASS = "tick-label";
    public axisElement: D3.Selection;
    public _tickMarkContainer: D3.Selection;
    public _tickLabelContainer: D3.Selection;
    public _baseline: D3.Selection;
    public _scale: Abstract.Scale;
    public _formatter: Abstract.Formatter;
    public _orientation: string;
    public _width: any = "auto";
    public _height: any = "auto";
    public _computedWidth: number;
    public _computedHeight: number;
    private _tickLength = 5;
    private _tickLabelPadding = 3;
    private _showEndTickLabels = false;

    constructor(scale: Abstract.Scale, orientation: string, formatter?: any) {
      super();
      if (scale == null || orientation == null) {throw new Error("Axis requires a scale and orientation");}
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

      this._scale.broadcaster.registerListener(this, () => this.rescale());
    }

    public _isHorizontal() {
      return this._orientation === "top" || this._orientation === "bottom";
    }

    public _computeWidth() {
      // to be overridden by subclass logic
      this._computedWidth = this._tickLength;
      return this._computedWidth;
    }

    public _computeHeight() {
      // to be overridden by subclass logic
      this._computedHeight = this._tickLength;
      return this._computedHeight;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requestedWidth = this._width;
      var requestedHeight = this._height;

      if (this._isHorizontal()) {
        if (this._height === "auto") {
          if (this._computedHeight == null) {
            this._computeHeight();
          }
          requestedHeight = this._computedHeight;
        }
        requestedWidth = 0;
      } else { // vertical
        if (this._width === "auto") {
          if (this._computedWidth == null) {
            this._computeWidth();
          }
          requestedWidth = this._computedWidth;
        }
        requestedHeight = 0;
      }

      return {
        width : Math.min(offeredWidth, requestedWidth),
        height: Math.min(offeredHeight, requestedHeight),
        wantsWidth: !this._isHorizontal() && offeredWidth < requestedWidth,
        wantsHeight: this._isHorizontal() && offeredHeight < requestedHeight
      };
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      if (this._isHorizontal()) {
        this._scale.range([0, this.availableWidth]);
      } else {
        this._scale.range([this.availableHeight, 0]);
      }
      return this;
    }

    public _setup() {
      super._setup();
      this._tickMarkContainer = this.content.append("g")
                                            .classed(Axis.TICK_MARK_CLASS + "-container", true);
      this._tickLabelContainer = this.content.append("g")
                                             .classed(Axis.TICK_LABEL_CLASS + "-container", true);
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
      var tickMarkValues = this._getTickValues();
      var tickMarks = this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS).data(tickMarkValues);
      tickMarks.enter().append("line").classed(Axis.TICK_MARK_CLASS, true);
      tickMarks.attr(this._generateTickMarkAttrHash());
      tickMarks.exit().remove();
      this._baseline.attr(this._generateBaselineAttrHash());

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
        x1: <any> 0,
        y1: <any> 0,
        x2: <any> 0,
        y2: <any> 0
      };

      var scalingFunction = (d: any) => this._scale.scale(d);
      if (this._isHorizontal()) {
        tickMarkAttrHash["x1"] = scalingFunction;
        tickMarkAttrHash["x2"] = scalingFunction;
      } else {
        tickMarkAttrHash["y1"] = scalingFunction;
        tickMarkAttrHash["y2"] = scalingFunction;
      }

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
        return this.availableWidth;
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
     * @param {number|String} h A fixed height for the Axis, or "auto" for automatic mode.
     * @returns {Axis} The calling Axis.
     */
    public height(h: any): Axis;
    public height(h?: any): any {
      if (h == null) {
        return this.availableHeight;
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
    public formatter(formatter: any) {
      if (typeof(formatter) === "function") {
        formatter = new Plottable.Formatter.Custom(formatter);
        formatter.showOnlyUnchangedValues(false);
      }
      this._formatter = formatter;
      this._invalidateLayout();
      return this;
    }

    /**
     * Gets the current tick mark length.
     *
     * @returns {number} The current tick mark length.
     */
    public tickLength(): number;
    /**
     * Sets the tick mark length.
     *
     * @param {number} length The length of each tick.
     * @returns {BaseAxis} The calling Axis.
     */
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
     * Gets the padding between each tick mark and its associated label.
     *
     * @returns {number} The current padding, in pixels.
     */
    public tickLabelPadding(): number;
    /**
     * Sets the padding between each tick mark and its associated label.
     *
     * @param {number} padding The desired padding, in pixels.
     * @returns {Axis} The calling Axis.
     */
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

    /**
     * Gets the orientation of the Axis.
     *
     * @returns {string} The current orientation.
     */
    public orient(): string;
    /**
     * Sets the orientation of the Axis.
     *
     * @param {string} newOrientation The desired orientation (top/bottom/left/right).
     * @returns {Axis} The calling Axis.
     */
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
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Checks whether the Axis is currently set to show the first and last
     * tick labels.
     *
     * @returns {boolean}
     */
    public showEndTickLabels(): boolean;
    /**
     * Set whether or not to show the first and last tick labels.
     *
     * @param {boolean} show Whether or not to show the first and last labels.
     * @returns {Axis} The calling Axis.
     */
    public showEndTickLabels(show: boolean): Axis;
    public showEndTickLabels(show?: boolean): any {
      if (show == null) {
        return this._showEndTickLabels;
      }
      this._showEndTickLabels = show;
      this._render();
      return this;
    }

    public _hideEndTickLabels() {
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

    public _hideOverlappingTickLabels() {
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
