///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class Category extends AbstractAxis {
    private _tickLabelAngle = 0;
    private measurer: _Util.Text.CachingCharacterMeasurer;

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

    public _setup() {
      super._setup();
      this.measurer = new _Util.Text.CachingCharacterMeasurer(this._tickLabelContainer.append("text"));
    }

    public _rescale() {
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
      var textResult = this.measureTicks(offeredWidth, offeredHeight, fakeScale, ordinalScale.domain());

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

    private tickLabelOrientation() {
      switch(this._tickLabelAngle) {
        case 0:
          return "horizontal";
        case -90:
          return "left";
        case 90:
          return "right";
        default:
          throw new Error("bad orientation");
      }
    }

    /**
     * Measures the size of the ticks while also writing them to the DOM.
     * @param {D3.Selection} ticks The tick elements to be written to.
     */
    private drawTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, ticks: D3.Selection) {
      return this.drawOrMeasureTicks(axisWidth, axisHeight, scale, ticks, true);
    }

    /**
     * Measures the size of the ticks without making any (permanent) DOM
     * changes.
     *
     * @param {string[]} ticks The strings that will be printed on the ticks.
     */
    private measureTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal, ticks: string[]) {
      return this.drawOrMeasureTicks(axisWidth, axisHeight, scale, ticks, false);
    }


    private drawOrMeasureTicks(axisWidth: number, axisHeight: number, scale: Scale.Ordinal,
                                  dataOrTicks: any, draw: boolean): _Util.Text.IWriteTextResult {
      var self = this;
      var textWriteResults: _Util.Text.IWriteTextResult[] = [];
      var tm = (s: string) => self.measurer.measure(s);
      var iterator = draw ? (f: Function) => dataOrTicks.each(f) : (f: Function) => dataOrTicks.forEach(f);

      iterator(function (d: string) {
        var bandWidth = scale.fullBandStartAndWidth(d)[1];
        var width  = self._isHorizontal() ? bandWidth  : axisWidth - self._maxLabelTickLength() - self.tickLabelPadding();
        var height = self._isHorizontal() ? axisHeight - self._maxLabelTickLength() - self.tickLabelPadding() : bandWidth;

        var textWriteResult: _Util.Text.IWriteTextResult;
        var formatter = self.formatter();

        if (draw) {
          var d3this = d3.select(this);
          var xAlign: {[s: string]: string} = {left: "right",  right: "left",   top: "center", bottom: "center"};
          var yAlign: {[s: string]: string} = {left: "center", right: "center", top: "bottom", bottom: "top"};
          textWriteResult = _Util.Text.writeText(formatter(d), width, height, tm, self.tickLabelOrientation(), {
                                                    g: d3this,
                                                    xAlign: xAlign[self.orient()],
                                                    yAlign: yAlign[self.orient()]
          });
        } else {
          textWriteResult = _Util.Text.writeText(formatter(d), width, height, tm, self.tickLabelOrientation());
        }

        textWriteResults.push(textWriteResult);
      });

      var widthFn  = this._isHorizontal() ? d3.sum : _Util.Methods.max;
      var heightFn = this._isHorizontal() ? _Util.Methods.max : d3.sum;
      return {
        textFits: textWriteResults.every((t: _Util.Text.IWriteTextResult) => t.textFits),
        usedWidth : widthFn<_Util.Text.IWriteTextResult, number>(textWriteResults, (t: _Util.Text.IWriteTextResult) => t.usedWidth, 0),
        usedHeight: heightFn<_Util.Text.IWriteTextResult, number>(textWriteResults, (t: _Util.Text.IWriteTextResult) => t.usedHeight, 0)
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
      this.drawTicks(this.width(), this.height(), ordScale, tickLabels);
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
      this.measurer.clear();
      return super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
    }
  }
}
}
