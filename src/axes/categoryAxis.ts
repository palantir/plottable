namespace Plottable.Axes {
  export interface DownsampleInfo {
    domain: string[];
    stepWidth: number;
  }

  export class Category extends Axis<string> {
    /**
     * How many pixels to give labels at minimum before downsampling takes effect.
     */
    private static _MINIMUM_WIDTH_PER_LABEL_PX = 15;

    private _tickLabelAngle = 0;

    /**
     * Maximum allowable px width of tick labels.
     */
    private _tickLabelMaxWidth: number;

    /**
     * Maximum allowable number of wrapped lines for tick labels.
     */
    private _tickLabelMaxLines: number;

    private _measurer: SVGTypewriter.CacheMeasurer;

    /**
     * A Wrapper configured according to the other properties on this axis.
     * @returns {SVGTypewriter.Wrapper}
     */
    private get _wrapper() {
      const wrapper = new SVGTypewriter.Wrapper();
      if (this._tickLabelMaxLines != null) {
        wrapper.maxLines(this._tickLabelMaxLines)
      }
      return wrapper;
    }

    /**
     * A Writer attached to this measurer and wrapper.
     * @returns {SVGTypewriter.Writer}
     */
    private get _writer() {
      return new SVGTypewriter.Writer(this._measurer, this._wrapper);
    }

    private _tickTextAlignment: string = null;
    private _tickTextPadding: number = 0;

    /**
     * Constructs a Category Axis.
     *
     * A Category Axis is a visual representation of a Category Scale.
     *
     * @constructor
     * @param {Scales.Category} scale
     * @param {AxisOrientation} [orientation="bottom"] Orientation of this Category Axis.
     */
    constructor(scale: Scales.Category, orientation: AxisOrientation = "bottom") {
      super(scale, orientation);
      this.addClass("category-axis");
    }

    protected _setup() {
      super._setup();
      this._measurer = new SVGTypewriter.CacheMeasurer(this._tickLabelContainer);
    }

    protected _rescale() {
      return this.redraw();
    }

    /**
     * Compute space requirements for this Category Axis. Category Axes have two primary space requirements:
     *
     * 1) width/height needed by the tick lines (including annotations, padding, and margins).
     * 2) width/height needed by the tick text.
     *
     * We requested space is the sum of the lines and text.
     * @param offeredWidth
     * @param offeredHeight
     * @returns {any}
     */
    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      let widthRequiredByTicks = this.isHorizontal() ? 0 : this._tickSpaceRequired() + this.margin();
      let heightRequiredByTicks = this.isHorizontal() ? this._tickSpaceRequired() + this.margin() : 0;

      if (this._scale.domain().length === 0) {
        return {
          minWidth: 0,
          minHeight: 0,
        };
      }

      if (this.annotationsEnabled()) {
        let tierTotalHeight = this._annotationTierHeight() * this.annotationTierCount();
        if (this.isHorizontal()) {
          heightRequiredByTicks += tierTotalHeight;
        } else {
          widthRequiredByTicks += tierTotalHeight;
        }
      }

      let measureResult = this._measureTickLabels(offeredWidth, offeredHeight);

      return {
        minWidth: measureResult.usedWidth + widthRequiredByTicks,
        minHeight: measureResult.usedHeight + heightRequiredByTicks,
      };
    }

    protected _coreSize() {
      let relevantDimension = this.isHorizontal() ? this.height() : this.width();
      let relevantRequestedSpaceDimension = this.isHorizontal() ?
                                              this.requestedSpace(this.width(), this.height()).minHeight :
                                              this.requestedSpace(this.width(), this.height()).minWidth;
      let marginAndAnnotationSize = this.margin() + this._annotationTierHeight();
      let axisHeightWithoutMargin = relevantRequestedSpaceDimension - marginAndAnnotationSize;
      return Math.min(axisHeightWithoutMargin, relevantDimension);
    }

    protected _getTickValues() {
      return this.getDownsampleInfo().domain;
    }

    /**
     * Take the scale and drop ticks at regular intervals such that the resultant ticks are all a reasonable minimum
     * distance apart. Return the resultant ticks to render, as well as the new stepWidth between them.
     *
     * @param {Scales.Category} scale - The scale being downsampled. Defaults to this Axis' scale.
     * @return {DownsampleInfo} an object holding the resultant domain and new stepWidth.
     */
    public getDownsampleInfo(scale = <Scales.Category> this._scale): DownsampleInfo {
      const downsampleRatio = Math.ceil(Category._MINIMUM_WIDTH_PER_LABEL_PX / scale.stepWidth());
      return {
        domain: scale.domain().filter((d, i) => i % downsampleRatio === 0),
        stepWidth: downsampleRatio * scale.stepWidth(),
      };
    }

    /**
     * Gets the current alignment. If not set, null will be returned.
     */
    public tickTextAlignment(): string;
    /**
     * Set alignment of tick labels. Must be one of "left", "right",
     * or "center", or a falsy value. Setting to a falsy value will
     * reset tick label alignment to the default alignment.
     *
     * Note that alignment is applied before rotation (see "{@link
     * tickLabelAngle}").
     *
     * @param {String} tickTextAlignment One of "left", "right", "center",
     * or a falsy value.
     *
     * @returns {Category} The calling Category.
     */
    public tickTextAlignment(tickTextAlignment: string): this;
    public tickTextAlignment(tickTextAlignment?: string): any {
      if (arguments.length === 0) {
        return this._tickTextAlignment;
      }

      if (! tickTextAlignment) {
        this._tickTextAlignment = null;
      } else {
        let v = tickTextAlignment.toLowerCase();
        if (v !== "left" && v !== "right" && v !== "center") {
          throw new Error("tickTextAlignment '" + tickTextAlignment + "' not supported. Must be left, right, or center.");
        }
        this._tickTextAlignment = v;
      }

      return this;
    }

    /**
     * Returns the current padding between tick labels and the
     * opposite edge of the axis.
     */
    public tickTextPadding(): number;
    /**
     * Sets Padding between labels and outer edge of the axis (i.e.,
     * the edge opposite the plot, as defined by the axis' {@link
     * orientation}).
     *
     * Padding will only be applied when {@link tickTextAlignment} is
     * set and either of the following conditions hold:
     *
     *   * Orientation is "left" or "right"; labels are not rotated;
     *     for "left" orientation, {@link tickTextAlignment} must be
     *     "left". For "right" orientation, {@link tickTextAlignment}
     *     must be "right".
     *
     *   * Orientation is "top" or "bottom"; labels are rotated. For
     *     "top" orientation and 90 rotation, alignment must "left";
     *     for -90 rotation, alignment must be "right". For "bottom"
     *     orientation and 90 rotation, alignment must "right"; For
     *     -90 rotation, alignment must be "left".
     *
     * @param {Number} tickTextPadding Padding in pixels.
     *
     * @returns {Category} The calling Category.
     */
    public tickTextPadding(tickTextPadding: number): this;
    public tickTextPadding(tickTextPadding?: number): any {
      if (arguments.length === 0) {
        return this._tickTextPadding;
      }

      this._tickTextPadding = tickTextPadding ? tickTextPadding : 0;
      return this;
    }

    /**
     * Gets the tick label angle in degrees.
     */
    public tickLabelAngle(): number;
    /**
     * Sets the tick label angle in degrees.
     * Right now only -90/0/90 are supported. 0 is horizontal.
     *
     * @param {number} angle
     * @returns {Category} The calling Category Axis.
     */
    public tickLabelAngle(angle: number): this;
    public tickLabelAngle(angle?: number): any {
      if (angle == null) {
        return this._tickLabelAngle;
      }
      if (angle !== 0 && angle !== 90 && angle !== -90) {
        throw new Error("Angle " + angle + " not supported; only 0, 90, and -90 are valid values");
      }
      this._tickLabelAngle = angle;
      this.redraw();
      return this;
    }

    public tickLabelMaxWidth(): number;
    public tickLabelMaxWidth(maxWidth: number): this;
    /**
     * Set or get the tick label's max width on this axis. When set, tick labels will be truncated with ellipsis to be
     * at most `tickLabelMaxWidth()` pixels wide. This ensures the axis doesn't grow to an undesirable width.
     *
     * Passing no arguments retrieves the value, while passing a number sets the value. Pass undefined to un-set the max
     * width.
     * @param maxWidth
     * @returns {number | this}
     */
    public tickLabelMaxWidth(maxWidth?: number): number | this {
      // allow user to un-set tickLabelMaxWidth by passing in null or undefined explicitly
      if (arguments.length === 0) {
        return this._tickLabelMaxWidth;
      }
      this._tickLabelMaxWidth = maxWidth;
      this.redraw();
      return this;
    }

    public tickLabelMaxLines(): number;
    public tickLabelMaxLines(maxLines: number): this;

    /**
     * Set or get the tick label's max number of wrapped lines on this axis. By default, a Category Axis will line-wrap
     * long tick labels onto multiple lines in order to fit the width of the axis. When set, long tick labels will be
     * rendered on at most `tickLabelMaxLines()` lines. This ensures the axis doesn't grow to an undesirable height.
     *
     * Passing no arguments retrieves the value, while passing a number sets the value. Pass undefined to un-set the
     * max lines.
     * @param maxLines
     * @returns {number | this}
     */
    public tickLabelMaxLines(maxLines?: number): number | this {
      // allow user to un-set tickLabelMaxLines by passing in null or undefined explicitly
      if (arguments.length === 0) {
        return this._tickLabelMaxLines;
      }
      this._tickLabelMaxLines = maxLines;
      this.redraw();
      return this;
    }

    /**
     * Return the space required by the ticks, padding included.
     * @returns {number}
     */
    private _tickSpaceRequired() {
      return this._maxLabelTickLength() + this.tickLabelPadding();
    }

    private _calcTextPadding(): { translate: { x: number, y: number }, pad: { x: number, y: number }} {
      // Padding always moves the label *away* from the outer edge of
      // the axis (tickLabelPadding moves labels away from the inner
      // edge of the axis already).

      // The pad value gives the amount of padding that must be
      // subtracted from overall space when renderign text (import for
      // proper line breaking).
      //
      // The translate value gives the amount the label should be
      // moved to give the proper padding.
      //
      // Pad will always be a positive amount, but translate can be
      // negative depending on rotation of labels and axis
      // orientation.
      let pad = { x: 0, y: 0 };
      let translate = { x: 0, y: 0 };

      if (this.tickLabelAngle() === 0 && ! this.isHorizontal()) {
        if (this.orientation() === "right" && this.tickTextAlignment() === "right") {
          pad.x = this.tickTextPadding();
          translate.x = this.tickTextPadding() * -1;
        } else if (this.orientation() === "left" && this.tickTextAlignment() === "left") {
          pad.x = this.tickTextPadding();
          translate.x = this.tickTextPadding();
        }
      } else if (this.tickLabelAngle() === -90) {
        if (this.orientation() === "top" && this.tickTextAlignment() === "right") {
          pad.y = this.tickTextPadding();
          translate.y = this.tickTextPadding();
        } else if (this.orientation() === "bottom" && this.tickTextAlignment() === "left") {
          pad.y = this.tickTextPadding();
          translate.y = this.tickTextPadding() * -1;
        }
      } else if (this.tickLabelAngle() === 90) {
        if (this.orientation() === "top" && this.tickTextAlignment() === "left") {
          pad.y = this.tickTextPadding();
          translate.y = this.tickTextPadding();
        } else if (this.orientation() === "bottom" && this.tickTextAlignment() === "right") {
          pad.y = this.tickTextPadding();
          translate.y = this.tickTextPadding() * -1;
        }
      }

      return { pad: pad, translate: translate };
    }

    /**
     * Write ticks to the DOM.
     * @param {Plottable.Scales.Category} scale The scale this axis is representing.
     * @param {d3.Selection} ticks The tick elements to write.
     */
    private _drawTicks(stepWidth: number, ticks: d3.Selection<string>) {
      let self = this;
      let xAlign: {[s: string]: string};
      let yAlign: {[s: string]: string};
      let result = this._calcTextPadding();
      let pad = result.pad;
      let translate = result.translate;

      switch (this.tickLabelAngle()) {
        case 0:
          xAlign = {left: "right", right: "left", top: "center", bottom: "center"};
          yAlign = {left: "center", right: "center", top: "bottom", bottom: "top"};
          break;
        case 90:
          xAlign = {left: "center", right: "center", top: "right", bottom: "left"};
          yAlign = {left: "top", right: "bottom", top: "center", bottom: "center"};
          break;
        case -90:
          xAlign = {left: "center", right: "center", top: "left", bottom: "right"};
          yAlign = {left: "bottom", right: "top", top: "center", bottom: "center"};
          break;
      }

      ticks.each(function (this: SVGElement, d: string) {
        let width = self.isHorizontal() ? stepWidth : self.width() - self._tickSpaceRequired() - pad.x;
        let height = self.isHorizontal() ? self.height() - self._tickSpaceRequired() - pad.y : stepWidth;
        let writeOptions = {
          selection: d3.select(this),
          xAlign: self.tickTextAlignment() || xAlign[self.orientation()],
          yAlign: yAlign[self.orientation()],
          textRotation: self.tickLabelAngle(),
        };

        if (self._tickLabelMaxWidth != null) {
          // for left-oriented axes, we must move the ticks by the amount we've cut off in order to keep the text
          // aligned with the side of the ticks
          if (self.orientation() === "left" && width > self._tickLabelMaxWidth) {
            const cutOffWidth = width - self._tickLabelMaxWidth;
            const newTransform = `${writeOptions.selection.attr("transform")} translate(${cutOffWidth}, 0)`;
            writeOptions.selection.attr("transform", newTransform);
          }
          width = Math.min(width, self._tickLabelMaxWidth);
        }

        self._writer.write(self.formatter()(d), width, height, writeOptions);

        if (translate.x !== 0 || translate.y !== 0) {
          let text = writeOptions.selection;
          text.attr("transform", "translate(" + translate.x + ", " + translate.y + ") " + text.attr("transform"));
        }
      });
    }

    /**
     * Measures the size of the tick labels without making any (permanent) DOM changes.
     *
     * @param {number} axisWidth Width available for this axis.
     * @param {number} axisHeight Height available for this axis.
     * @param {Plottable.Scales.Category} scale The scale this axis is representing.
     * @param {string[]} ticks The strings that will be printed on the ticks.
     */
    private _measureTickLabels(axisWidth: number, axisHeight: number) {
      const thisScale = <Scales.Category> this._scale;

      // set up a test scale to simulate rendering ticks with the given width and height.
      const scale = new Scales.Category()
        .domain(thisScale.domain())
        .innerPadding(thisScale.innerPadding())
        .outerPadding(thisScale.outerPadding())
        .range([0, this.isHorizontal() ? axisWidth : axisHeight]);

      const { domain, stepWidth } = this.getDownsampleInfo(scale);
      let tickTextPadding = this._calcTextPadding().pad;

      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      // the width (x-axis specific) available to a single tick label.
      let width = axisWidth - this._tickSpaceRequired() - tickTextPadding.x; // default for left/right
      if (this.isHorizontal()) { // case for top/bottom
        width = stepWidth; // defaults to the band width
        if (this._tickLabelAngle !== 0) { // rotated label
          width = axisHeight - this._tickSpaceRequired() - tickTextPadding.y; // use the axis height
        }
        // HACKHACK: Wrapper fails under negative circumstances
        width = Math.max(width, 0);
      }

      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      // the height (y-axis specific) available to a single tick label.
      let height = stepWidth; // default for left/right
      if (!this.isHorizontal()) { // case for top/bottom
        height = axisHeight - this._tickSpaceRequired();
        if (this._tickLabelAngle !== 0) { // rotated label
          height = axisWidth - this._tickSpaceRequired();
        }
        // HACKHACK: Wrapper fails under negative circumstances
        height = Math.max(height, 0);
      }

      if (this._tickLabelMaxWidth != null) {
        width = Math.min(width, this._tickLabelMaxWidth);
      }

      let wrappingResults = domain.map((s: string) => {
        return this._wrapper.wrap(this.formatter()(s), this._measurer, width, height);
      });

      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      let widthFn = (this.isHorizontal() && this._tickLabelAngle === 0) ? d3.sum : Utils.Math.max;
      let heightFn = (this.isHorizontal() && this._tickLabelAngle === 0) ? Utils.Math.max : d3.sum;

      let usedWidth = widthFn<SVGTypewriter.IWrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.IWrappingResult) => this._measurer.measure(t.wrappedText).width, 0);
      let usedHeight = heightFn<SVGTypewriter.IWrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.IWrappingResult) => this._measurer.measure(t.wrappedText).height, 0);

      // If the tick labels are rotated, reverse usedWidth and usedHeight
      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      if (this._tickLabelAngle !== 0) {
        [usedWidth, usedHeight] = [usedHeight, usedWidth];
      }

      if (this.isHorizontal()) {
        usedHeight += tickTextPadding.y;
      } else {
        usedWidth += tickTextPadding.x;
      }

      return {
        usedWidth: usedWidth,
        usedHeight: usedHeight,
      };
    }

    public renderImmediately() {
      super.renderImmediately();
      let catScale = <Scales.Category> this._scale;
      const { domain, stepWidth } = this.getDownsampleInfo();
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS).data(domain, (d) => d);
      // Give each tick a stepWidth of space which will partition the entire axis evenly
      let availableTextSpace = stepWidth;
      if (this.isHorizontal() && this._tickLabelMaxWidth != null) {
        availableTextSpace = Math.min(availableTextSpace, this._tickLabelMaxWidth);
      }

      let getTickLabelTransform = (d: string, i: number) => {
        // scale(d) will give the center of the band, so subtract half of the text width to get the left (top-most)
        // coordinate that the tick label should be transformed to.
        let tickLabelEdge = catScale.scale(d) - availableTextSpace / 2;
        let x = this.isHorizontal() ? tickLabelEdge : 0;
        let y = this.isHorizontal() ? 0 : tickLabelEdge;
        return "translate(" + x + "," + y + ")";
      };
      tickLabels.enter().append("g").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this._drawTicks(stepWidth, tickLabels);

      let xTranslate = this.orientation() === "right" ? this._tickSpaceRequired() : 0;
      let yTranslate = this.orientation() === "bottom" ? this._tickSpaceRequired() : 0;
      Utils.DOM.translate(this._tickLabelContainer, xTranslate, yTranslate);

      // hide ticks and labels that overflow the axis
      this._showAllTickMarks();
      this._showAllTickLabels();
      this._hideOverflowingTickLabels();
      this._hideTickMarksWithoutLabel();
      return this;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      // When anyone calls redraw(), computeLayout() will be called
      // on everyone, including this. Since CSS or something might have
      // affected the size of the characters, clear the cache.
      this._measurer.reset();
      super.computeLayout(origin, availableWidth, availableHeight);
      if (!this.isHorizontal()) {
        this._scale.range([0, this.height()]);
      }
      return this;
    }
  }
}
