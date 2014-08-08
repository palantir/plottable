///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class NewStyleBarPlot extends NewStylePlot {
    public static DEFAULT_WIDTH = 10;
    public _baseline: D3.Selection;
    public _baselineValue = 0;
    public _barAlignmentFactor = 0;
    public static _BarAlignmentToFactor: {[alignment: string]: number} = {};
    public _isVertical: boolean;

    public _animators: Animator.IPlotAnimatorMap = {
      "bars-reset" : new Animator.Null(),
      "bars"       : new Animator.IterativeDelay(),
      "baseline"   : new Animator.Null()
    };

    /**
     * Creates an NewStyleBarPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this.project("fill", () => "steelblue");
      // because this._baselineValue was not initialized during the super()
      // call, we must call this in order to get this._baselineValue
      // to be used by the Domainer.
      this.baseline(this._baselineValue);
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
      return this;
    }

    public _paint() {
      super._paint();

      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);
      var baselineAttr: Abstract.IAttributeToProjector = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.availableWidth : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.availableHeight
      };
      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);
    }

    /**
     * Sets the baseline for the bars to the specified value.
     *
     * @param {number} value The value to position the baseline at.
     * @return {NewStyleBarPlot} The calling NewStyleBarPlot.
     */
    public baseline(value: number) {
      this._baselineValue = value;
      this._updateXDomainer();
      this._updateYDomainer();
      this._render();
      return this;
    }

    public _updateDomainer(scale: Scale) {
      if (scale instanceof Abstract.QuantitativeScale) {
        var qscale = <Abstract.QuantitativeScale> scale;
        if (!qscale._userSetDomainer) {
          if (this._baselineValue != null) {
            qscale.domainer()
              .addPaddingException(this._baselineValue, "BAR_PLOT+" + this._plottableID)
              .addIncludedValue(this._baselineValue, "BAR_PLOT+" + this._plottableID);
          } else {
            qscale.domainer()
              .removePaddingException("BAR_PLOT+" + this._plottableID)
              .removeIncludedValue("BAR_PLOT+" + this._plottableID);
          }
        }
            // prepending "BAR_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        qscale._autoDomainIfAutomaticMode();
      }
      return this;
    }

    public _generateAttrToProjector() {
      // Primary scale/direction: the "length" of the bars
      // Secondary scale/direction: the "width" of the bars
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale    = this._isVertical ? this.yScale : this.xScale;
      var secondaryScale  = this._isVertical ? this.xScale : this.yScale;
      var primaryAttr     = this._isVertical ? "y" : "x";
      var secondaryAttr   = this._isVertical ? "x" : "y";
      var bandsMode = (secondaryScale instanceof Plottable.Scale.Ordinal)
                      && (<Plottable.Scale.Ordinal> secondaryScale).rangeType() === "bands";
      var scaledBaseline = primaryScale.scale(this._baselineValue);
      if (attrToProjector["width"] == null) {
        var constantWidth = bandsMode ? (<Scale.Ordinal> secondaryScale).rangeBand() : NewStyleBarPlot.DEFAULT_WIDTH;
        attrToProjector["width"] = (d: any, i: number) => constantWidth;
      }

      var positionF = attrToProjector[secondaryAttr];
      var widthF = attrToProjector["width"];
      if (!bandsMode) {
        attrToProjector[secondaryAttr] = (d: any, i: number) => positionF(d, i) - widthF(d, i) * this._barAlignmentFactor;
      } else {
        var bandWidth = (<Plottable.Scale.Ordinal> secondaryScale).rangeBand();
        attrToProjector[secondaryAttr] = (d: any, i: number) => positionF(d, i) - widthF(d, i) / 2 + bandWidth / 2;
      }

      var originalPositionFn = attrToProjector[primaryAttr];
      attrToProjector[primaryAttr] = (d: any, i: number) => {
        var originalPos = originalPositionFn(d, i);
        // If it is past the baseline, it should start at the baselin then width/height
        // carries it over. If it's not past the baseline, leave it at original position and
        // then width/height carries it to baseline
        return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
      };

      attrToProjector["height"] = (d: any, i: number) => {
        return Math.abs(scaledBaseline - originalPositionFn(d, i));
      };

      return attrToProjector;
    }

    public _updateYDomainer() {
      if (this._isVertical) {
        this._updateDomainer(this.yScale);
      } else {
        super._updateYDomainer();
      }
      return this;
    }

    public _updateXDomainer() {
      if (!this._isVertical) {
        this._updateDomainer(this.xScale);
      } else {
        super._updateXDomainer();
      }
      return this;
    }
  }
}
}
