///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Category extends Abstract.Axis {
    public _scale: Scale.Ordinal;
    public _tickLabelsG: D3.Selection;
    private chr2Measure: {[chr: string]: number[]} = {};

    /**
     * Creates a CategoryAxis.
     *
     * A CategoryAxis takes an OrdinalScale and includes word-wrapping algorithms and advanced layout logic to tyr to
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
      var textResult = this.measureTicks(offeredWidth, offeredHeight,
                                                 this._scale.domain());

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
     * Acts similarly to writeTextToTicks, but is entirely non-destructive
     * and rarely touches the DOM.
     */
    private measureTicks(axisWidth: number, axisHeight: number, tickStrs: string[]): Util.Text.IWriteTextResult {
      var textWriteResults: Util.Text.IWriteTextResult[] = [];
      tickStrs.forEach((s: string) => {
        var bandWidth = this._scale.fullBandStartAndWidth(s)[1];
        var width  = this._isHorizontal() ? bandWidth  : axisWidth - this.tickLength() - this.tickLabelPadding();
        var height = this._isHorizontal() ? axisHeight - this.tickLength() - this.tickLabelPadding() : bandWidth;

        var tm = (s: string) => {
          var widthHeights = s.trim().split("").map((c) => this.getTickWH(c));
          return [d3.sum(widthHeights, (wh) => wh[0]), d3.max(widthHeights, (wh) => wh[1])];
        };

        var textWriteResult = Util.Text.measureTextInBox(s, width, height, tm, true);
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

    private writeTextToTicks(axisWidth: number, axisHeight: number, ticks: D3.Selection): Util.Text.IWriteTextResult {
      var self = this;
      var textWriteResults: Util.Text.IWriteTextResult[] = [];
      ticks.each(function (d: string, i: number) {
        var d3this = d3.select(this);
        var bandWidth = self._scale.fullBandStartAndWidth(d)[1];
        var width  = self._isHorizontal() ? bandWidth  : axisWidth - self.tickLength() - self.tickLabelPadding();
        var height = self._isHorizontal() ? axisHeight - self.tickLength() - self.tickLabelPadding() : bandWidth;

        var xAlign: {[s: string]: string} = {left: "right",  right: "left",   top: "center", bottom: "center"};
        var yAlign: {[s: string]: string} = {left: "center", right: "center", top: "bottom", bottom: "top"};

        var textWriteResult = Util.Text.writeText(d, d3this, width, height,
                                                  xAlign[self._orientation], yAlign[self._orientation], true);
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
      this.writeTextToTicks(this.availableWidth, this.availableHeight, tickLabels);
      var translate = this._isHorizontal() ? [this._scale.rangeBand() / 2, 0] : [0, this._scale.rangeBand() / 2];

      var xTranslate = this._orientation === "right" ? this.tickLength() + this.tickLabelPadding() : 0;
      var yTranslate = this._orientation === "bottom" ? this.tickLength() + this.tickLabelPadding() : 0;
      Util.DOM.translate(this._tickLabelsG, xTranslate, yTranslate);
      Util.DOM.translate(this._tickMarkContainer, translate[0], translate[1]);
      return this;
    }

    /**
     * If c were on a tick, how much space would it take up?
     * This will cache the result in this.chr2Measure.
     *
     * @return {number[]}: [width, height] pair.
     */
    private getTickWH(c: string): number[] {
      if (!(c in this.chr2Measure)) {
        // whitespace, when measured alone, will take up no space
        if (/\s/.test(c)) {
          var totalWH = this.computTickWH("x" + c + "x");
          this.chr2Measure[c] = [totalWH[0] - this.getTickWH("x")[0] * 2,
                                 totalWH[1]];
        } else {
          this.chr2Measure[c] = this.computTickWH(c);
        }
      }
      return this.chr2Measure[c];
    }

    /**
     * If s were on a tick, how much space would it take up?
     * This function is non-destructive, but does use the DOM.
     *
     * @return {number[]}: [width, height] pair.
     */
    private computTickWH(s: string): number[] {
      var innerG = this._tickLabelsG.append("g").classed("writeText-inner-g", true); // unleash your inner G
      var t = innerG.append("text").text(s);
      var bb = Util.DOM.getBBox(t);
      innerG.remove();
      return [bb.width, bb.height];
    }

    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      // When anyone calls _invalidateLayout, _computeLayout will be called
      // on everyone, including this. Since CSS or something might have
      // affected the size of the characters, clear the cache.

      // speed hack: pick an arbitrary letter. If its size hasn't changed, assume
      // that all sizes haven't changed
      var c = d3.keys(this.chr2Measure)[0];
      if (c == null || !Util.Methods.arrayEq(this.computTickWH(c), this.chr2Measure[c])) {
        this.chr2Measure = {};
      }
      return super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
    }
  }
}
}
