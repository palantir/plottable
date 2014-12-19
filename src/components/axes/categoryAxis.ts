///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class Category extends AbstractAxis {
    private _tickLabelAngle = 0;
    private _measurer: SVGTypewriter.Measurers.CacheCharacterMeasurer;
    private _wrapper: SVGTypewriter.Wrappers.SingleLineWrapper;
    private _writer: SVGTypewriter.Writers.Writer;

    /**
     * Constructs a CategoryAxis.
     *
     * A CategoryAxis takes an OrdinalScale and includes word-wrapping
     * algorithms and advanced layout logic to try to display the scale as
     * efficiently as possible.
     *
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right) (default = "bottom").
     * @param {Formatter} formatter The Formatter for the Axis (default Formatters.identity())
     */
    constructor(scale: Scale.Ordinal, orientation = "bottom", formatter = Formatters.identity()) {
      super(scale, orientation, formatter);
      this.classed("category-axis", true);
    }

    protected _setup() {
      super._setup();
      this._measurer = new SVGTypewriter.Measurers.CacheCharacterMeasurer(this._tickLabelContainer);
      this._wrapper = new SVGTypewriter.Wrappers.SingleLineWrapper();
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper);
    }

    protected _rescale() {
      return this._invalidateLayout();
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var widthRequiredByTicks = this._isHorizontal() ? 0 : this._maxLabelTickLength() + this.tickLabelPadding() + this.gutter();
      var heightRequiredByTicks = this._isHorizontal() ? this._maxLabelTickLength() + this.tickLabelPadding() + this.gutter() : 0;

      if (this._scale.domain().length === 0) {
        return {width: 0, height: 0, wantsWidth: false, wantsHeight: false };
      }

      var ordinalScale: Scale.Ordinal = <Scale.Ordinal> this._scale;
      var fakeScale = ordinalScale.copy();
      if (this._isHorizontal()) {
        fakeScale.range([0, offeredWidth]);
      } else {
        fakeScale.range([offeredHeight, 0]);
      }
      var textResult = this._measureTicks(offeredWidth,
                                          offeredHeight,
                                          fakeScale,
                                          ordinalScale.domain());
      return {
        width : textResult.usedWidth  + widthRequiredByTicks,
        height: textResult.usedHeight + heightRequiredByTicks,
        wantsWidth : !textResult.textFits,
        wantsHeight: !textResult.textFits
      };
    }

    protected _getTickValues(): string[] {
      return this._scale.domain();
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
      this._invalidateLayout();
      return this;
    }

    /**
     * Measures the size of the ticks while also writing them to the DOM.
     * @param {D3.Selection} ticks The tick elements to be written to.
     */
    private _drawTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, ticks: D3.Selection) {
      var self = this;
      var xAlign: {[s: string]: string};
      var yAlign: {[s: string]: string};
      switch(this.tickLabelAngle()) {
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
        var bandWidth = scale.fullBandStartAndWidth(d)[1];
        var width  = self._isHorizontal() ? bandWidth  : axisWidth - self._maxLabelTickLength() - self.tickLabelPadding();
        var height = self._isHorizontal() ? axisHeight - self._maxLabelTickLength() - self.tickLabelPadding() : bandWidth;
        var writeOptions = {
          selection: d3.select(this),
          xAlign: xAlign[self.orient()],
          yAlign: yAlign[self.orient()],
          textRotation: self.tickLabelAngle()
        };
        self._writer.write(self.formatter()(d), width, height, writeOptions);
      });
    }

    /**
     * Measures the size of the ticks without making any (permanent) DOM
     * changes.
     *
     * @param {string[]} ticks The strings that will be printed on the ticks.
     */
    private _measureTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, ticks: string[]) {
      var wrappingResults = ticks.map((s: string) => {
        var bandWidth = scale.fullBandStartAndWidth(s)[1];
        var width  = this._isHorizontal() ? bandWidth  : axisWidth - this._maxLabelTickLength() - this.tickLabelPadding();
        var height = this._isHorizontal() ? axisHeight - this._maxLabelTickLength() - this.tickLabelPadding() : bandWidth;
        return this._wrapper.wrap(this.formatter()(s), this._measurer, width, height);
      });

      var widthFn  = this._isHorizontal() ? d3.sum : _Util.Methods.max;
      var heightFn = this._isHorizontal() ? _Util.Methods.max : d3.sum;

      return {
        textFits: wrappingResults.every((t: SVGTypewriter.Wrappers.WrappingResult) =>
                    !SVGTypewriter.Utils.StringMethods.isNotEmptyString(t.truncatedText) && t.noLines === 1),
        usedWidth : widthFn<SVGTypewriter.Wrappers.WrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.Wrappers.WrappingResult) => this._measurer.measure(t.wrappedText).width, 0),
        usedHeight: heightFn<SVGTypewriter.Wrappers.WrappingResult, number>(wrappingResults,
                      (t: SVGTypewriter.Wrappers.WrappingResult) => this._measurer.measure(t.wrappedText).height, 0)
      };
    }

    public _doRender() {
      super._doRender();
      var ordScale = <Scale.Ordinal> this._scale;
      var tickLabels = this._tickLabelContainer.selectAll("." + AbstractAxis.TICK_LABEL_CLASS).data(this._scale.domain(), (d) => d);

      var getTickLabelTransform = (d: string, i: number) => {
        var startAndWidth = ordScale.fullBandStartAndWidth(d);
        var bandStartPosition = startAndWidth[0];
        var x = this._isHorizontal() ? bandStartPosition : 0;
        var y = this._isHorizontal() ? 0 : bandStartPosition;
        return "translate(" + x + "," + y + ")";
      };
      tickLabels.enter().append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this._drawTicks(this.width(), this.height(), ordScale, tickLabels);
      var translate = this._isHorizontal() ? [ordScale.rangeBand() / 2, 0] : [0, ordScale.rangeBand() / 2];

      var xTranslate = this.orient() === "right" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      var yTranslate = this.orient() === "bottom" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      _Util.DOM.translate(this._tickLabelContainer, xTranslate, yTranslate);
      _Util.DOM.translate(this._tickMarkContainer, translate[0], translate[1]);
      return this;
    }


    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      // When anyone calls _invalidateLayout, _computeLayout will be called
      // on everyone, including this. Since CSS or something might have
      // affected the size of the characters, clear the cache.
      this._measurer.reset();
      return super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
    }
  }
}
}
