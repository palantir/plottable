///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Bar<X, Y> extends XYPlot<X, Y> implements Interactions.Hoverable {
    protected static BarAlignmentToFactor: {[alignment: string]: number} = {"left": 0, "center": 0.5, "right": 1};
    protected static DEFAULT_WIDTH = 10;
    protected _isVertical: boolean;

    private static BAR_WIDTH_RATIO = 0.95;
    private static SINGLE_BAR_DIMENSION_RATIO = 0.4;

    private _barLabelsEnabled = false;
    private _barLabelFormatter: Formatter = Formatters.identity();
    private _baseline: D3.Selection;
    private _hoverMode = "point";
    private barAlignmentFactor = 0.5;
    private baselineValue: number;
    private defaultFillColor: string;
    private hideBarsIfAnyAreTooWide = true;

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
      this.defaultFillColor = new Scales.Color().range()[0];
      this.animator("bars-reset", new Animators.Null());
      this.animator("bars", new Animators.Base());
      this.animator("baseline", new Animators.Null());
      this._isVertical = isVertical;
      this.baseline(0);
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
      var align2factor = (<typeof Bar> this.constructor).BarAlignmentToFactor;
      if (align2factor[alignmentLC] === undefined) {
        throw new Error("unsupported bar alignment");
      }
      this.barAlignmentFactor = align2factor[alignmentLC];

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
        return this.baselineValue;
      }
      this.baselineValue = value;
      this.updateXDomainer();
      this.updateYDomainer();
      this.render();
      return this;
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
      var bars = this.datasetKeysInOrder.reduce((bars: any[], key: string) =>
        bars.concat(this.getBarsFromDataset(key, xValOrExtent, yValOrExtent))
      , []);

      return d3.selectAll(bars);
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

          if (!this.isVisibleOnPlot(datum, plotPt, d3.select(bar))) {
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

    /*
     * Gets the current hover mode.
     *
     * @return {string} The current hover mode.
     */
    public hoverMode(): string;
    /**
     * Sets the hover mode for hover interactions. There are two modes:
     *     - "point": Selects the bar under the mouse cursor (default).
     *     - "line": Selects any bar that would be hit by a line extending
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

    //===== Hover logic =====
    public doHover(p: Point): Interactions.HoverData {
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

      var xExtent: Extent = Utils.Methods.parseExtent(xPositionOrExtent);
      var yExtent: Extent = Utils.Methods.parseExtent(yPositionOrExtent);

      var bars: any[] = [];
      var points: Point[] = [];
      var projectors = this.generateAttrToProjector();

      this.datasetKeysInOrder.forEach((key: string) => {
        var dataset = this.datasetKeys.get(key).dataset;
        var plotMetadata = this.datasetKeys.get(key).plotMetadata;
        var barsFromDataset = this.getBarsFromDataset(key, xExtent, yExtent);
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
        this.getDrawersInOrder().forEach((d, i) => {
          d._getRenderArea().selectAll("rect").classed({ "hovered": false, "not-hovered": true });
        });
        barsSelection.classed({ "hovered": true, "not-hovered": false });
      } else {
        this.clearHoverSelection();
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

    public hoverOverComponent(p: Point) {
      // no-op
    }

    public hoverOutComponent(p: Point) {
      this.clearHoverSelection();
    }
    //===== /Hover logic =====

    protected additionalPaint(time: number) {
      var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = primaryScale.scale(this.baselineValue);

      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };

      this.getAnimator("baseline").animate(this._baseline, baselineAttr);

      var drawers: Drawers.Rect[] = <any> this.getDrawersInOrder();
      drawers.forEach((d: Drawers.Rect) => d.removeLabels());
      if (this._barLabelsEnabled) {
        Utils.Methods.setTimeout(() => this.drawLabels(), time);
      }
    }

    protected drawLabels() {
      var drawers: Drawers.Rect[] = <any> this.getDrawersInOrder();
      var attrToProjector = this.generateAttrToProjector();
      var dataToDraw = this.getDataToDraw();
      this.datasetKeysInOrder.forEach((k, i) =>
        drawers[i].drawText(dataToDraw.get(k),
                            attrToProjector,
                            this.datasetKeys.get(k).dataset.metadata(),
                            this.datasetKeys.get(k).plotMetadata));
      if (this.hideBarsIfAnyAreTooWide && drawers.some((d: Drawers.Rect) => d._getIfLabelsTooWide())) {
        drawers.forEach((d: Drawers.Rect) => d.removeLabels());
      }
    }

    protected generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this.dataChanged && this.animated) {
        var resetAttrToProjector = this.generateAttrToProjector();
        var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
        var scaledBaseline = primaryScale.scale(this.baselineValue);
        var positionAttr = this._isVertical ? "y" : "x";
        var dimensionAttr = this._isVertical ? "height" : "width";
        resetAttrToProjector[positionAttr] = () => scaledBaseline;
        resetAttrToProjector[dimensionAttr] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this.getAnimator("bars-reset")});
      }
      drawSteps.push({attrToProjector: this.generateAttrToProjector(), animator: this.getAnimator("bars")});
      return drawSteps;
    }

    protected generateAttrToProjector() {
      // Primary scale/direction: the "length" of the bars
      // Secondary scale/direction: the "width" of the bars
      var attrToProjector = super.generateAttrToProjector();
      var primaryScale: Scale<any, number>    = this._isVertical ? this._yScale : this._xScale;
      var secondaryScale: Scale<any, number>  = this._isVertical ? this._xScale : this._yScale;
      var primaryAttr     = this._isVertical ? "y" : "x";
      var secondaryAttr   = this._isVertical ? "x" : "y";
      var scaledBaseline = primaryScale.scale(this.baselineValue);

      var positionF = attrToProjector[secondaryAttr];
      var widthF = attrToProjector["width"];
      if (widthF == null) { widthF = () => this.getBarPixelWidth(); }
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
          positionF(d, i, u, m) - widthF(d, i, u, m) * this.barAlignmentFactor;
      }

      attrToProjector[primaryAttr] = (d: any, i: number, u: any, m: PlotMetadata) => {
        var originalPos = originalPositionFn(d, i, u, m);
        // If it is past the baseline, it should start at the baselin then width/height
        // carries it over. If it's not past the baseline, leave it at original position and
        // then width/height carries it to baseline
        return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
      };

      var primaryAccessor = this.projections[primaryAttr].accessor;
      if (this.barLabelsEnabled && this.barLabelFormatter) {
        attrToProjector["label"] = (d: any, i: number, u: any, m: PlotMetadata) => {
          return this._barLabelFormatter(primaryAccessor(d, i, u, m));
        };
        attrToProjector["positive"] = (d: any, i: number, u: any, m: PlotMetadata) =>
          originalPositionFn(d, i, u, m) <= scaledBaseline;
      }

      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this.defaultFillColor);

      return attrToProjector;
    }

    protected _getAllPlotData(datasetKeys: string[]): PlotData {
      var plotData = super._getAllPlotData(datasetKeys);

      var valueScale = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = (<Scale<any, any>> (this._isVertical ? this._yScale : this._xScale)).scale(this.baseline());
      var isVertical = this._isVertical;
      var barAlignmentFactor = this.barAlignmentFactor;

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

    /**
     * Computes the barPixelWidth of all the bars in the plot.
     *
     * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is a CategoryScale and in points mode, then
     *   from https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints, the max barPixelWidth is step * padding
     * If the position scale of the plot is a QuantitativeScaleScale, then _getMinimumDataWidth is scaled to compute the barPixelWidth
     */
    protected getBarPixelWidth(): number {
      var barPixelWidth: number;
      var barScale: Scale<any, number>  = this._isVertical ? this._xScale : this._yScale;
      if (barScale instanceof Plottable.Scales.Category) {
        barPixelWidth = (<Plottable.Scales.Category> barScale).rangeBand();
      } else {
        var barAccessor = this._isVertical ? this.projections["x"].accessor : this.projections["y"].accessor;

        var numberBarAccessorData = d3.set(Utils.Methods.flatten(this.datasetKeysInOrder.map((k) => {
          var dataset = this.datasetKeys.get(k).dataset;
          var plotMetadata = this.datasetKeys.get(k).plotMetadata;
          return dataset.data().map((d, i) => barAccessor(d, i, dataset.metadata(), plotMetadata).valueOf());
        }))).values().map((value) => +value);

        numberBarAccessorData.sort((a, b) => a - b);

        var barAccessorDataPairs = d3.pairs(numberBarAccessorData);
        var barWidthDimension = this._isVertical ? this.width() : this.height();

        barPixelWidth = Utils.Methods.min(barAccessorDataPairs, (pair: any[], i: number) => {
          return Math.abs(barScale.scale(pair[1]) - barScale.scale(pair[0]));
        }, barWidthDimension * Bar.SINGLE_BAR_DIMENSION_RATIO);

        var scaledData = numberBarAccessorData.map((datum: number) => barScale.scale(datum));
        var minScaledDatum = Utils.Methods.min(scaledData, 0);
        if (this.barAlignmentFactor !== 0 && minScaledDatum > 0) {
          barPixelWidth = Math.min(barPixelWidth, minScaledDatum / this.barAlignmentFactor);
        }
        var maxScaledDatum = Utils.Methods.max(scaledData, 0);
        if (this.barAlignmentFactor !== 1 && maxScaledDatum < barWidthDimension) {
          var margin = barWidthDimension - maxScaledDatum;
          barPixelWidth = Math.min(barPixelWidth, margin / (1 - this.barAlignmentFactor));
        }

        barPixelWidth *= Bar.BAR_WIDTH_RATIO;
      }
      return barPixelWidth;
    }

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Rect(key, this._isVertical);
    }

    protected isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      var xRange = { min: 0, max: this.width() };
      var yRange = { min: 0, max: this.height() };
      var barBBox = selection[0][0].getBBox();

      return Plottable.Utils.Methods.intersectsBBox(xRange, yRange, barBBox);
    }

    protected setup() {
      super.setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
    }

    protected updateDomainer(scale: Scale<any, number>) {
      if (scale instanceof QuantitativeScale) {
        var qscale = <QuantitativeScale<any>> scale;
        if (!qscale.setByUser) {
          if (this.baselineValue != null) {
            qscale.domainer()
              .addPaddingException(this.baselineValue, "BAR_PLOT+" + this.getID())
              .addIncludedValue(this.baselineValue, "BAR_PLOT+" + this.getID());
          } else {
            qscale.domainer()
              .removePaddingException("BAR_PLOT+" + this.getID())
              .removeIncludedValue("BAR_PLOT+" + this.getID());
          }
          qscale.domainer().pad().nice();
        }
            // prepending "BAR_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        qscale.autoDomainIfAutomaticMode();
      }
    }

    protected updateXDomainer() {
      if (!this._isVertical) {
        this.updateDomainer(this._xScale);
      } else {
        super.updateXDomainer();
      }
    }

    protected updateYDomainer() {
      if (this._isVertical) {
        this.updateDomainer(this._yScale);
      } else {
        super.updateYDomainer();
      }
    }

    private clearHoverSelection() {
      this.getDrawersInOrder().forEach((d, i) => {
        d._getRenderArea().selectAll("rect").classed("not-hovered hovered", false);
      });
    }

    private getBarsFromDataset(key: string, xValOrExtent: number | Extent, yValOrExtent: number | Extent): any[] {
      var bars: any[] = [];

      var drawer = <Drawers.Element>this.datasetKeys.get(key).drawer;
      drawer._getRenderArea().selectAll("rect").each(function(d) {
        if (Utils.Methods.intersectsBBox(xValOrExtent, yValOrExtent, this.getBBox())) {
          bars.push(this);
        }
      });
      return bars;
    }
  }
}
}
