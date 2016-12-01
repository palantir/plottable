namespace Plottable.Axes {
  export class Category extends Axis<string> {
    private _tickLabelAngle = 0;
    private _measurer: SVGTypewriter.Measurers.CacheCharacterMeasurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;
    private _writer: SVGTypewriter.Writers.Writer;
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
      this._measurer = new SVGTypewriter.Measurers.CacheCharacterMeasurer(this._tickLabelContainer);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper();
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper);
    }

    protected _rescale() {
      return this.redraw();
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      let widthRequiredByTicks = this._isHorizontal() ? 0 : this._maxLabelTickLength() + this.tickLabelPadding() + this.margin();
      let heightRequiredByTicks = this._isHorizontal() ? this._maxLabelTickLength() + this.tickLabelPadding() + this.margin() : 0;

      if (this._scale.domain().length === 0) {
        return {
          minWidth: 0,
          minHeight: 0,
        };
      }

      if (this.annotationsEnabled()) {
        let tierTotalHeight = this._annotationTierHeight() * this.annotationTierCount();
        if (this._isHorizontal()) {
          heightRequiredByTicks += tierTotalHeight;
        } else {
          widthRequiredByTicks += tierTotalHeight;
        }
      }

      let categoryScale = <Scales.Category> this._scale;
      let measureResult = this._measureTicks(offeredWidth, offeredHeight, categoryScale, categoryScale.domain());

      return {
        minWidth: measureResult.usedWidth + widthRequiredByTicks,
        minHeight: measureResult.usedHeight + heightRequiredByTicks,
      };
    }

    protected _coreSize() {
      let relevantDimension = this._isHorizontal() ? this.height() : this.width();
      let relevantRequestedSpaceDimension = this._isHorizontal() ?
                                              this.requestedSpace(this.width(), this.height()).minHeight :
                                              this.requestedSpace(this.width(), this.height()).minWidth;
      let marginAndAnnotationSize = this.margin() + this._annotationTierHeight();
      let axisHeightWithoutMargin = relevantRequestedSpaceDimension - marginAndAnnotationSize;
      return Math.min(axisHeightWithoutMargin, relevantDimension);
    }

    protected _getTickValues() {
      return this._scale.domain();
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
          throw new Error(`tickTextAlignment '${tickTextAlignment}' not supported. Must be left, right, or center.`);
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
     * In general, padding moves the label *away* from the outer edge
     * of the axis (tickLabelPadding moves labels away from the inner
     * edge of the axis already), as defined by the axis' {@link
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

    /**
     * The pad value gives the amount of padding that must be
     * subtracted from overall space when rendering text (important for
     * proper line breaking).
     * 
     * The translate value gives the amount the label should be moved
     * to give the proper padding.
     * 
     * Pad will always be a positive amount, but translate can be
     * negative depending on rotation of labels and axis orientation.
     */
    private _calcTextPadding(): { translate: { x: number, y: number }, pad: { x: number, y: number }} {
      const pad = { x: 0, y: 0 };
      const translate = { x: 0, y: 0 };

      // In general, padding moves the label *away* from the outer
      // edge of the axis (tickLabelPadding moves labels away from the
      // inner edge of the axis already). 
      //
      // The doc comment for tickTextPadding details the particular
      // combinations of orientation and label rotation implemented
      // below.

      if (this.tickLabelAngle() === 0 && ! this._isHorizontal()) {
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
     * Measures the size of the ticks while also writing them to the DOM.
     * @param {d3.Selection} ticks The tick elements to be written to.
     */
    private _drawTicks(axisWidth: number, axisHeight: number, scale: Scales.Category, ticks: d3.Selection<string>) {
      let self = this;
      let xAlign: {[s: string]: string};
      let yAlign: {[s: string]: string};
      const { pad, translate } = this._calcTextPadding();

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

      ticks.each(function (d: string) {
        let bandWidth = scale.stepWidth();
        let width = self._isHorizontal() ? bandWidth : axisWidth - self._maxLabelTickLength() - self.tickLabelPadding() - pad.x;
        let height = self._isHorizontal() ? axisHeight - self._maxLabelTickLength() - self.tickLabelPadding() - pad.y : bandWidth;
        let writeOptions = {
          selection: d3.select(this),
          xAlign: self.tickTextAlignment() || xAlign[self.orientation()],
          yAlign: yAlign[self.orientation()],
          textRotation: self.tickLabelAngle(),
        };

        self._writer.write(self.formatter()(d), width, height, writeOptions);

        if (translate.x !== 0 || translate.y !== 0) {
          let text = writeOptions.selection;
          text.attr("transform", `translate(${translate.x}, ${translate.y}) ${text.attr("transform")}`);
        }
      });
    }

    /**
     * Measures the size of the ticks without making any (permanent) DOM
     * changes.
     *
     * @param {string[]} ticks The strings that will be printed on the ticks.
     */
    private _measureTicks(axisWidth: number, axisHeight: number, scale: Scales.Category, ticks: string[]) {
      let axisSpace = this._isHorizontal() ? axisWidth : axisHeight;
      let totalOuterPaddingRatio = 2 * scale.outerPadding();
      let totalInnerPaddingRatio = (ticks.length - 1) * scale.innerPadding();
      let expectedRangeBand = axisSpace / (totalOuterPaddingRatio + totalInnerPaddingRatio + ticks.length);
      let stepWidth = expectedRangeBand * (1 + scale.innerPadding());
      const tickTextPadding = this._calcTextPadding().pad;

      let wrappingResults = ticks.map((s: string) => {

        // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
        let width = axisWidth - this._maxLabelTickLength() - this.tickLabelPadding() - tickTextPadding.x; // default for left/right
        if (this._isHorizontal()) { // case for top/bottom
          width = stepWidth; // defaults to the band width
          if (this._tickLabelAngle !== 0) { // rotated label
            width = axisHeight - this._maxLabelTickLength() - this.tickLabelPadding() - tickTextPadding.y; // use the axis height
          }
          // HACKHACK: Wrapper fails under negative circumstances
          width = Math.max(width, 0);
        }

        // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
        let height = stepWidth; // default for left/right
        if (! this._isHorizontal()) { // case for top/bottom
          height = axisHeight - this._maxLabelTickLength() - this.tickLabelPadding();
          if (this._tickLabelAngle !== 0) { // rotated label
            height = axisWidth - this._maxLabelTickLength() - this.tickLabelPadding() ;
          }
          // HACKHACK: Wrapper fails under negative circumstances
          height = Math.max(height, 0);
        }

        return this._wrapper.wrap(this.formatter()(s), this._measurer, width, height);
      });

      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      let widthFn = (this._isHorizontal() && this._tickLabelAngle === 0) ? d3.sum : Utils.Math.max;
      let heightFn = (this._isHorizontal() && this._tickLabelAngle === 0) ? Utils.Math.max : d3.sum;

      let textFits = wrappingResults.every((t: SVGTypewriter.Wrappers.WrappingResult) =>
                    !SVGTypewriter.Utils.StringMethods.isNotEmptyString(t.truncatedText) && t.noLines === 1);
      let usedWidth = widthFn<SVGTypewriter.Wrappers.WrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.Wrappers.WrappingResult) => this._measurer.measure(t.wrappedText).width, 0);
      let usedHeight = heightFn<SVGTypewriter.Wrappers.WrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.Wrappers.WrappingResult) => this._measurer.measure(t.wrappedText).height, 0);

      // If the tick labels are rotated, reverse usedWidth and usedHeight
      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      if (this._tickLabelAngle !== 0) {
        let tempHeight = usedHeight;
        usedHeight = usedWidth;
        usedWidth = tempHeight;
      }

      if (this._isHorizontal()) {
        usedHeight += tickTextPadding.y;
      } else {
        usedWidth += tickTextPadding.x;
      }

      return {
        textFits: textFits,
        usedWidth: usedWidth,
        usedHeight: usedHeight,
      };
    }

    public renderImmediately() {
      super.renderImmediately();
      let catScale = <Scales.Category> this._scale;
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS).data(this._scale.domain(), (d) => d);

      let getTickLabelTransform = (d: string, i: number) => {
        let innerPaddingWidth = catScale.stepWidth() - catScale.rangeBand();
        let scaledValue = catScale.scale(d) - catScale.rangeBand() / 2 - innerPaddingWidth / 2;
        let x = this._isHorizontal() ? scaledValue : 0;
        let y = this._isHorizontal() ? 0 : scaledValue;
        return "translate(" + x + "," + y + ")";
      };
      tickLabels.enter().append("g").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this._drawTicks(this.width(), this.height(), catScale, tickLabels);

      let xTranslate = this.orientation() === "right" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      let yTranslate = this.orientation() === "bottom" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      Utils.DOM.translate(this._tickLabelContainer, xTranslate, yTranslate);
      return this;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      // When anyone calls redraw(), computeLayout() will be called
      // on everyone, including this. Since CSS or something might have
      // affected the size of the characters, clear the cache.
      this._measurer.reset();
      super.computeLayout(origin, availableWidth, availableHeight);
      if (!this._isHorizontal()) {
        this._scale.range([0, this.height()]);
      }
      return this;
    }
  }
}
