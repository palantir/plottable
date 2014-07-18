///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Composite extends Category {
    public _scale: Scale.CompositeOrdinal;

    /**
     * Creates a CompositeAxis
     *
     * A CompositeAxis takes an OrdinalScale and includes word-wrapping algorithms and advanced layout logic to try to
     * display the scale as efficiently as possible.
     *
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.CompositeOrdinal, orientation = "bottom") {
      super(scale, orientation);
      this.tickLength(120);
      this.formatter(new Plottable.Formatter.Custom((d: string[]) => d[d.length - 1]));
    }

    public _generateTickMarkAttrHash() {
      var tickMarkAttrHash = super._generateTickMarkAttrHash();

      var startPosition = (d: any) => this._scale.fullBandStartAndWidth(d)[0];
      if (this._isHorizontal()) {
        tickMarkAttrHash["x1"] = startPosition;
        tickMarkAttrHash["x2"] = startPosition;
      } else {
        tickMarkAttrHash["y1"] = startPosition;
        tickMarkAttrHash["y2"] = startPosition;
      }
      return tickMarkAttrHash;
    }

    public _getTickValues(): any[] {
      var k = this._scale.getLevels();
      // don't show first mark of each level
      var ret: any[][] = this._scale.domain().slice(1);
      var start: any[][] = this._scale.domain();
      for (var i = 1; i < k; i++) {
        ret = ret.concat(this._scale.product(start, this._scale.domainLevel(i).slice(1)));
        start = this._scale.product(start, this._scale.domainLevel(i));
      }
      return ret;
    }

    public _getAllLabels(): any[] {
      var k = this._scale.getLevels();
      var ret: any[][] = this._scale.domain();
      var start: any[][] = this._scale.domain();
      for (var i = 1; i < k; i++) {
        start = this._scale.product(start, this._scale.domainLevel(i));
        ret = ret.concat(start);
      }
      return ret;
    }

    public _doRender() {
      super._doRender();

      var labels = this._getAllLabels();
      var k = this._scale.getLevels();

      Util.DOM.translate(this._tickLabelContainer, 0, 0);
      var tickLabels = this._tickLabelContainer.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).data(labels, (d) => d);
      var getTickLabelTransform = (d: string, i: number) => {
        var startAndWidth = this._scale.fullBandStartAndWidth(d);
        var bandStartPosition = startAndWidth[0];
        var offset = (k - d.length + .5) * this.tickLength() / k;
        var x = this._isHorizontal() ? bandStartPosition : offset;
        var y = this._isHorizontal() ? offset : bandStartPosition;
        return "translate(" + x + "," + y + ")";
      };
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabels.exit().remove();
      tickLabels.attr("transform", getTickLabelTransform);
      // erase all text first, then rewrite
      tickLabels.text("");
      this._measureTicks(this.availableWidth, this.availableHeight, this._scale, tickLabels);

      // remove all the translation from tickMarks
      Util.DOM.translate(this._tickMarkContainer, 0, 0);

      // make tick length variable depending on level
      var tickMarks = this._tickMarkContainer.selectAll("." + Abstract.Axis.TICK_MARK_CLASS).data(this._getTickValues());
      tickMarks.attr("y2", (d: any[]) => (k - d.length + 1) * this.tickLength() / k);
      return this;
    }
  }
}
}
