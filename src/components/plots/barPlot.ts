///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Bar<X,Y> extends AbstractXYPlot<X,Y> implements Interaction.Hoverable {
    protected static _BarAlignmentToFactor: {[alignment: string]: number} = {"left": 0, "center": 0.5, "right": 1};
    protected static _DEFAULT_WIDTH = 10;
    private static _BAR_WIDTH_RATIO = 0.95;
    private static _SINGLE_BAR_DIMENSION_RATIO = 0.4;
    private _baseline: D3.Selection;
    private _baselineValue: number;
    private _barAlignmentFactor = 0.5;
    protected _isVertical: boolean;
    private _barLabelFormatter: Formatter = Formatters.identity();
    private _barLabelsEnabled = false;
    private _hoverMode = "point";
    private _hideBarsIfAnyAreTooWide = true;
    private _defaultFillColor: string;

    /**
     * Constructs a BarPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {boolean} isVertical if the plot if vertical.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>, isVertical = true) {
      super(xScale, yScale);
      _Util.Methods.uniqPush(this._cssClasses, "bar-plot");
      this._defaultFillColor = new Scale.Color().range()[0];
      this._animators["bar-reset"] = new Animator.Null();
      this._animators["bars"] = new Animator.Base();
      this._animators["baseline"] = new Animator.Null();
      this._isVertical = isVertical;
      this._baselineValue = 0;

      if (isVertical) {
        Bar._updateDomainerBaseline(yScale, 0, this._plottableID);
      } else {
        Bar._updateDomainerBaseline(xScale, 0, this._plottableID);
      }
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.Rect(key, this._isVertical);
    }

    protected _setup() {
      super._setup();
      this._baseline = this._renderArea.append("line").classed("baseline", true);
    }

    /**
     * Gets the baseline value for the bars
     *
     * The baseline is the line that the bars are drawn from, defaulting to 0.
     *
     * @returns {number} The baseline value.
     */
    public baseline(): number;
    /**
     * Sets the baseline for the bars to the specified value.
     *
     * The baseline is the line that the bars are drawn from, defaulting to 0.
     *
     * @param {number} value The value to position the baseline at.
     * @returns {Bar} The calling Bar.
     */
    public baseline(value: number): Bar<X, Y>;
    public baseline(value?: number): any {
      if (value == null) {
        return this._baselineValue;
      }
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
     * @returns {Bar} The calling Bar.
     */
    public barAlignment(alignment: string) {
      var alignmentLC = alignment.toLowerCase();
      var align2factor = (<typeof Bar> this.constructor)._BarAlignmentToFactor;
      if (align2factor[alignmentLC] === undefined) {
        throw new Error("unsupported bar alignment");
      }
      this._barAlignmentFactor = align2factor[alignmentLC];

      this._render();
      return this;
    }


    private _parseExtent(input: any): Extent {
      if (typeof(input) === "number") {
        return {min: input, max: input};
      } else if (input instanceof Object && "min" in input && "max" in input) {
        return <Extent> input;
      } else {
        throw new Error("input '" + input + "' can't be parsed as an Extent");
      }
    }

    /**
     * Get whether bar labels are enabled.
     *
     * @returns {boolean} Whether bars should display labels or not.
     */
    public barLabelsEnabled(): boolean;
    /**
     * Set whether bar labels are enabled.
     * @param {boolean} Whether bars should display labels or not.
     *
     * @returns {Bar} The calling plot.
     */
    public barLabelsEnabled(enabled: boolean): Bar<X,Y>;
    public barLabelsEnabled(enabled?: boolean): any {
      if (enabled === undefined) {
        return this._barLabelsEnabled;
      } else {
        this._barLabelsEnabled = enabled;
        this._render();
        return this;
      }
    }

    /**
     * Get the formatter for bar labels.
     *
     * @returns {Formatter} The formatting function for bar labels.
     */
    public barLabelFormatter(): Formatter;
    /**
     * Change the formatting function for bar labels.
     * @param {Formatter} The formatting function for bar labels.
     *
     * @returns {Bar} The calling plot.
     */
    public barLabelFormatter(formatter: Formatter): Bar<X,Y>;
    public barLabelFormatter(formatter?: Formatter): any {
      if (formatter == null) {
        return this._barLabelFormatter;
      } else {
        this._barLabelFormatter = formatter;
        this._render();
        return this;
      }
    }

    /**
     * Gets the bar under the given pixel position (if [xValOrExtent]
     * and [yValOrExtent] are {number}s), under a given line (if only one
     * of [xValOrExtent] or [yValOrExtent] are {Extent}s) or are under a
     * 2D area (if [xValOrExtent] and [yValOrExtent] are both {Extent}s).
     *
     * @param {number | Extent} xValOrExtent The pixel x position, or range of x values.
     * @param {number | Extent} yValOrExtent The pixel y position, or range of y values.
     * @returns {D3.Selection} The selected bar, or null if no bar was selected.
     */
    public getBars(xValOrExtent: number | Extent, yValOrExtent: number | Extent): D3.Selection {
      if (!this._isSetup) {
        return d3.select();
      }

      var xExtent: Extent = this._parseExtent(xValOrExtent);
      var yExtent: Extent = this._parseExtent(yValOrExtent);

      // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
      var bars = this._datasetKeysInOrder.reduce((bars: any[], key: string) =>
        bars.concat(this._getBarsFromDataset(key, xExtent, yExtent))
      , []);

      return d3.selectAll(bars);
    }

    private _getBarsFromDataset(key: string, xExtent: Extent, yExtent: Extent): any[] {
      // the SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via
      // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
      // seems appropriate:
      var tolerance: number = 0.5;
      var bars: any[] = [];

      var drawer = <_Drawer.Element>this._key2PlotDatasetKey.get(key).drawer;
      drawer._getRenderArea().selectAll("rect").each(function(d) {
        var bbox = this.getBBox();
        if (bbox.x + bbox.width >= xExtent.min - tolerance && bbox.x <= xExtent.max + tolerance &&
            bbox.y + bbox.height >= yExtent.min - tolerance && bbox.y <= yExtent.max + tolerance) {
          bars.push(this);
        }
      });
      return bars;
    }

    private static _updateDomainerBaseline(scale: Scale.AbstractScale<any, number>, baselineValue: number, id: number) {
      if (scale instanceof Scale.AbstractQuantitative) {
        var qscale = <Scale.AbstractQuantitative<any>> scale;
        if (!qscale._userSetDomainer) {
          if (baselineValue != null) {
            qscale.domainer()
              .addPaddingException(baselineValue, "BAR_PLOT+" + id)
              .addIncludedValue(baselineValue, "BAR_PLOT+" + id);
          } else {
            qscale.domainer()
              .removePaddingException("BAR_PLOT+" + id)
              .removeIncludedValue("BAR_PLOT+" + id);
          }
          qscale.domainer().pad().nice();
        }
            // prepending "BAR_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        qscale._autoDomainIfAutomaticMode();
      }
    }

    protected _updateDomainer(scale: Scale.AbstractScale<any, number>) {
      Bar._updateDomainerBaseline(scale, this.baseline(), this.getID());
    }

    protected _updateYDomainer() {
      if (this._isVertical) {
        this._updateDomainer(this._yScale);
      } else {
        super._updateYDomainer();
      }
    }

    protected _updateXDomainer() {
      if (!this._isVertical) {
        this._updateDomainer(this._xScale);
      } else {
        super._updateXDomainer();
      }
    }

    protected _additionalPaint(time: number) {
      var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);

      var drawers: _Drawer.Rect[] = <any> this._getDrawersInOrder();
      drawers.forEach((d: _Drawer.Rect) => d.removeLabels());
      if (this._barLabelsEnabled) {
        _Util.Methods.setTimeout(() => this._drawLabels(), time);
      }
    }

    protected _drawLabels() {
      var drawers: _Drawer.Rect[] = <any> this._getDrawersInOrder();
      var attrToProjector = this._generateAttrToProjector();
      var dataToDraw = this._getDataToDraw();
      this._datasetKeysInOrder.forEach((k, i) =>
        drawers[i].drawText(dataToDraw.get(k),
                            attrToProjector,
                            this._key2PlotDatasetKey.get(k).dataset.metadata(),
                            this._key2PlotDatasetKey.get(k).plotMetadata));
      if (this._hideBarsIfAnyAreTooWide && drawers.some((d: _Drawer.Rect) => d._getIfLabelsTooWide())) {
        drawers.forEach((d: _Drawer.Rect) => d.removeLabels());
      }
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
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

    protected _generateAttrToProjector() {
      // Primary scale/direction: the "length" of the bars
      // Secondary scale/direction: the "width" of the bars
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale: Scale.AbstractScale<any,number>    = this._isVertical ? this._yScale : this._xScale;
      var secondaryScale: Scale.AbstractScale<any,number>  = this._isVertical ? this._xScale : this._yScale;
      var primaryAttr     = this._isVertical ? "y" : "x";
      var secondaryAttr   = this._isVertical ? "x" : "y";
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var positionF = attrToProjector[secondaryAttr];
      var widthF = attrToProjector["width"];
      if (widthF == null) { widthF = () => this._getBarPixelWidth(); }
      var originalPositionFn = attrToProjector[primaryAttr];
      var heightF = (d: any, i: number, u: any, m: PlotMetadata) => {
        return Math.abs(scaledBaseline - originalPositionFn(d, i, u, m));
      };

      attrToProjector["width"] = this._isVertical ? widthF : heightF;
      attrToProjector["height"] = this._isVertical ? heightF : widthF;

      if (secondaryScale instanceof Plottable.Scale.Ordinal) {
        attrToProjector[secondaryAttr] = (d: any, i: number, u: any, m: PlotMetadata) =>
          positionF(d, i, u, m) - widthF(d, i, u, m) / 2;
      } else {
        attrToProjector[secondaryAttr] = (d: any, i: number, u: any, m: PlotMetadata) =>
          positionF(d, i, u, m) - widthF(d, i, u, m) * this._barAlignmentFactor;
      }

      attrToProjector[primaryAttr] = (d: any, i: number, u: any, m: PlotMetadata) => {
        var originalPos = originalPositionFn(d, i, u, m);
        // If it is past the baseline, it should start at the baselin then width/height
        // carries it over. If it's not past the baseline, leave it at original position and
        // then width/height carries it to baseline
        return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
      };

      var primaryAccessor = this._projections[primaryAttr].accessor;
      if (this.barLabelsEnabled && this.barLabelFormatter) {
        attrToProjector["label"] = (d: any, i: number, u: any, m: PlotMetadata) => {
          return this._barLabelFormatter(primaryAccessor(d, i, u, m));
        };
        attrToProjector["positive"] = (d: any, i: number, u: any, m: PlotMetadata) =>
          originalPositionFn(d, i, u, m) <= scaledBaseline;
      }

      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);

      return attrToProjector;
    }

    /**
     * Computes the barPixelWidth of all the bars in the plot.
     *
     * If the position scale of the plot is an OrdinalScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is an OrdinalScale and in points mode, then
     *   from https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints, the max barPixelWidth is step * padding
     * If the position scale of the plot is a QuantitativeScale, then _getMinimumDataWidth is scaled to compute the barPixelWidth
     */
    protected _getBarPixelWidth(): number {
      var barPixelWidth: number;
      var barScale: Scale.AbstractScale<any,number>  = this._isVertical ? this._xScale : this._yScale;
      if (barScale instanceof Plottable.Scale.Ordinal) {
        barPixelWidth = (<Plottable.Scale.Ordinal> barScale).rangeBand();
      } else {
        var barAccessor = this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;

        var numberBarAccessorData = d3.set(_Util.Methods.flatten(this._datasetKeysInOrder.map((k) => {
          var dataset = this._key2PlotDatasetKey.get(k).dataset;
          var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
          return dataset.data().map((d, i) => barAccessor(d, i, dataset.metadata(), plotMetadata).valueOf());
        }))).values().map((value) => +value);

        numberBarAccessorData.sort((a, b) => a - b);

        var barAccessorDataPairs = d3.pairs(numberBarAccessorData);
        var barWidthDimension = this._isVertical ? this.width() : this.height();

        barPixelWidth = _Util.Methods.min(barAccessorDataPairs, (pair: any[], i: number) => {
          return Math.abs(barScale.scale(pair[1]) - barScale.scale(pair[0]));
        }, barWidthDimension * Bar._SINGLE_BAR_DIMENSION_RATIO);

        var scaledData = numberBarAccessorData.map((datum: number) => barScale.scale(datum));
        var minScaledDatum = _Util.Methods.min(scaledData, 0);
        if (this._barAlignmentFactor !== 0 && minScaledDatum > 0) {
          barPixelWidth = Math.min(barPixelWidth, minScaledDatum / this._barAlignmentFactor);
        }
        var maxScaledDatum = _Util.Methods.max(scaledData, 0);
        if (this._barAlignmentFactor !== 1 && maxScaledDatum < barWidthDimension) {
          var margin = barWidthDimension - maxScaledDatum;
          barPixelWidth = Math.min(barPixelWidth, margin / (1 - this._barAlignmentFactor));
        }

        barPixelWidth *= Bar._BAR_WIDTH_RATIO;
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
     * @return {Bar} The calling Bar Plot.
     */
    public hoverMode(mode: String): Bar<X, Y>;
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

    private _clearHoverSelection() {
      this._getDrawersInOrder().forEach((d, i) => {
        d._getRenderArea().selectAll("rect").classed("not-hovered hovered", false);
      });
    }

    //===== Hover logic =====
    public _hoverOverComponent(p: Point) {
      // no-op
    }

    public _hoverOutComponent(p: Point) {
      this._clearHoverSelection();
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

      var xExtent: Extent = this._parseExtent(xPositionOrExtent);
      var yExtent: Extent = this._parseExtent(yPositionOrExtent);

      var bars: any[] = [];
      var points: Point[] = [];
      var projectors = this._generateAttrToProjector();

      this._datasetKeysInOrder.forEach((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(key).plotMetadata;
        var barsFromDataset = this._getBarsFromDataset(key, xExtent, yExtent);
        d3.selectAll(barsFromDataset).each((d, i) => {
          if (this._isVertical) {
            points.push({
              x: projectors["x"](d, i, dataset.metadata(), plotMetadata) + projectors["width"](d, i, dataset.metadata(), plotMetadata) / 2,
              y: projectors["y"](d, i, dataset.metadata(), plotMetadata) +
                (projectors["positive"](d, i, dataset.metadata(), plotMetadata) ?
                  0 : projectors["height"](d, i, dataset.metadata(), plotMetadata))
            });
          } else {
            points.push({
              x: projectors["x"](d, i, dataset.metadata(), plotMetadata) + projectors["height"](d, i, dataset.metadata(), plotMetadata) / 2,
              y: projectors["y"](d, i, dataset.metadata(), plotMetadata) +
                (projectors["positive"](d, i, dataset.metadata(), plotMetadata) ?
                  0 : projectors["width"](d, i, dataset.metadata(), plotMetadata))
            });
          }
        });
        bars = bars.concat(barsFromDataset);
      });

      var barsSelection = d3.selectAll(bars);

      if (!barsSelection.empty()) {
        this._getDrawersInOrder().forEach((d, i) => {
          d._getRenderArea().selectAll("rect").classed({ "hovered": false, "not-hovered": true });
        });
        barsSelection.classed({ "hovered": true, "not-hovered": false });
      } else {
        this._clearHoverSelection();
        return {
          data: null,
          pixelPositions: null,
          selection: null
        };
      }

      return {
        data: barsSelection.data(),
        pixelPositions: points,
        selection: barsSelection
      };
    }
    //===== /Hover logic =====
  }
}
}
