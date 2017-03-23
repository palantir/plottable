/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesetter from "typesettable";

import * as Animators from "../animators";
import { Dataset } from "../core/dataset";
import * as Formatters from "../core/formatters";
import { Formatter } from "../core/formatters";
import { Accessor, Bounds, Point, Range, SimpleSelection } from "../core/interfaces";
import * as Drawers from "../drawers";
import { ProxyDrawer } from "../drawers/drawer";
import { RectangleCanvasDrawStep, RectangleSVGDrawer } from "../drawers/rectangleDrawer";
import * as Scales from "../scales";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import { makeEnum } from "../utils/makeEnum";
import * as Plots from "./";
import { PlotEntity } from "./";
import { LightweightPlotEntity } from "./commons";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

type LabelConfig = {
  labelArea: SimpleSelection<void>;
  measurer: Typesetter.Measurer;
  writer: Typesetter.Writer;
};

export const BarOrientation = makeEnum(["vertical", "horizontal"]);
export type BarOrientation = keyof typeof BarOrientation;

export class Bar<X, Y> extends XYPlot<X, Y> {
  private static _BAR_WIDTH_RATIO = 0.95;
  private static _SINGLE_BAR_DIMENSION_RATIO = 0.4;
  private static _BAR_AREA_CLASS = "bar-area";

  protected static _LABEL_AREA_CLASS = "bar-label-text-area";
  protected static _LABEL_PADDING = 10;

  private _baseline: SimpleSelection<void>;
  private _baselineValue: X|Y;
  protected _isVertical: boolean;
  private _labelFormatter: Formatter = Formatters.identity();
  private _labelsEnabled = false;
  private _hideBarsIfAnyAreTooWide = true;
  private _labelConfig: Utils.Map<Dataset, LabelConfig>;
  private _baselineValueProvider: () => (X|Y)[];

  private _barPixelWidth = 0;
  private _updateBarPixelWidthCallback: () => void;

  /**
   * A Bar Plot draws bars growing out from a baseline to some value
   *
   * @constructor
   * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
   */
  constructor(orientation: BarOrientation = "vertical") {
    super();
    this.addClass("bar-plot");
    if (orientation !== "vertical" && orientation !== "horizontal") {
      throw new Error(orientation + " is not a valid orientation for Plots.Bar");
    }
    this._isVertical = orientation === "vertical";
    this.animator("baseline", new Animators.Null());
    this.attr("fill", new Scales.Color().range()[0]);
    this.attr("width", () => this._barPixelWidth);
    this._labelConfig = new Utils.Map<Dataset, LabelConfig>();
    this._baselineValueProvider = () => [this.baselineValue()];
    this._updateBarPixelWidthCallback = () => this._updateBarPixelWidth();
  }

  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }

    if (xScale == null) {
      super.x(<number | Accessor<number>>x);
    } else {
      super.x(< X | Accessor<X>>x, xScale);
      xScale.onUpdate(this._updateBarPixelWidthCallback);
    }

    this._updateValueScale();
    return this;
  }

  public y(): Plots.TransformableAccessorScaleBinding<Y, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    if (y == null) {
      return super.y();
    }

    if (yScale == null) {
      super.y(<number | Accessor<number>>y);
    } else {
      super.y(<Y | Accessor<Y>>y, yScale);
      yScale.onUpdate(this._updateBarPixelWidthCallback);
    }

    this._updateValueScale();
    return this;
  }

  /**
   * Gets the orientation of the plot
   *
   * @return "vertical" | "horizontal"
   */
  public orientation(): BarOrientation {
    return this._isVertical ? "vertical" : "horizontal";
  }

  public render() {
    this._updateBarPixelWidth();
    this._updateExtents();
    super.render();
    return this;
  }

  protected _createDrawer() {
    return new ProxyDrawer(() => new RectangleSVGDrawer(Bar._BAR_AREA_CLASS), RectangleCanvasDrawStep);
  }

  protected _setup() {
    super._setup();
    this._baseline = this._renderArea.append("line").classed("baseline", true);
  }

  /**
   * Gets the baseline value.
   * The baseline is the line that the bars are drawn from.
   *
   * @returns {X|Y}
   */
  public baselineValue(): X|Y;
  /**
   * Sets the baseline value.
   * The baseline is the line that the bars are drawn from.
   *
   * @param {X|Y} value
   * @returns {Bar} The calling Bar Plot.
   */
  public baselineValue(value: X|Y): this;
  public baselineValue(value?: X|Y): any {
    if (value == null) {
      if (this._baselineValue != null) {
        return this._baselineValue;
      }
      if (!this._projectorsReady()) {
        return 0;
      }
      const valueScale = this._isVertical ? this.y().scale : this.x().scale;
      if (!valueScale) {
        return 0;
      }

      if (valueScale instanceof Scales.Time) {
        return new Date(0);
      }

      return 0;
    }
    this._baselineValue = value;
    this._updateValueScale();
    this.render();
    return this;
  }

  public addDataset(dataset: Dataset) {
    super.addDataset(dataset);
    this._updateBarPixelWidth();
    return this;
  }

  protected _addDataset(dataset: Dataset) {
    dataset.onUpdate(this._updateBarPixelWidthCallback);
    super._addDataset(dataset);
    return this;
  }

  public removeDataset(dataset: Dataset) {
    dataset.offUpdate(this._updateBarPixelWidthCallback);
    super.removeDataset(dataset);
    this._updateBarPixelWidth();
    return this;
  }

  protected _removeDataset(dataset: Dataset) {
    dataset.offUpdate(this._updateBarPixelWidthCallback);
    super._removeDataset(dataset);
    return this;
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    if (datasets == null) {
      return super.datasets();
    }

    super.datasets(datasets);
    this._updateBarPixelWidth();
    return this;
  }

  /**
   * Get whether bar labels are enabled.
   *
   * @returns {boolean} Whether bars should display labels or not.
   */
  public labelsEnabled(): boolean;
  /**
   * Sets whether labels are enabled.
   *
   * @param {boolean} labelsEnabled
   * @returns {Bar} The calling Bar Plot.
   */
  public labelsEnabled(enabled: boolean): this;
  public labelsEnabled(enabled?: boolean): any {
    if (enabled == null) {
      return this._labelsEnabled;
    } else {
      this._labelsEnabled = enabled;
      this.render();
      return this;
    }
  }

  /**
   * Gets the Formatter for the labels.
   */
  public labelFormatter(): Formatter;
  /**
   * Sets the Formatter for the labels.
   *
   * @param {Formatter} formatter
   * @returns {Bar} The calling Bar Plot.
   */
  public labelFormatter(formatter: Formatter): this;
  public labelFormatter(formatter?: Formatter): any {
    if (formatter == null) {
      return this._labelFormatter;
    } else {
      this._labelFormatter = formatter;
      this.render();
      return this;
    }
  }

  protected _createNodesForDataset(dataset: Dataset): ProxyDrawer {
    const drawer = super._createNodesForDataset(dataset);
    const labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
    const context = new Typesetter.SvgContext(labelArea.node() as SVGElement);
    const measurer = new Typesetter.CacheMeasurer(context);
    const writer = new Typesetter.Writer(measurer, context);
    this._labelConfig.set(dataset, { labelArea: labelArea, measurer: measurer, writer: writer });
    return drawer;
  }

  protected _removeDatasetNodes(dataset: Dataset) {
    super._removeDatasetNodes(dataset);
    const labelConfig = this._labelConfig.get(dataset);
    if (labelConfig != null) {
      labelConfig.labelArea.remove();
      this._labelConfig.delete(dataset);
    }
  }

  /**
   * Returns the PlotEntity nearest to the query point according to the following algorithm:
   *   - If the query point is inside a bar, returns the PlotEntity for that bar.
   *   - Otherwise, gets the nearest PlotEntity by the primary direction (X for vertical, Y for horizontal),
   *     breaking ties with the secondary direction.
   * Returns undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  public entityNearest(queryPoint: Point): PlotEntity {
    let minPrimaryDist = Infinity;
    let minSecondaryDist = Infinity;

    const queryPtPrimary = this._isVertical ? queryPoint.x : queryPoint.y;
    const queryPtSecondary = this._isVertical ? queryPoint.y : queryPoint.x;

    // SVGRects are positioned with sub-pixel accuracy (the default unit
    // for the x, y, height & width attributes), but user selections (e.g. via
    // mouse events) usually have pixel accuracy. We add a tolerance of 0.5 pixels.
    const tolerance = 0.5;

    const chartBounds = this.bounds();
    let closest: LightweightPlotEntity;
    this._getEntityStore().forEach((entity: LightweightPlotEntity) => {
      if (!this._entityVisibleOnPlot(entity, chartBounds)) {
        return;
      }
      let primaryDist = 0;
      let secondaryDist = 0;
      const plotPt = this._pixelPoint(entity.datum, entity.index, entity.dataset);
      // if we're inside a bar, distance in both directions should stay 0
      const barBBox = Utils.DOM.elementBBox(d3.select(entity.drawer.getVisualPrimitiveAtIndex(entity.validDatumIndex)));
      if (!Utils.DOM.intersectsBBox(queryPoint.x, queryPoint.y, barBBox, tolerance)) {
        const plotPtPrimary = this._isVertical ? plotPt.x : plotPt.y;
        primaryDist = Math.abs(queryPtPrimary - plotPtPrimary);

        // compute this bar's min and max along the secondary axis
        const barMinSecondary = this._isVertical ? barBBox.y : barBBox.x;
        const barMaxSecondary = barMinSecondary + (this._isVertical ? barBBox.height : barBBox.width);

        if (queryPtSecondary >= barMinSecondary - tolerance && queryPtSecondary <= barMaxSecondary + tolerance) {
          // if we're within a bar's secondary axis span, it is closest in that direction
          secondaryDist = 0;
        } else {
          const plotPtSecondary = this._isVertical ? plotPt.y : plotPt.x;
          secondaryDist = Math.abs(queryPtSecondary - plotPtSecondary);
        }
      }
      // if we find a closer bar, record its distance and start new closest lists
      if (primaryDist < minPrimaryDist
        || primaryDist === minPrimaryDist && secondaryDist < minSecondaryDist) {
        closest = entity;
        minPrimaryDist = primaryDist;
        minSecondaryDist = secondaryDist;
      }
    });

    if (closest !== undefined) {
      return this._lightweightPlotEntityToPlotEntity(closest);
    } else {
      return undefined;
    }
  }

  protected _entityVisibleOnPlot(entity: Plots.PlotEntity | Plots.LightweightPlotEntity, bounds: Bounds) {
    const chartWidth = bounds.bottomRight.x - bounds.topLeft.x;
    const chartHeight = bounds.bottomRight.y - bounds.topLeft.y;

    const xRange = { min: 0, max: chartWidth };
    const yRange = { min: 0, max: chartHeight };

    const attrToProjector = this._generateAttrToProjector();

    const { datum, index, dataset } = entity;

    const barBBox = {
      x: attrToProjector["x"](datum, index, dataset),
      y: attrToProjector["y"](datum, index, dataset),
      width: attrToProjector["width"](datum, index, dataset),
      height: attrToProjector["height"](datum, index, dataset),
    };

    return Utils.DOM.intersectsBBox(xRange, yRange, barBBox);
  }

  /**
   * Gets the Entities at a particular Point.
   *
   * @param {Point} p
   * @returns {PlotEntity[]}
   */
  public entitiesAt(p: Point) {
    return this._entitiesIntersecting(p.x, p.y);
  }

  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  public entitiesIn(bounds: Bounds): PlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  public entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
    let dataXRange: Range;
    let dataYRange: Range;
    if (yRange == null) {
      const bounds = (<Bounds> xRangeOrBounds);
      dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    } else {
      dataXRange = (<Range> xRangeOrBounds);
      dataYRange = yRange;
    }
    return this._entitiesIntersecting(dataXRange, dataYRange);
  }

  private _entitiesIntersecting(xValOrRange: number | Range, yValOrRange: number | Range): PlotEntity[] {
    const intersected: PlotEntity[] = [];
    this._getEntityStore().forEach((entity) => {
      const selection = d3.select(entity.drawer.getVisualPrimitiveAtIndex(entity.validDatumIndex));
      if (Utils.DOM.intersectsBBox(xValOrRange, yValOrRange, Utils.DOM.elementBBox(selection))) {
        intersected.push(this._lightweightPlotEntityToPlotEntity(entity));
      }
    });
    return intersected;
  }

  private _updateValueScale() {
    if (!this._projectorsReady()) {
      return;
    }
    const valueScale = this._isVertical ? this.y().scale : this.x().scale;
    if (valueScale instanceof QuantitativeScale) {
      const qscale = <QuantitativeScale<any>> valueScale;
      qscale.addPaddingExceptionsProvider(this._baselineValueProvider);
      qscale.addIncludedValuesProvider(this._baselineValueProvider);
    }
  }

  protected _additionalPaint(time: number) {
    const primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
    const scaledBaseline = primaryScale.scale(this.baselineValue());

    const baselineAttr: any = {
      "x1": this._isVertical ? 0 : scaledBaseline,
      "y1": this._isVertical ? scaledBaseline : 0,
      "x2": this._isVertical ? this.width() : scaledBaseline,
      "y2": this._isVertical ? scaledBaseline : this.height(),
    };

    this._getAnimator("baseline").animate(this._baseline, baselineAttr);

    this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
    if (this._labelsEnabled) {
      Utils.Window.setTimeout(() => this._drawLabels(), time);
    }
  }

  /**
   * Makes sure the extent takes into account the widths of the bars
   */
  protected _extentsForProperty(property: string) {
    let extents = super._extentsForProperty(property);

    let accScaleBinding: Plots.AccessorScaleBinding<any, any>;
    if (property === "x" && this._isVertical) {
      accScaleBinding = this.x();
    } else if (property === "y" && !this._isVertical) {
      accScaleBinding = this.y();
    } else {
      return extents;
    }

    if (!(accScaleBinding && accScaleBinding.scale && accScaleBinding.scale instanceof QuantitativeScale)) {
      return extents;
    }

    const scale = <QuantitativeScale<any>>accScaleBinding.scale;

    // To account for inverted domains
    extents = extents.map((extent) => d3.extent([
      scale.invert(scale.scale(extent[0]) - this._barPixelWidth / 2),
      scale.invert(scale.scale(extent[0]) + this._barPixelWidth / 2),
      scale.invert(scale.scale(extent[1]) - this._barPixelWidth / 2),
      scale.invert(scale.scale(extent[1]) + this._barPixelWidth / 2),
    ]));

    return extents;
  }

  protected _drawLabels() {
    const dataToDraw = this._getDataToDraw();
    let labelsTooWide = false;
    this.datasets().forEach((dataset) => labelsTooWide = labelsTooWide || this._drawLabel(dataToDraw.get(dataset), dataset));
    if (this._hideBarsIfAnyAreTooWide && labelsTooWide) {
      this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
    }
  }

  private _drawLabel(data: any[], dataset: Dataset) {
    const attrToProjector = this._generateAttrToProjector();
    const labelConfig = this._labelConfig.get(dataset);
    const labelArea = labelConfig.labelArea;
    const measurer = labelConfig.measurer;
    const writer = labelConfig.writer;

    const drawLabel = (d: any, i: number) => {
      const valueAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
      const value = valueAccessor(d, i, dataset);
      const valueScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      const scaledValue = valueScale != null ? valueScale.scale(value) : value;
      const scaledBaseline = valueScale != null ? valueScale.scale(this.baselineValue()) : this.baselineValue();

      const barWidth = attrToProjector["width"](d, i, dataset);
      const barHeight = attrToProjector["height"](d, i, dataset);
      const text = this._labelFormatter(valueAccessor(d, i, dataset));
      const measurement = measurer.measure(text);

      let xAlignment: Typesetter.IXAlign = "center";
      let yAlignment: Typesetter.IYAlign = "center";
      const labelContainerOrigin = {
        x: attrToProjector["x"](d, i, dataset),
        y: attrToProjector["y"](d, i, dataset),
      };
      let containerWidth = barWidth;
      let containerHeight = barHeight;

      const labelOrigin = {
        x: labelContainerOrigin.x,
        y: labelContainerOrigin.y,
      };

      let showLabelOnBar: boolean;

      if (this._isVertical) {
        labelOrigin.x += containerWidth / 2 - measurement.width / 2;

        const barY = attrToProjector["y"](d, i, dataset);
        let effectiveBarHeight = barHeight;
        if (barY + barHeight > this.height()) {
          effectiveBarHeight = this.height() - barY;
        } else if (barY < 0) {
          effectiveBarHeight = barY + barHeight;
        }
        const offset = Bar._LABEL_PADDING;
        showLabelOnBar = measurement.height + 2 * offset <= effectiveBarHeight;

        if (showLabelOnBar) {
          if (scaledValue < scaledBaseline) {
            labelContainerOrigin.y += offset;
            yAlignment = "top";
            labelOrigin.y += offset;
          } else {
            labelContainerOrigin.y -= offset;
            yAlignment = "bottom";
            labelOrigin.y += containerHeight - offset - measurement.height;
          }
        } else { // show label off bar
          containerHeight = barHeight + offset + measurement.height;
          if (scaledValue <= scaledBaseline) {
            labelContainerOrigin.y -= offset + measurement.height;
            yAlignment = "top";
            labelOrigin.y -= offset + measurement.height;
          } else {
            yAlignment = "bottom";
            labelOrigin.y += barHeight + offset;
          }
        }
      } else { // horizontal
        labelOrigin.y += containerHeight / 2 - measurement.height / 2;

        const barX = attrToProjector["x"](d, i, dataset);
        let effectiveBarWidth = barWidth;
        if (barX + barWidth > this.width()) {
          effectiveBarWidth = this.width() - barX;
        } else if (barX < 0) {
          effectiveBarWidth = barX + barWidth;
        }
        const offset = Bar._LABEL_PADDING;
        showLabelOnBar = measurement.width + 2 * offset <= effectiveBarWidth;

        if (showLabelOnBar) {
          if (scaledValue < scaledBaseline) {
            labelContainerOrigin.x += offset;
            xAlignment = "left";
            labelOrigin.x += offset;
          } else {
            labelContainerOrigin.x -= offset;
            xAlignment = "right";
            labelOrigin.x += containerWidth - offset - measurement.width;
          }
        } else { // show label off bar
          containerWidth = barWidth + offset + measurement.width;
          if (scaledValue < scaledBaseline) {
            labelContainerOrigin.x -= offset + measurement.width;
            xAlignment = "left";
            labelOrigin.x -= offset + measurement.width;
          } else {
            xAlignment = "right";
            labelOrigin.x += barWidth + offset;
          }
        }
      }

      const labelContainer = labelArea.append("g").attr("transform", `translate(${labelContainerOrigin.x}, ${labelContainerOrigin.y})`);

      if (showLabelOnBar) {
        labelContainer.classed("on-bar-label", true);
        const color = attrToProjector["fill"](d, i, dataset);
        const dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
        labelContainer.classed(dark ? "dark-label" : "light-label", true);
      } else {
        labelContainer.classed("off-bar-label", true);
      }

      const hideLabel = labelOrigin.x < 0 ||
        labelOrigin.y < 0 ||
        labelOrigin.x + measurement.width > this.width() ||
        labelOrigin.y + measurement.height > this.height();
      labelContainer.style("visibility", hideLabel ? "hidden" : "inherit");

      const writeOptions = {
        xAlign: xAlignment,
        yAlign: yAlignment,
      };
      writer.write(text, containerWidth, containerHeight, writeOptions, labelContainer.node());

      const tooWide = this._isVertical
        ? barWidth < (measurement.width + Bar._LABEL_PADDING * 2)
        : barHeight < (measurement.height + Bar._LABEL_PADDING * 2);
      return tooWide;
    };

    const labelTooWide = data.map(drawLabel);
    return labelTooWide.some((d: boolean) => d);
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    const drawSteps: Drawers.DrawStep[] = [];
    if (this._animateOnNextRender()) {
      const resetAttrToProjector = this._generateAttrToProjector();
      const primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      const scaledBaseline = primaryScale.scale(this.baselineValue());
      const positionAttr = this._isVertical ? "y" : "x";
      const dimensionAttr = this._isVertical ? "height" : "width";
      resetAttrToProjector[positionAttr] = () => scaledBaseline;
      resetAttrToProjector[dimensionAttr] = () => 0;
      drawSteps.push({ attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }
    drawSteps.push({
      attrToProjector: this._generateAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN),
    });
    return drawSteps;
  }

  protected _generateAttrToProjector() {
    // Primary scale/direction: the "length" of the bars
    // Secondary scale/direction: the "width" of the bars
    const attrToProjector = super._generateAttrToProjector();
    const primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
    const primaryAttr = this._isVertical ? "y" : "x";
    const secondaryAttr = this._isVertical ? "x" : "y";
    const scaledBaseline = primaryScale.scale(this.baselineValue());

    const positionF = this._isVertical ? Plot._scaledAccessor(this.x()) : Plot._scaledAccessor(this.y());
    const widthF = attrToProjector["width"];
    const originalPositionFn = this._isVertical ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.x());
    const heightF = (d: any, i: number, dataset: Dataset) => {
      return Math.abs(scaledBaseline - originalPositionFn(d, i, dataset));
    };

    attrToProjector["width"] = this._isVertical ? widthF : heightF;
    attrToProjector["height"] = this._isVertical ? heightF : widthF;

    attrToProjector[secondaryAttr] = (d: any, i: number, dataset: Dataset) =>
    positionF(d, i, dataset) - widthF(d, i, dataset) / 2;

    attrToProjector[primaryAttr] = (d: any, i: number, dataset: Dataset) => {
      const originalPos = originalPositionFn(d, i, dataset);
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
   * If the position scale of the plot is a QuantitativeScale, then the bar width is equal to the smallest distance between
   * two adjacent data points, padded for visualisation.
   */
  protected _getBarPixelWidth(): number {
    if (!this._projectorsReady()) {
      return 0;
    }
    let barPixelWidth: number;
    const barScale: Scale<any, number> = this._isVertical ? this.x().scale : this.y().scale;
    if (barScale instanceof Scales.Category) {
      barPixelWidth = (<Scales.Category> barScale).rangeBand();
    } else {
      const barAccessor = this._isVertical ? this.x().accessor : this.y().accessor;

      const numberBarAccessorData = d3.set(Utils.Array.flatten(this.datasets().map((dataset) => {
        return dataset.data().map((d, i) => barAccessor(d, i, dataset))
          .filter((d) => d != null)
          .map((d) => d.valueOf());
      }))).values().map((value) => +value);

      numberBarAccessorData.sort((a, b) => a - b);

      const scaledData = numberBarAccessorData.map((datum) => barScale.scale(datum));
      const barAccessorDataPairs = d3.pairs(scaledData);
      const barWidthDimension = this._isVertical ? this.width() : this.height();

      barPixelWidth = Utils.Math.min(barAccessorDataPairs, (pair: any[], i: number) => {
        return Math.abs(pair[1] - pair[0]);
      }, barWidthDimension * Bar._SINGLE_BAR_DIMENSION_RATIO);

      barPixelWidth *= Bar._BAR_WIDTH_RATIO;
    }
    return barPixelWidth;
  }

  private _updateBarPixelWidth() {
    this._barPixelWidth = this._getBarPixelWidth();
  }

  public entities(datasets = this.datasets()): PlotEntity[] {
    if (!this._projectorsReady()) {
      return [];
    }
    const entities = super.entities(datasets);
    return entities;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    const attrToProjector = this._generateAttrToProjector();
    const rectX = attrToProjector["x"](datum, index, dataset);
    const rectY = attrToProjector["y"](datum, index, dataset);
    const rectWidth = attrToProjector["width"](datum, index, dataset);
    const rectHeight = attrToProjector["height"](datum, index, dataset);
    let x: number;
    let y: number;
    const originalPosition = (this._isVertical ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.x()))(datum, index, dataset);
    const scaledBaseline = (<Scale<any, any>> (this._isVertical ? this.y().scale : this.x().scale)).scale(this.baselineValue());
    if (this._isVertical) {
      x = rectX + rectWidth / 2;
      y = originalPosition <= scaledBaseline ? rectY : rectY + rectHeight;
    } else {
      x = originalPosition >= scaledBaseline ? rectX + rectWidth : rectX;
      y = rectY + rectHeight / 2;
    }
    return { x: x, y: y };
  }

  protected _uninstallScaleForKey(scale: Scale<any, number>, key: string) {
    scale.offUpdate(this._updateBarPixelWidthCallback);
    super._uninstallScaleForKey(scale, key);
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw = new Utils.Map<Dataset, any[]>();
    const attrToProjector = this._generateAttrToProjector();
    this.datasets().forEach((dataset: Dataset) => {
      const data = dataset.data().filter((d, i) => Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)));
      dataToDraw.set(dataset, data);
    });
    return dataToDraw;
  }
}
