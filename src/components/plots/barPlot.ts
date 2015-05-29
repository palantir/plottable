///<reference path="../../reference.ts" />

module Plottable {

type LabelConfig = {
  labelArea: D3.Selection;
  measurer: SVGTypewriter.Measurers.Measurer;
  writer: SVGTypewriter.Writers.Writer;
};

export module Plots {
  export class Bar<X, Y> extends XYPlot<X, Y> {
    public static ORIENTATION_VERTICAL = "vertical";
    public static ORIENTATION_HORIZONTAL = "horizontal";
    protected static _BarAlignmentToFactor: {[alignment: string]: number} = {"left": 0, "center": 0.5, "right": 1};
    protected static _DEFAULT_WIDTH = 10;
    private static _BAR_WIDTH_RATIO = 0.95;
    private static _SINGLE_BAR_DIMENSION_RATIO = 0.4;
    private static _LABEL_AREA_CLASS = "bar-label-text-area";
    private static _LABEL_VERTICAL_PADDING = 5;
    private static _LABEL_HORIZONTAL_PADDING = 5;
    private _baseline: D3.Selection;
    private _baselineValue: number;
    private _barAlignmentFactor = 0.5;
    protected _isVertical: boolean;
    private _labelFormatter: Formatter = Formatters.identity();
    private _labelsEnabled = false;
    private _hideBarsIfAnyAreTooWide = true;
    private _labelConfig: Utils.Map<Dataset, LabelConfig>;

    /**
     * Constructs a Bar Plot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {string} orientation The orientation of the Bar Plot ("vertical"/"horizontal").
     */
    constructor(orientation = Bar.ORIENTATION_VERTICAL) {
      super();
      this.classed("bar-plot", true);
      if (orientation !== Bar.ORIENTATION_VERTICAL && orientation !== Bar.ORIENTATION_HORIZONTAL) {
        throw new Error(orientation + " is not a valid orientation for Plots.Bar");
      }
      this._isVertical = orientation === Bar.ORIENTATION_VERTICAL;
      this.animator("baseline", new Animators.Null());
      this.baseline(0);
      this.attr("fill", new Scales.Color().range()[0]);
      this.attr("width", () => this._getBarPixelWidth());
      this._labelConfig = new Utils.Map<Dataset, LabelConfig>();
    }

    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | Accessor<number>): Bar<X, Y>;
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): Bar<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }

      if (xScale == null) {
        super.x(<number | Accessor<number>>x);
      } else {
        super.x(< X | Accessor<X>>x, xScale);
      }

      this._updateValueScale();
      return this;
    }

    public y(): Plots.AccessorScaleBinding<Y, number>;
    public y(y: number | Accessor<number>): Bar<X, Y>;
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): Bar<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }

      if (yScale == null) {
        super.y(<number | Accessor<number>>y);
      } else {
        super.y(<Y | Accessor<Y>>y, yScale);
      }

      this._updateValueScale();
      return this;
    }

    protected _getDrawer(dataset: Dataset) {
      return new Plottable.Drawers.Rect(dataset);
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
      this._updateValueScale();
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
    public labelsEnabled(): boolean;
    /**
     * Set whether bar labels are enabled.
     * @param {boolean} Whether bars should display labels or not.
     *
     * @returns {Bar} The calling plot.
     */
    public labelsEnabled(enabled: boolean): Bar<X, Y>;
    public labelsEnabled(enabled?: boolean): any {
      if (enabled === undefined) {
        return this._labelsEnabled;
      } else {
        this._labelsEnabled = enabled;
        this.render();
        return this;
      }
    }

    /**
     * Get the formatter for bar labels.
     *
     * @returns {Formatter} The formatting function for bar labels.
     */
    public labelFormatter(): Formatter;
    /**
     * Change the formatting function for bar labels.
     * @param {Formatter} The formatting function for bar labels.
     *
     * @returns {Bar} The calling plot.
     */
    public labelFormatter(formatter: Formatter): Bar<X, Y>;
    public labelFormatter(formatter?: Formatter): any {
      if (formatter == null) {
        return this._labelFormatter;
      } else {
        this._labelFormatter = formatter;
        this.render();
        return this;
      }
    }

    protected _setupDatasetNodes(dataset: Dataset) {
      super._setupDatasetNodes(dataset);
      var labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
      var measurer = new SVGTypewriter.Measurers.CacheCharacterMeasurer(labelArea);
      var writer = new SVGTypewriter.Writers.Writer(measurer);
      this._labelConfig.set(dataset, { labelArea: labelArea, measurer: measurer, writer: writer });
    }

    protected _removeDatasetNodes(dataset: Dataset) {
      super._removeDatasetNodes(dataset);
      var labelConfig = this._labelConfig.get(dataset);
      if (labelConfig != null) {
        labelConfig.labelArea.remove();
        this._labelConfig.delete(dataset);
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

      this.datasets().forEach((dataset) => {
        var plotData = this.getAllPlotData([dataset]);
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
     * Gets the {Plots.PlotData} that correspond to the given pixel position.
     *
     * @param {Point} p The provided pixel position as a {Point}
     * @return {Plots.PlotData} The plot data that corresponds to the {Point}.
     */
    public plotDataAt(p: Point): PlotData {
      return this._getPlotData(p.x, p.y);
    }

    /**
     * Gets the {Plots.PlotData} that correspond to a given xRange/yRange
     *
     */
    public plotDataIn(bounds: Bounds): PlotData;
    /**
     * @param {Range} xRange The specified range of x values
     * @param {Range} yRange The specified range of y values
     * @return {Plots.PlotData} The plot data that corresponds to the ranges
     */
    public plotDataIn(xRange: Range, yRange: Range): PlotData;
    public plotDataIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotData {
      var dataXRange: Range;
      var dataYRange: Range;
      if (yRange == null) {
        var bounds = (<Bounds> xRangeOrBounds);
        dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
        dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
      } else {
          dataXRange = (<Range> xRangeOrBounds);
        dataYRange = yRange;
      }
      return this._getPlotData(dataXRange, dataYRange);
    }

    private _getPlotData(xValOrRange: number | Range, yValOrRange: number | Range): PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var elements: EventTarget[] = [];

      var plotData = this.getAllPlotData();
      plotData.selection.each(function(datum, i) {
        if (Utils.Methods.intersectsBBox(xValOrRange, yValOrRange, this.getBBox())) {
          data.push(plotData.data[i]);
          pixelPoints.push(plotData.pixelPoints[i]);
          elements.push(this);
        }
      });
      return { data: data, pixelPoints: pixelPoints, selection: d3.selectAll(elements) };
    }

    private _updateValueScale() {
      if (!this._projectorsReady()) {
        return;
      }
      var valueScale = this._isVertical ? this.y().scale : this.x().scale;
      if (valueScale instanceof QuantitativeScale) {
        var qscale = <QuantitativeScale<any>> valueScale;
        if (this._baselineValue != null) {
          qscale.addPaddingException(this, this._baselineValue);
          qscale.addIncludedValue(this, this._baselineValue);
        } else {
          qscale.removePaddingException(this);
          qscale.removeIncludedValue(this);
        }
      }
    }

    protected _additionalPaint(time: number) {
      var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);

      this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
      if (this._labelsEnabled) {
        Utils.Methods.setTimeout(() => this._drawLabels(), time);
      }
    }

    private _drawLabels() {
      var dataToDraw = this._getDataToDraw();
      var labelsTooWide = false;
      this._datasetKeysInOrder.forEach((k, i) =>
        labelsTooWide = labelsTooWide || this._drawLabel(dataToDraw.get(k), this._key2PlotDatasetKey.get(k).dataset));
      if (this._hideBarsIfAnyAreTooWide && labelsTooWide) {
        this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
      }
    }

    private _drawLabel(data: any[], dataset: Dataset) {
      var attrToProjector = this._generateAttrToProjector();
      var labelConfig = this._labelConfig.get(dataset);
      var labelArea = labelConfig.labelArea;
      var measurer = labelConfig.measurer;
      var writer = labelConfig.writer;
      var labelTooWide: boolean[] = data.map((d, i) => {
        var primaryAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
        var originalPositionFn = this._isVertical ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.x());
        var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
        var scaledBaseline = primaryScale.scale(this._baselineValue);
        var text = this._labelFormatter(primaryAccessor(d, i, dataset)).toString();
        var w = attrToProjector["width"](d, i, dataset);
        var h = attrToProjector["height"](d, i, dataset);
        var x = attrToProjector["x"](d, i, dataset);
        var y = attrToProjector["y"](d, i, dataset);
        var positive = originalPositionFn(d, i, dataset) <= scaledBaseline;
        var measurement = measurer.measure(text);
        var color = attrToProjector["fill"](d, i, dataset);
        var dark = Utils.Colors.contrast("white", color) * 1.6 < Utils.Colors.contrast("black", color);
        var primary = this._isVertical ? h : w;
        var primarySpace = this._isVertical ? measurement.height : measurement.width;

        var secondaryAttrTextSpace = this._isVertical ? measurement.width : measurement.height;
        var secondaryAttrAvailableSpace = this._isVertical ? w : h;
        var tooWide = secondaryAttrTextSpace + 2 * Bar._LABEL_HORIZONTAL_PADDING > secondaryAttrAvailableSpace;
        if (measurement.height <= h && measurement.width <= w) {
          var offset = Math.min((primary - primarySpace) / 2, Bar._LABEL_VERTICAL_PADDING);
          if (!positive) { offset = offset * -1; }
          if (this._isVertical) {
            y += offset;
          } else {
            x += offset;
          }

          var g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
          var className = dark ? "dark-label" : "light-label";
          g.classed(className, true);
          var xAlign: string;
          var yAlign: string;
          if (this._isVertical) {
            xAlign = "center";
            yAlign = positive ? "top" : "bottom";
          } else {
            xAlign = positive ? "left" : "right";
            yAlign = "center";
          }
          var writeOptions = {
              selection: g,
              xAlign: xAlign,
              yAlign: yAlign,
              textRotation: 0
          };
          writer.write(text, w, h, writeOptions);
        }
        return tooWide;
      });
      return labelTooWide.some((d: boolean) => d);
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
        var scaledBaseline = primaryScale.scale(this._baselineValue);
        var positionAttr = this._isVertical ? "y" : "x";
        var dimensionAttr = this._isVertical ? "height" : "width";
        resetAttrToProjector[positionAttr] = () => scaledBaseline;
        resetAttrToProjector[dimensionAttr] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET)});
      }
      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN)});
      return drawSteps;
    }

    protected _generateAttrToProjector() {
      // Primary scale/direction: the "length" of the bars
      // Secondary scale/direction: the "width" of the bars
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      var secondaryScale: Scale<any, number> = this._isVertical ? this.x().scale : this.y().scale;
      var primaryAttr = this._isVertical ? "y" : "x";
      var secondaryAttr = this._isVertical ? "x" : "y";
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var positionF = this._isVertical ? Plot._scaledAccessor(this.x()) : Plot._scaledAccessor(this.y());
      var widthF = attrToProjector["width"];
      var originalPositionFn = this._isVertical ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.x());
      var heightF = (d: any, i: number, dataset: Dataset) => {
        return Math.abs(scaledBaseline - originalPositionFn(d, i, dataset));
      };

      attrToProjector["width"] = this._isVertical ? widthF : heightF;
      attrToProjector["height"] = this._isVertical ? heightF : widthF;

      if (secondaryScale instanceof Plottable.Scales.Category) {
        attrToProjector[secondaryAttr] = (d: any, i: number, dataset: Dataset) =>
          positionF(d, i, dataset) - widthF(d, i, dataset) / 2;
      } else {
        attrToProjector[secondaryAttr] = (d: any, i: number, dataset: Dataset) =>
          positionF(d, i, dataset) - widthF(d, i, dataset) * this._barAlignmentFactor;
      }

      attrToProjector[primaryAttr] = (d: any, i: number, dataset: Dataset) => {
        var originalPos = originalPositionFn(d, i, dataset);
        // If it is past the baseline, it should start at the baselin then width/height
        // carries it over. If it's not past the baseline, leave it at original position and
        // then width/height carries it to baseline
        return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
      };

      return attrToProjector;
    }

    /**
     * Computes the barPixelWidth of all the bars in the plot.
     *
     * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is a CategoryScale and in points mode, then
     *   from https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints, the max barPixelWidth is step * padding
     * If the position scale of the plot is a QuantitativeScale, then _getMinimumDataWidth is scaled to compute the barPixelWidth
     */
    protected _getBarPixelWidth(): number {
      if (!this._projectorsReady()) { return 0; }
      var barPixelWidth: number;
      var barScale: Scale<any, number> = this._isVertical ? this.x().scale : this.y().scale;
      if (barScale instanceof Plottable.Scales.Category) {
        barPixelWidth = (<Plottable.Scales.Category> barScale).rangeBand();
      } else {
        var barAccessor = this._isVertical ? this.x().accessor : this.y().accessor;

        var numberBarAccessorData = d3.set(Utils.Methods.flatten(this._datasetKeysInOrder.map((k) => {
          var dataset = this._key2PlotDatasetKey.get(k).dataset;
          return dataset.data().map((d, i) => barAccessor(d, i, dataset))
                               .filter((d) => d != null)
                               .map((d) => d.valueOf());
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

    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var plotData = super.getAllPlotData(datasets);

      var scaledBaseline = (<Scale<any, any>> (this._isVertical ? this.y().scale : this.x().scale)).scale(this.baseline());
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

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      var attrToProjector = this._generateAttrToProjector();
      var rectX = attrToProjector["x"](datum, index, dataset);
      var rectY = attrToProjector["y"](datum, index, dataset);
      var rectWidth = attrToProjector["width"](datum, index, dataset);
      var rectHeight = attrToProjector["height"](datum, index, dataset);
      var x = this._isVertical ? rectX + rectWidth / 2 : rectX + rectWidth;
      var y = this._isVertical ? rectY : rectY + rectHeight / 2;
      return { x: x, y: y };
    }

    protected _getDataToDraw() {
      var datasets: D3.Map<any[]> = d3.map();
      var attrToProjector = this._generateAttrToProjector();
      this._datasetKeysInOrder.forEach((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var data = dataset.data().filter((d, i) => Utils.Methods.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
                                                   Utils.Methods.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
                                                   Utils.Methods.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
                                                   Utils.Methods.isValidNumber(attrToProjector["height"](d, i, dataset)));
        datasets.set(key, data);
      });
      return datasets;
    }
  }
}
}
