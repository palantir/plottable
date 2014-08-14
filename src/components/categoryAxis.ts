///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Category extends Abstract.Axis {
    public _scale: Scale.Ordinal;
    private measurer: Util.Text.CachingCharacterMeasurer;

    /**
     * Constructs an Axis.Category.
     *
     * An Axis.Category takes a Scale.Ordinal and includes word-wrapping
     * algorithms and advanced layout logic to try to display the scale as
     * efficiently as possible.
     *
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {Formatter} [formatter] The Formatter for the Axis (default Formatters.identity())
     */
    constructor(scale: Scale.Ordinal, orientation = "bottom", formatter = Formatters.identity()) {
      super(scale, orientation, formatter);
      this.classed("category-axis", true);
      if (scale.rangeType() !== "bands") {
        throw new Error("Only rangeBands category axes are implemented");
      }
      this._scale.broadcaster.registerListener(this, () => this._invalidateLayout());
    }

    public _setup() {
      super._setup();
      this.measurer = new Util.Text.CachingCharacterMeasurer(this._tickLabelContainer);
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var widthRequiredByTicks = this._isHorizontal() ? 0 : this._maxLabelTickLength() + this.tickLabelPadding();
      var heightRequiredByTicks = this._isHorizontal() ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;

      if (this._scale.domain().length === 0) {
        return {width: 0, height: 0, wantsWidth: false, wantsHeight: false };
      }

      var fakeScale = this._scale.copy();
      if (this._isHorizontal()) {
        fakeScale.range([0, offeredWidth]);
      } else {
        fakeScale.range([offeredHeight, 0]);
      }
      var textResult = this.measureTicks(offeredWidth, offeredHeight, fakeScale, this._scale.domain());

      return {
        width : textResult.usedWidth  + widthRequiredByTicks,
        height: textResult.usedHeight + heightRequiredByTicks,
        wantsWidth : !textResult.textFits,
        wantsHeight: !textResult.textFits
      };
    }

    public _getTickValues(): string[] {
      return this._scale.domain();
    }

    /**
     * Measures the size of the ticks without making any (permanent) DOM
     * changes.
     *
     * @param {string[]} data The strings that will be printed on the ticks.
     */
    private measureTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, data: string[]): Util.Text.IWriteTextResult;
    /**
     * Measures the size of the ticks while also writing them to the DOM.
     * @param {D3.Selection} ticks The tick elements to be written to.
     */
    private measureTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, ticks: D3.Selection): Util.Text.IWriteTextResult;
    private measureTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, dataOrTicks: any): Util.Text.IWriteTextResult {
      var draw = typeof dataOrTicks[0] !== "string";
      var self = this;
      var textWriteResults: Util.Text.IWriteTextResult[] = [];
      var tm = (s: string) => self.measurer.measure(s);
      var iterator = draw ? (f: Function) => dataOrTicks.each(f) : (f: Function) => dataOrTicks.forEach(f);

      iterator(function (d: string) {
        var bandWidth = scale.fullBandStartAndWidth(d)[1];
        var width  = self._isHorizontal() ? bandWidth  : axisWidth - self._maxLabelTickLength() - self.tickLabelPadding();
        var height = self._isHorizontal() ? axisHeight - self._maxLabelTickLength() - self.tickLabelPadding() : bandWidth;

        var textWriteResult: Util.Text.IWriteTextResult;
        var formatter = self._formatter;
        if (draw) {
          var d3this = d3.select(this);
          var xAlign: {[s: string]: string} = {left: "right",  right: "left",   top: "center", bottom: "center"};
          var yAlign: {[s: string]: string} = {left: "center", right: "center", top: "bottom", bottom: "top"};
          textWriteResult = Util.Text.writeText(formatter(d), width, height, tm, true, {
                                                    g: d3this,
                                                    xAlign: xAlign[self._orientation],
                                                    yAlign: yAlign[self._orientation]
          });
        } else {
          textWriteResult = Util.Text.writeText(formatter(d), width, height, tm, true);
        }

        textWriteResults.push(textWriteResult);
      });

      var widthFn  = this._isHorizontal() ? d3.sum : d3.max;
      var heightFn = this._isHorizontal() ? d3.max : d3.sum;
      return {
        textFits: textWriteResults.every((t: Util.Text.IWriteTextResult) => t.textFits),
        usedWidth : widthFn(textWriteResults, (t: Util.Text.IWriteTextResult) => t.usedWidth),
        usedHeight: heightFn(textWriteResults, (t: Util.Text.IWriteTextResult) => t.usedHeight)
      };
    }

    public _doRender() {
      super._doRender();
      var tickLabels = this._tickLabelContainer.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).data(this._scale.domain(), (d) => d);

      var getTickLabelTransform = (d: string, i: number) => {
        var startAndWidth = this._scale.fullBandStartAndWidth(d);
        var bandStartPosition = startAndWidth[0];
        var x = this._isHorizontal() ? bandStartPosition : 0;
        var y = this._isHorizontal() ? 0 : bandStartPosition;
        return "translate(" + x + "," + y + ")";
      };
      tickLabels.enter().append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this.measureTicks(this.availableWidth, this.availableHeight, this._scale, tickLabels);
      var translate = this._isHorizontal() ? [this._scale.rangeBand() / 2, 0] : [0, this._scale.rangeBand() / 2];

      var xTranslate = this._orientation === "right" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      var yTranslate = this._orientation === "bottom" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
      Util.DOM.translate(this._tickLabelContainer, xTranslate, yTranslate);
      Util.DOM.translate(this._tickMarkContainer, translate[0], translate[1]);
    }


    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      // When anyone calls _invalidateLayout, _computeLayout will be called
      // on everyone, including this. Since CSS or something might have
      // affected the size of the characters, clear the cache.
      this.measurer.clear();
      return super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
    }
  }
}
}
