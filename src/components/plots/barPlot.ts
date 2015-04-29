///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Bar<X, Y> extends XYPlot<X, Y> {
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
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, isVertical = true) {
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this._defaultFillColor = new Scales.Color().range()[0];
      this.animator("bars-reset", new Animators.Null());
      this.animator("bars", new Animators.Base());
      this.animator("baseline", new Animators.Null());
      this._isVertical = isVertical;
      this.baseline(0);
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Rect(key, this._isVertical);
    }

    protected setup() {
      super.setup();
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
      this.render();
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

      this.render();
      return this;
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
    public barLabelsEnabled(enabled: boolean): Bar<X, Y>;
    public barLabelsEnabled(enabled?: boolean): any {
      if (enabled === undefined) {
        return this._barLabelsEnabled;
      } else {
        this._barLabelsEnabled = enabled;
        this.render();
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
    public barLabelFormatter(formatter: Formatter): Bar<X, Y>;
    public barLabelFormatter(formatter?: Formatter): any {
      if (formatter == null) {
        return this._barLabelFormatter;
      } else {
        this._barLabelFormatter = formatter;
        this.render();
        return this;
      }
    }

    /**
     * Retrieves the closest PlotData to queryPoint.
     *
     * Bars containing the queryPoint are considered closest. If queryPoint lies outside
     * of all bars, we return the closest in the dominant axis (x for horizontal
     * charts, y for vertical) and break ties using the secondary axis.
     *
     * @param {Point} queryPoint The point to which plot data should be compared
     *
     * @returns {PlotData} The PlotData closest to queryPoint
     */
    public getClosestPlotData(queryPoint: Point): PlotData {
      var chartXExtent = { min: 0, max: this.width() };
      var chartYExtent = { min: 0, max: this.height() };

      var minPrimaryDist = Infinity;
      var minSecondaryDist = Infinity;

      var closestData: any[] = [];
      var closestPixelPoints: Point[] = [];
      var closestElements: Element[] = [];

      var queryPtPrimary = this._isVertical ? queryPoint.x : queryPoint.y;
      var queryPtSecondary = this._isVertical ? queryPoint.y : queryPoint.x;

      // SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via
      // mouse events) usually have pixel accuracy. We add a tolerance of 0.5 pixels.
      var tolerance = 0.5;

      this.datasetOrder().forEach((key) => {
        var plotData = this.getAllPlotData(key);
        plotData.pixelPoints.forEach((plotPt, index) => {
          var datum = plotData.data[index];
          var bar = plotData.selection[0][index];

          if (!this._isVisibleOnPlot(datum, plotPt, d3.select(bar))) {
            return;
          }

          var primaryDist = 0;
          var secondaryDist = 0;

          // if we're inside a bar, distance in both directions should stay 0
          var barBBox = bar.getBBox();
          if (!Utils.Methods.intersectsBBox(queryPoint.x, queryPoint.y, barBBox, tolerance)) {
            var plotPtPrimary = this._isVertical ? plotPt.x : plotPt.y;
            primaryDist = Math.abs(queryPtPrimary - plotPtPrimary);

            // compute this bar's min and max along the secondary axis
            var barMinSecondary = this._isVertical ? barBBox.y : barBBox.x;
            var barMaxSecondary = barMinSecondary + (this._isVertical ? barBBox.height : barBBox.width);

            if (queryPtSecondary >= barMinSecondary - tolerance && queryPtSecondary <= barMaxSecondary + tolerance) {
              // if we're within a bar's secondary axis span, it is closest in that direction
              secondaryDist = 0;
            } else {
              var plotPtSecondary = this._isVertical ? plotPt.y : plotPt.x;
              secondaryDist = Math.abs(queryPtSecondary - plotPtSecondary);
            }
          }

          // if we find a closer bar, record its distance and start new closest lists
          if (primaryDist < minPrimaryDist
              || primaryDist === minPrimaryDist && secondaryDist < minSecondaryDist) {
            closestData = [];
            closestPixelPoints = [];
            closestElements = [];

            minPrimaryDist = primaryDist;
            minSecondaryDist = secondaryDist;
          }

          // bars minPrimaryDist away are part of the closest set
          if (primaryDist === minPrimaryDist && secondaryDist === minSecondaryDist) {
            closestData.push(datum);
            closestPixelPoints.push(plotPt);
            closestElements.push(bar);
          }
        });
      });

      return {
        data: closestData,
        pixelPoints: closestPixelPoints,
        selection: d3.selectAll(closestElements)
      };
    }

    protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      var xRange = { min: 0, max: this.width() };
      var yRange = { min: 0, max: this.height() };
      var barBBox = selection[0][0].getBBox();

      return Plottable.Utils.Methods.intersectsBBox(xRange, yRange, barBBox);
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
      if (!this.isSetup) {
        return d3.select();
      }

      // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
      var bars = this._datasetKeysInOrder.reduce((bars: any[], key: string) =>
        bars.concat(this._getBarsFromDataset(key, xValOrExtent, yValOrExtent))
      , []);

      return d3.selectAll(bars);
    }

    private _getBarsFromDataset(key: string, xValOrExtent: number | Extent, yValOrExtent: number | Extent): any[] {
      var bars: any[] = [];

      var drawer = <Drawers.Element>this._key2PlotDatasetKey.get(key).drawer;
      drawer._getRenderArea().selectAll("rect").each(function(d) {
        if (Utils.Methods.intersectsBBox(xValOrExtent, yValOrExtent, this.getBBox())) {
          bars.push(this);
        }
      });
      return bars;
    }

    protected _updateDomainer(scale: Scale<any, number>) {
      if (scale instanceof QuantitativeScale) {
        var qscale = <QuantitativeScale<any>> scale;
        if (!qscale._userSetDomainer) {
          if (this._baselineValue != null) {
            qscale.domainer()
              .addPaddingException(this._baselineValue, "BAR_PLOT+" + this.getID())
              .addIncludedValue(this._baselineValue, "BAR_PLOT+" + this.getID());
          } else {
            qscale.domainer()
              .removePaddingException("BAR_PLOT+" + this.getID())
              .removeIncludedValue("BAR_PLOT+" + this.getID());
          }
          qscale.domainer().pad().nice();
        }
            // prepending "BAR_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        qscale._autoDomainIfAutomaticMode();
      }
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
      var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);

      var drawers: Drawers.Rect[] = <any> this._getDrawersInOrder();
      drawers.forEach((d: Drawers.Rect) => d.removeLabels());
      if (this._barLabelsEnabled) {
        Utils.Methods.setTimeout(() => this._drawLabels(), time);
      }
    }

    protected _drawLabels() {
      var drawers: Drawers.Rect[] = <any> this._getDrawersInOrder();
      var attrToProjector = this._generateAttrToProjector();
      var dataToDraw = this._getDataToDraw();
      this._datasetKeysInOrder.forEach((k, i) =>
        drawers[i].drawText(dataToDraw.get(k),
                            attrToProjector,
                            this._key2PlotDatasetKey.get(k).dataset.metadata(),
                            this._key2PlotDatasetKey.get(k).plotMetadata));
      if (this._hideBarsIfAnyAreTooWide && drawers.some((d: Drawers.Rect) => d._getIfLabelsTooWide())) {
        drawers.forEach((d: Drawers.Rect) => d.removeLabels());
      }
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
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
      var primaryScale: Scale<any, number>    = this._isVertical ? this._yScale : this._xScale;
      var secondaryScale: Scale<any, number>  = this._isVertical ? this._xScale : this._yScale;
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

      if (secondaryScale instanceof Plottable.Scales.Category) {
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
     * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is a CategoryScale and in points mode, then
     *   from https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints, the max barPixelWidth is step * padding
     * If the position scale of the plot is a QuantitativeScaleScale, then _getMinimumDataWidth is scaled to compute the barPixelWidth
     */
    protected _getBarPixelWidth(): number {
      var barPixelWidth: number;
      var barScale: Scale<any, number>  = this._isVertical ? this._xScale : this._yScale;
      if (barScale instanceof Plottable.Scales.Category) {
        barPixelWidth = (<Plottable.Scales.Category> barScale).rangeBand();
      } else {
        var barAccessor = this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;

        var numberBarAccessorData = d3.set(Utils.Methods.flatten(this._datasetKeysInOrder.map((k) => {
          var dataset = this._key2PlotDatasetKey.get(k).dataset;
          var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
          return dataset.data().map((d, i) => barAccessor(d, i, dataset.metadata(), plotMetadata).valueOf());
        }))).values().map((value) => +value);

        numberBarAccessorData.sort((a, b) => a - b);

        var barAccessorDataPairs = d3.pairs(numberBarAccessorData);
        var barWidthDimension = this._isVertical ? this.width() : this.height();

        barPixelWidth = Utils.Methods.min(barAccessorDataPairs, (pair: any[], i: number) => {
          return Math.abs(barScale.scale(pair[1]) - barScale.scale(pair[0]));
        }, barWidthDimension * Bar._SINGLE_BAR_DIMENSION_RATIO);

        var scaledData = numberBarAccessorData.map((datum: number) => barScale.scale(datum));
        var minScaledDatum = Utils.Methods.min(scaledData, 0);
        if (this._barAlignmentFactor !== 0 && minScaledDatum > 0) {
          barPixelWidth = Math.min(barPixelWidth, minScaledDatum / this._barAlignmentFactor);
        }
        var maxScaledDatum = Utils.Methods.max(scaledData, 0);
        if (this._barAlignmentFactor !== 1 && maxScaledDatum < barWidthDimension) {
          var margin = barWidthDimension - maxScaledDatum;
          barPixelWidth = Math.min(barPixelWidth, margin / (1 - this._barAlignmentFactor));
        }

        barPixelWidth *= Bar._BAR_WIDTH_RATIO;
      }
      return barPixelWidth;
    }

    protected _getAllPlotData(datasetKeys: string[]): PlotData {
      var plotData = super._getAllPlotData(datasetKeys);

      var valueScale = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = (<Scale<any, any>> (this._isVertical ? this._yScale : this._xScale)).scale(this.baseline());
      var isVertical = this._isVertical;
      var barAlignmentFactor = this._barAlignmentFactor;

      plotData.selection.each(function (datum, index) {
        var bar = d3.select(this);

        // Using floored pixel values to account for pixel accuracy inconsistencies across browsers
        if (isVertical && Math.floor(+bar.attr("y")) >= Math.floor(scaledBaseline)) {
          plotData.pixelPoints[index].y += +bar.attr("height");
        } else if (!isVertical && Math.floor(+bar.attr("x")) < Math.floor(scaledBaseline)) {
          plotData.pixelPoints[index].x -= +bar.attr("width");
        }

        if (isVertical) {
          plotData.pixelPoints[index].x = +bar.attr("x") + +bar.attr("width") * barAlignmentFactor;
        } else {
          plotData.pixelPoints[index].y = +bar.attr("y") + +bar.attr("height") * barAlignmentFactor;
        }
      });

      return plotData;
    }
  }
}
}
