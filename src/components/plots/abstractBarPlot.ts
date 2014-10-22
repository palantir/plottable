///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class AbstractBarPlot<X,Y> extends AbstractXYPlot<X,Y> implements Interaction.Hoverable {
    public static _BarAlignmentToFactor: {[alignment: string]: number} = {};
    public _baseline: D3.Selection;
    public _baselineValue = 0;
    public _barAlignmentFactor = 0.5;
    public _isVertical: boolean;
    private _hoverMode = "point";

    /**
     * Constructs a BarPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>) {
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      this._animators["bars-reset"] = new Animator.Null();
      this._animators["bars"] = new Animator.Base();
      this._animators["baseline"] = new Animator.Null();
      this.baseline(this._baselineValue);
    }

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Element(key).svgElement("rect");
    }

    public _setup() {
      super._setup();
      this._baseline = this._renderArea.append("line").classed("baseline", true);
    }

    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);

      // If a QuantitativeScale is used, the plot can easily extend outside the component boundary.
      // Thus, the extent must be updated to account for the possible extension
      if ((this._isVertical && attrToSet === "x") || (!this._isVertical && attrToSet === "y")) {
        var barScale = this._isVertical ? this._projectors["x"].scale : this._projectors["y"].scale;
        if (barScale instanceof Plottable.Scale.AbstractQuantitative) {
          var barWidth = this._getMinimumDataWidth();
          var barAccessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
          this.project("bar-min", (d: any, i: number) => barAccessor(d, i) - barWidth * this._barAlignmentFactor, barScale);
          this.project("bar-max", (d: any, i: number) => barAccessor(d, i) + barWidth * (1 - this._barAlignmentFactor), barScale);
        }
      }

      this._render();
      return this;
    }

    /**
     * Sets the baseline for the bars to the specified value.
     *
     * The baseline is the line that the bars are drawn from, defaulting to 0.
     *
     * @param {number} value The value to position the baseline at.
     * @returns {AbstractBarPlot} The calling AbstractBarPlot.
     */
    public baseline(value: number) {
      this._baselineValue = value;
      this._updateXDomainer();
      this._updateYDomainer();
      this._render();
      return this;
    }

    /**
     * Sets the bar alignment relative to the independent axis.
     * VerticalBarPlot supports "left", "center", "right"
     * HorizontalBarPlot supports "top", "center", "bottom"
     *
     * @param {string} alignment The desired alignment.
     * @returns {AbstractBarPlot} The calling AbstractBarPlot.
     */
     public barAlignment(alignment: string) {
       var alignmentLC = alignment.toLowerCase();
       var align2factor = (<typeof AbstractBarPlot> this.constructor)._BarAlignmentToFactor;
       if (align2factor[alignmentLC] === undefined) {
         throw new Error("unsupported bar alignment");
       }
       this._barAlignmentFactor = align2factor[alignmentLC];

       this._render();
       return this;
     }


    private parseExtent(input: any): Extent {
      if (typeof(input) === "number") {
        return {min: input, max: input};
      } else if (input instanceof Object && "min" in input && "max" in input) {
        return <Extent> input;
      } else {
        throw new Error("input '" + input + "' can't be parsed as an Extent");
      }
    }

    /**
     * Selects the bar under the given pixel position (if [xValOrExtent]
     * and [yValOrExtent] are {number}s), under a given line (if only one
     * of [xValOrExtent] or [yValOrExtent] are {Extent}s) or are under a
     * 2D area (if [xValOrExtent] and [yValOrExtent] are both {Extent}s).
     *
     * @param {any} xValOrExtent The pixel x position, or range of x values.
     * @param {any} yValOrExtent The pixel y position, or range of y values.
     * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
     * @returns {D3.Selection} The selected bar, or null if no bar was selected.
     */
    public selectBar(xValOrExtent: Extent, yValOrExtent: Extent, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: number, yValOrExtent: Extent, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: Extent, yValOrExtent: number, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: any, yValOrExtent: any, select = true): D3.Selection {
      if (!this._isSetup) {
        return null;
      }

      var selectedBars: any[] = [];

      var xExtent: Extent = this.parseExtent(xValOrExtent);
      var yExtent: Extent = this.parseExtent(yValOrExtent);

      // the SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via
      // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
      // seems appropriate:
      var tolerance: number = 0.5;

      // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
      this._getDrawersInOrder().forEach((d) => {
        d._renderArea.selectAll("rect").each(function(d: any) {
          var bbox = this.getBBox();
          if (bbox.x + bbox.width >= xExtent.min - tolerance && bbox.x <= xExtent.max + tolerance &&
              bbox.y + bbox.height >= yExtent.min - tolerance && bbox.y <= yExtent.max + tolerance) {
            selectedBars.push(this);
          }
        });
      });

      if (selectedBars.length > 0) {
        var selection: D3.Selection = d3.selectAll(selectedBars);
        selection.classed("selected", select);
        return selection;
      } else {
        return null;
      }
    }

    /**
     * Deselects all bars.
     * @returns {AbstractBarPlot} The calling AbstractBarPlot.
     */
    public deselectAll() {
      if (this._isSetup) {
        this._getDrawersInOrder().forEach((d) => d._renderArea.selectAll("rect").classed("selected", false));
      }
      return this;
    }

    public _updateDomainer(scale: Scale.AbstractScale<any, number>) {
      if (scale instanceof Scale.AbstractQuantitative) {
        var qscale = <Scale.AbstractQuantitative<any>> scale;
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
          qscale.domainer().pad();
        }
            // prepending "BAR_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        qscale._autoDomainIfAutomaticMode();
      }
    }

    public _updateYDomainer() {
      if (this._isVertical) {
        this._updateDomainer(this._yScale);
      } else {
        super._updateYDomainer();
      }
    }

    public _updateXDomainer() {
      if (!this._isVertical) {
        this._updateDomainer(this._xScale);
      } else {
        super._updateXDomainer();
      }
    }

    public _additionalPaint() {
      var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);
    }

    public _generateDrawSteps(): _Drawer.DrawStep[] {
      var drawSteps: _Drawer.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
        var scaledBaseline = primaryScale.scale(this._baselineValue);
        var positionAttr = this._isVertical ? "y" : "x";
        var dimensionAttr = this._isVertical ? "height" : "width";
        resetAttrToProjector[positionAttr] = () => scaledBaseline;
        resetAttrToProjector[dimensionAttr] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator("bars-reset")});
      }
      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("bars")});

      return drawSteps;
    }

    public _generateAttrToProjector() {
      // Primary scale/direction: the "length" of the bars
      // Secondary scale/direction: the "width" of the bars
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale: Scale.AbstractScale<any,number>    = this._isVertical ? this._yScale : this._xScale;
      var secondaryScale: Scale.AbstractScale<any,number>  = this._isVertical ? this._xScale : this._yScale;
      var primaryAttr     = this._isVertical ? "y" : "x";
      var secondaryAttr   = this._isVertical ? "x" : "y";
      var scaledBaseline = primaryScale.scale(this._baselineValue);
      if (!attrToProjector["width"]) {
        attrToProjector["width"] = () => this._getBarPixelWidth();
      }

      var positionF = attrToProjector[secondaryAttr];
      var widthF = attrToProjector["width"];
      var bandsMode = (secondaryScale instanceof Plottable.Scale.Ordinal)
                      && (<Plottable.Scale.Ordinal> <any> secondaryScale).rangeType() === "bands";
      if (!bandsMode) {
        attrToProjector[secondaryAttr] = (d: any, i: number) => positionF(d, i) - widthF(d, i) * this._barAlignmentFactor;
      } else {
        var bandWidth = (<Plottable.Scale.Ordinal> <any> secondaryScale).rangeBand();
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

      delete attrToProjector["bar-min"];
      delete attrToProjector["bar-max"];

      return attrToProjector;
    }

    /**
     * Computes the minimum position difference in data space between two adjacent data entries.
     * Mainly used to compute the size for all bars in the plot.
     * OrdinalScales default to a value of 1.
     */
    public _getMinimumDataWidth(): number {
      var barWidth: number;
      var secondaryScale: Scale.AbstractScale<any,number>  = this._isVertical ? this._xScale : this._yScale;
      var secondaryDimension = this._isVertical ? this.width() : this.height();
      var secondaryAccessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;

      if (secondaryScale instanceof Plottable.Scale.AbstractQuantitative) {
        var datasetDataPairs = _Util.Methods.flatten(this.datasets().map((dataset) => d3.pairs(dataset.data())));
        barWidth = _Util.Methods.min(datasetDataPairs, (pair: any[], i: number) => {
          return Math.abs(+secondaryAccessor(pair[1], i + 1) - +secondaryAccessor(pair[0], i));
        }, 1);
      } else if (secondaryScale instanceof Plottable.Scale.Ordinal) {
        barWidth = 1;
      }

      return barWidth;
    }

    /**
     * Computes the barPixelWidth of all the bars in the plot.
     *
     * If the position scale of the plot is an OrdinalScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is an OrdinalScale and in points mode, then
     *   from https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints, the max barPixelWidth is step * padding
     * If the position scale of the plot is a QuantitativeScale, then _getMinimumDataWidth is scaled to compute the barPixelWidth
     */
    public _getBarPixelWidth(): number {
      var barPixelWidth: number;
      var barScale: Scale.AbstractScale<any,number>  = this._isVertical ? this._xScale : this._yScale;
      if (barScale instanceof Plottable.Scale.Ordinal) {
        var ordScale = <Plottable.Scale.Ordinal> barScale;
        if (ordScale.rangeType() === "bands") {
          barPixelWidth = ordScale.rangeBand();
        } else {
          // padding is defined as 2 * the ordinal scale's _outerPadding variable
          // HACKHACK need to use _outerPadding for formula as above
          var padding = (<any> ordScale)._outerPadding * 2;

          // step is defined as the range_interval / (padding + number of bars)
          var secondaryDimension = this._isVertical ? this.width() : this.height();
          var step = secondaryDimension / (padding + ordScale.domain().length - 1);

          barPixelWidth = step * padding * 0.5;
        }
      } else {
        barPixelWidth = (barScale.scale(this._getMinimumDataWidth()) - barScale.scale(0)) * 0.5;
      }
      return barPixelWidth;
    }

    /*
     * Gets the current hover mode.
     *
     * @return {string} The current hover mode.
     */
    public hoverMode(): string;
    /**
     * Sets the hover mode for hover interactions. There are two modes:
     *     - "point": Selects the bar under the mouse cursor (default).
     *     - "line" : Selects any bar that would be hit by a line extending
     *                in the same direction as the bar and passing through
     *                the cursor.
     *
     * @param {string} mode The desired hover mode.
     * @return {AbstractBarPlot} The calling Bar Plot.
     */
    public hoverMode(mode: String): AbstractBarPlot<X, Y>;
    public hoverMode(mode?: String): any {
      if (mode == null) {
        return this._hoverMode;
      }
      var modeLC = mode.toLowerCase();
      if (modeLC !== "point" && modeLC !== "line") {
        throw new Error(mode + " is not a valid hover mode");
      }
      this._hoverMode = modeLC;
      return this;
    }

    private clearHoverSelection() {
      this._getDrawersInOrder().forEach((d, i) => {
        d._renderArea.selectAll("rect").classed("not-hovered hovered", false);
      });
    }

    //===== Hover logic =====
    public _hoverOverComponent(p: Point) {
      // no-op
    }

    public _hoverOutComponent(p: Point) {
      this.clearHoverSelection();
    }

    public _doHover(p: Point): Interaction.HoverData {
      var xPositionOrExtent: any = p.x;
      var yPositionOrExtent: any = p.y;
      if (this._hoverMode === "line") {
        var maxExtent: Extent = { min: -Infinity, max: Infinity };
        if (this._isVertical) {
          yPositionOrExtent = maxExtent;
        } else {
          xPositionOrExtent = maxExtent;
        }
      }
      var selectedBars = this.selectBar(xPositionOrExtent, yPositionOrExtent, false);

      if (selectedBars) {
        this._getDrawersInOrder().forEach((d, i) => {
          d._renderArea.selectAll("rect").classed({ "hovered": false, "not-hovered": true });
        });
        selectedBars.classed({ "hovered": true, "not-hovered": false });
      } else {
        this.clearHoverSelection();
      }
      return {
        data: selectedBars ? selectedBars.data() : null,
        selection: selectedBars
      };
    }
    //===== /Hover logic =====
  }
}
}
