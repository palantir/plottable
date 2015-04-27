///<reference path="../../reference.ts" />

module Plottable {
export module Axes {
  export class Category extends Axis {
    private _tickLabelAngle = 0;
    private measurer: SVGTypewriter.Measurers.CacheCharacterMeasurer;
    private wrapper: SVGTypewriter.Wrappers.SingleLineWrapper;
    private writer: SVGTypewriter.Writers.Writer;

    /**
     * Constructs a CategoryAxis.
     *
     * A CategoryAxis takes a CategoryScale and includes word-wrapping
     * algorithms and advanced layout logic to try to display the scale as
     * efficiently as possible.
     *
     * @constructor
     * @param {CategoryScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right) (default = "bottom").
     * @param {Formatter} formatter The Formatter for the Axis (default Formatters.identity())
     */
    constructor(scale: Scales.Category, orientation = "bottom", formatter = Formatters.identity()) {
      super(scale, orientation, formatter);
      this.classed("category-axis", true);
    }

    public computeLayout(offeredXOrigin?: number, offeredYOrigin?: number, availableWidth?: number, availableHeight?: number) {
      // When anyone calls _invalidateLayout, computeLayout will be called
      // on everyone, including this. Since CSS or something might have
      // affected the size of the characters, clear the cache.
      this.measurer.reset();
      return super.computeLayout(offeredXOrigin, offeredYOrigin, availableWidth, availableHeight);
    }

    public doRender() {
      super.doRender();
      var catScale = <Scales.Category> this.scale;
      var tickLabels = this.tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS).data(this.scale.domain(), (d) => d);

      var getTickLabelTransform = (d: string, i: number) => {
        var innerPaddingWidth = catScale.stepWidth() - catScale.rangeBand();
        var scaledValue = catScale.scale(d) - catScale.rangeBand() / 2 - innerPaddingWidth / 2;
        var x = this._isHorizontal() ? scaledValue : 0;
        var y = this._isHorizontal() ? 0 : scaledValue;
        return "translate(" + x + "," + y + ")";
      };
      tickLabels.enter().append("g").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this.drawTicks(this.width(), this.height(), catScale, tickLabels);
      var translate = this._isHorizontal() ? [catScale.rangeBand() / 2, 0] : [0, catScale.rangeBand() / 2];

      var xTranslate = this.orientation() === "right" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      var yTranslate = this.orientation() === "bottom" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      Utils.DOM.translate(this.tickLabelContainer, xTranslate, yTranslate);
      return this;
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var widthRequiredByTicks = this._isHorizontal() ? 0 : this._maxLabelTickLength() + this.tickLabelPadding() + this.gutter();
      var heightRequiredByTicks = this._isHorizontal() ? this._maxLabelTickLength() + this.tickLabelPadding() + this.gutter() : 0;

      if (this.scale.domain().length === 0) {
        return {width: 0, height: 0, wantsWidth: false, wantsHeight: false };
      }

      var categoryScale: Scales.Category = <Scales.Category> this.scale;
      var fakeScale = categoryScale.copy();
      if (this._isHorizontal()) {
        fakeScale.range([0, offeredWidth]);
      } else {
        fakeScale.range([offeredHeight, 0]);
      }
      var textResult = this.measureTicks(offeredWidth,
                                          offeredHeight,
                                          fakeScale,
                                          categoryScale.domain());
      return {
        width: textResult.usedWidth  + widthRequiredByTicks,
        height: textResult.usedHeight + heightRequiredByTicks,
        wantsWidth: !textResult.textFits,
        wantsHeight: !textResult.textFits
      };
    }

    /**
     * Sets the angle for the tick labels. Right now vertical-left (-90), horizontal (0), and vertical-right (90) are the only options.
     * @param {number} angle The angle for the ticks
     * @returns {Category} The calling Category Axis.
     *
     * Warning - this is not currently well supported and is likely to behave badly unless all the tick labels are short.
     * See tracking at https://github.com/palantir/plottable/issues/504
     */
    public tickLabelAngle(angle: number): Category;
    /**
     * Gets the tick label angle
     * @returns {number} the tick label angle
     */
    public tickLabelAngle(): number;
    public tickLabelAngle(angle?: number): any {
      if (angle == null) {
        return this._tickLabelAngle;
      }
      if (angle !== 0 && angle !== 90 && angle !== -90) {
        throw new Error("Angle " + angle + " not supported; only 0, 90, and -90 are valid values");
      }
      this._tickLabelAngle = angle;
      this.invalidateLayout();
      return this;
    }

    protected getTickValues(): string[] {
      return this.scale.domain();
    }

    protected rescale() {
      return this.invalidateLayout();
    }

    protected setup() {
      super.setup();
      this.measurer = new SVGTypewriter.Measurers.CacheCharacterMeasurer(this.tickLabelContainer);
      this.wrapper = new SVGTypewriter.Wrappers.SingleLineWrapper();
      this.writer = new SVGTypewriter.Writers.Writer(this.measurer, this.wrapper);
    }

    /**
     * Measures the size of the ticks while also writing them to the DOM.
     * @param {D3.Selection} ticks The tick elements to be written to.
     */
    private drawTicks(axisWidth: number, axisHeight: number, scale: Scales.Category, ticks: D3.Selection) {
      var self = this;
      var xAlign: {[s: string]: string};
      var yAlign: {[s: string]: string};
      switch (this._tickLabelAngle) {
        case 0:
          xAlign = {left: "right",  right: "left", top: "center", bottom: "center"};
          yAlign = {left: "center",  right: "center", top: "bottom", bottom: "top"};
          break;
        case 90:
          xAlign = {left: "center",  right: "center", top: "right", bottom: "left"};
          yAlign = {left: "top",  right: "bottom", top: "center", bottom: "center"};
          break;
        case -90:
          xAlign = {left: "center",  right: "center", top: "left", bottom: "right"};
          yAlign = {left: "bottom",  right: "top", top: "center", bottom: "center"};
          break;
      }
      ticks.each(function (d: string) {
        var bandWidth = scale.stepWidth();
        var width  = self._isHorizontal() ? bandWidth  : axisWidth - self._maxLabelTickLength() - self.tickLabelPadding();
        var height = self._isHorizontal() ? axisHeight - self._maxLabelTickLength() - self.tickLabelPadding() : bandWidth;
        var writeOptions = {
          selection: d3.select(this),
          xAlign: xAlign[self.orientation()],
          yAlign: yAlign[self.orientation()],
          textRotation: self._tickLabelAngle
        };
        self.writer.write(self.formatter()(d), width, height, writeOptions);
      });
    }

    /**
     * Measures the size of the ticks without making any (permanent) DOM
     * changes.
     *
     * @param {string[]} ticks The strings that will be printed on the ticks.
     */
    private measureTicks(axisWidth: number, axisHeight: number, scale: Scales.Category, ticks: string[]) {
      var wrappingResults = ticks.map((s: string) => {
        var bandWidth = scale.stepWidth();

        // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
        var width = axisWidth - this._maxLabelTickLength() - this.tickLabelPadding(); // default for left/right
        if (this._isHorizontal()) { // case for top/bottom
          width = bandWidth; // defaults to the band width
          if (this._tickLabelAngle !== 0) { // rotated label
            width = axisHeight - this._maxLabelTickLength() - this.tickLabelPadding(); // use the axis height
          }
          // HACKHACK: Wrapper fails under negative circumstances
          width = Math.max(width, 0);
        }

        // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
        var height = bandWidth; // default for left/right
        if (this._isHorizontal()) { // case for top/bottom
          height = axisHeight - this._maxLabelTickLength() - this.tickLabelPadding();
          if (this._tickLabelAngle !== 0) { // rotated label
            height = axisWidth - this._maxLabelTickLength() - this.tickLabelPadding();
          }
          // HACKHACK: Wrapper fails under negative circumstances
          height = Math.max(height, 0);
        }

        return this.wrapper.wrap(this.formatter()(s), this.measurer, width, height);
      });

      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      var widthFn = (this._isHorizontal() && this._tickLabelAngle === 0) ? d3.sum : Utils.Methods.max;
      var heightFn = (this._isHorizontal() && this._tickLabelAngle === 0) ? Utils.Methods.max : d3.sum;

      var textFits = wrappingResults.every((t: SVGTypewriter.Wrappers.WrappingResult) =>
                    !SVGTypewriter.Utils.StringMethods.isNotEmptyString(t.truncatedText) && t.noLines === 1);
      var usedWidth = widthFn<SVGTypewriter.Wrappers.WrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.Wrappers.WrappingResult) => this.measurer.measure(t.wrappedText).width, 0);
      var usedHeight = heightFn<SVGTypewriter.Wrappers.WrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.Wrappers.WrappingResult) => this.measurer.measure(t.wrappedText).height, 0);

      // If the tick labels are rotated, reverse usedWidth and usedHeight
      // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
      if (this._tickLabelAngle !== 0) {
        var tempHeight = usedHeight;
        usedHeight = usedWidth;
        usedWidth = tempHeight;
      }

      return {
        textFits: textFits,
        usedWidth: usedWidth,
        usedHeight: usedHeight
      };
    }
  }
}
}
