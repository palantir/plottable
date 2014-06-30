///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Category extends Abstract.Axis {
    public _scale: Scale.Ordinal;
    public _tickLabelsG: D3.Selection;
    private measurer: Util.Text.CachingCharacterMeasurer;

    /**
     * Creates a CategoryAxis.
     *
     * A CategoryAxis takes an OrdinalScale and includes word-wrapping algorithms and advanced layout logic to try to
     * display the scale as efficiently as possible.
     *
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Ordinal, orientation = "bottom") {
      super(scale, orientation);
      this.classed("category-axis", true);
      if (scale.rangeType() !== "bands") {
        throw new Error("Only rangeBands category axes are implemented");
      }
      this._scale.broadcaster.registerListener(this, () => this._invalidateLayout());
    }

    public _setup() {
      super._setup();
      this._tickLabelsG = this.content.append("g").classed("tick-labels", true);
      this.measurer = new Util.Text.CachingCharacterMeasurer(this._tickLabelsG);
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var widthRequiredByTicks = this._isHorizontal() ? 0 : this.tickLength() + this.tickLabelPadding();
      var heightRequiredByTicks = this._isHorizontal() ? this.tickLength() + this.tickLabelPadding() : 0;

      if (offeredWidth < 0 || offeredHeight < 0) {
        return {
          width:  offeredWidth,
          height: offeredHeight,
          wantsWidth: !this._isHorizontal(),
          wantsHeight: this._isHorizontal()
        };
      }
      if (this._scale.domain().length === 0) {
        return {
          width: 0,
          height: 0,
          wantsWidth: false,
          wantsHeight: false
        };
      }
      if (this._isHorizontal()) {
        this._scale.range([0, offeredWidth]);
      } else {
        this._scale.range([offeredHeight, 0]);
      }
      var textResult = this.measureTicks(offeredWidth, offeredHeight, this._scale.domain());


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
    private measureTicks(axisWidth: number, axisHeight: number, data: string[]): Util.Text.IWriteTextResult;
    /**
     * Measures the size of the ticks while also writing them to the DOM.
     * @param {D3.Selection} ticks The tick elements to be written to.
     */
    private measureTicks(axisWidth: number, axisHeight: number, ticks: D3.Selection): Util.Text.IWriteTextResult;
    private measureTicks(axisWidth: number, axisHeight: number, dataOrTicks: any): Util.Text.IWriteTextResult {
      var draw = dataOrTicks instanceof d3.selection;
      var self = this;
      var textWriteResults: Util.Text.IWriteTextResult[] = [];
      var tm = (s: string) => self.measurer.measure(s);
      var iterator = draw ? (f: Function) => dataOrTicks.each(f) : (f: Function) => dataOrTicks.forEach(f);

      iterator(function (d: string) {
        var bandWidth = self._scale.fullBandStartAndWidth(d)[1];
        var width  = self._isHorizontal() ? bandWidth  : axisWidth - self.tickLength() - self.tickLabelPadding();
        var height = self._isHorizontal() ? axisHeight - self.tickLength() - self.tickLabelPadding() : bandWidth;

        var textWriteResult: Util.Text.IWriteTextResult;
        if (draw) {
          var d3this = d3.select(this);
          var xAlign: {[s: string]: string} = {left: "right",  right: "left",   top: "center", bottom: "center"};
          var yAlign: {[s: string]: string} = {left: "center", right: "center", top: "bottom", bottom: "top"};
          textWriteResult = Util.Text.writeText(d, width, height, tm, true, {
                                                    g: d3this,
                                                    xAlign: xAlign[self._orientation],
                                                    yAlign: yAlign[self._orientation]
          });
        } else {
          textWriteResult = Util.Text.writeText(d, width, height, tm, true);
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
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(this._scale.domain(), (d) => d);

      var getTickLabelTransform = (d: string, i: number) => {
        var startAndWidth = this._scale.fullBandStartAndWidth(d);
        var bandStartPosition = startAndWidth[0];
        var x = this._isHorizontal() ? bandStartPosition : 0;
        var y = this._isHorizontal() ? 0 : bandStartPosition;
        return "translate(" + x + "," + y + ")";
      };
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this.measureTicks(this.availableWidth, this.availableHeight, tickLabels);
      var translate = this._isHorizontal() ? [this._scale.rangeBand() / 2, 0] : [0, this._scale.rangeBand() / 2];

      var xTranslate = this._orientation === "right" ? this.tickLength() + this.tickLabelPadding() : 0;
      var yTranslate = this._orientation === "bottom" ? this.tickLength() + this.tickLabelPadding() : 0;
      Util.DOM.translate(this._tickLabelsG, xTranslate, yTranslate);
      Util.DOM.translate(this._tickMarkContainer, translate[0], translate[1]);
      return this;
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
