/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import * as d3 from "d3";

import * as Plots from "../plots";
import * as Scales from "../scales";
import * as Utils from "../utils";
import * as Drawers from "../drawers";

import { Accessor, Point, Bounds, Range } from "../core/interfaces";
import { BaseXYPlot, IXYPlot } from "./baseXYPlot";
import { LabeledComponent } from "../components/labeled";
import { DrawStep } from "../drawers";
import { Dataset } from "../core/dataset";
import { Scale } from "../scales/scale";
import { ScaleCallback } from "../scales/scale";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { PlotEntity } from "./";
import { LightweightPlotEntity } from "./commons";

import { DrawerFactory } from "./basePlot";

export interface IBarPlot<X, Y> extends IXYPlot<X, Y> {
  /**
   * Gets the baseline value.
   * The baseline is the line that the bars are drawn from.
   *
   * @returns {X|Y}
   */
  baselineValue(): X|Y;
  /**
   * Sets the baseline value.
   * The baseline is the line that the bars are drawn from.
   *
   * @param {X|Y} value
   * @returns {Bar} The calling Bar Plot.
   */
  baselineValue(value: X|Y): this;
  baselineValue(value?: X|Y): any
  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  entitiesIn(bounds: Bounds): PlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[]
}

export class BaseBarPlot<X, Y> extends BaseXYPlot<X, Y> implements IBarPlot<X, Y> {
  private static _SINGLE_BAR_DIMENSION_RATIO = 0.4;
  private static _BAR_WIDTH_RATIO = 0.95;

  protected _component: LabeledComponent;
  protected _isVertical: boolean;

  private _barPixelWidth = 0;
  private _baselineValue: X|Y;
  private _baselineValueProvider: () => (X|Y)[];
  private _updateBarPixelWidthCallback: () => void;

  constructor(drawerFactory: DrawerFactory, component: LabeledComponent, width: () => number, height: () => number) {
    super(drawerFactory, component, width, height);
    this._baselineValueProvider = () => [this.baselineValue()];
    this._updateBarPixelWidthCallback = () => this.updateBarPixelWidth();

    this.attr("width", () => this._barPixelWidth);
  }

  public addDataset(dataset: Dataset) {
    super.addDataset(dataset);
    this.updateBarPixelWidth();
    return this;
  }

  public baselineValue(value?: X|Y): any {
    if (value == null) {
      if (this._baselineValue != null) {
        return this._baselineValue;
      }
      if (!this._projectorsReady()) {
        return 0;
      }

      let valueScale = this._isVertical ? this.y().scale : this.x().scale;
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
    return this;
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    if (datasets == null) {
      return super.datasets();
    }

    super.datasets(datasets);
    this.updateBarPixelWidth();
    return this;
  }

  public entities(datasets = this.datasets()): PlotEntity[] {
    if (!this._projectorsReady()) {
      return [];
    }
    let entities = super.entities(datasets);
    return entities;
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

    let queryPtPrimary = this._isVertical ? queryPoint.x : queryPoint.y;
    let queryPtSecondary = this._isVertical ? queryPoint.y : queryPoint.x;

    // SVGRects are positioned with sub-pixel accuracy (the default unit
    // for the x, y, height & width attributes), but user selections (e.g. via
    // mouse events) usually have pixel accuracy. We add a tolerance of 0.5 pixels.
    let tolerance = 0.5;

    const chartBounds = this._component.bounds();
    let closest: LightweightPlotEntity;
    this._getEntityStore().forEach((entity: LightweightPlotEntity) => {
      if (!this._entityVisibleOnPlot(entity, chartBounds)) {
        return;
      }
      let primaryDist = 0;
      let secondaryDist = 0;
      let plotPt = this._pixelPoint(entity.datum, entity.index, entity.dataset);
      // if we're inside a bar, distance in both directions should stay 0

      // HACKHACK Assume that the drawer is SVG based for now
      let barBBox = Utils.DOM.elementBBox((entity.drawer as Drawers.Rectangle).selectionForIndex(entity.validDatumIndex));
      if (!Utils.DOM.intersectsBBox(queryPoint.x, queryPoint.y, barBBox, tolerance)) {
        let plotPtPrimary = this._isVertical ? plotPt.x : plotPt.y;
        primaryDist = Math.abs(queryPtPrimary - plotPtPrimary);

        // compute this bar's min and max along the secondary axis
        let barMinSecondary = this._isVertical ? barBBox.y : barBBox.x;
        let barMaxSecondary = barMinSecondary + (this._isVertical ? barBBox.height : barBBox.width);

        if (queryPtSecondary >= barMinSecondary - tolerance && queryPtSecondary <= barMaxSecondary + tolerance) {
          // if we're within a bar's secondary axis span, it is closest in that direction
          secondaryDist = 0;
        } else {
          let plotPtSecondary = this._isVertical ? plotPt.y : plotPt.x;
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

  public entitiesAt(p: Point) {
    return this._entitiesIntersecting(p.x, p.y);
  }

  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
    let dataXRange: Range;
    let dataYRange: Range;
    if (yRange == null) {
      let bounds = (<Bounds> xRangeOrBounds);
      dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    } else {
      dataXRange = (<Range> xRangeOrBounds);
      dataYRange = yRange;
    }
    return this._entitiesIntersecting(dataXRange, dataYRange);
  }

  public isVertical(): boolean;
  public isVertical(vertical: boolean): this;
  public isVertical(vertical?: boolean): any {
    if (vertical == null) {
      return this._isVertical;
    }
    this._isVertical = vertical;
    return this;
  }

  public removeDataset(dataset: Dataset) {
    dataset.offUpdate(this._updateBarPixelWidthCallback);
    super.removeDataset(dataset);
    this.updateBarPixelWidth();
    return this;
  }

  public updateBarPixelWidth() {
    this._barPixelWidth = this.getBarPixelWidth();
  }

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

  protected _additionalPaint(time: number) {
    Utils.Window.setTimeout(() => this._component.drawLabels(this._getDataToDraw(), this._generateAttrToProjector()), time);
  }

  protected _addDataset(dataset: Dataset) {
    dataset.onUpdate(this._updateBarPixelWidthCallback);
    super._addDataset(dataset);
    return this;
  }

  protected _entityVisibleOnPlot(entity: Plots.PlotEntity | Plots.LightweightPlotEntity, bounds: Bounds) {
    const chartWidth = bounds.bottomRight.x - bounds.topLeft.x;
    const chartHeight = bounds.bottomRight.y - bounds.topLeft.y;

    let xRange = { min: 0, max: chartWidth };
    let yRange = { min: 0, max: chartHeight };

    let attrToProjector = this._generateAttrToProjector();

    const { datum, index, dataset } = entity;

    let barBBox = {
      x: attrToProjector["x"](datum, index, dataset),
      y: attrToProjector["y"](datum, index, dataset),
      width: attrToProjector["width"](datum, index, dataset),
      height: attrToProjector["height"](datum, index, dataset),
    };

    return Utils.DOM.intersectsBBox(xRange, yRange, barBBox);
  }

  protected _removeDataset(dataset: Dataset) {
    dataset.offUpdate(this._updateBarPixelWidthCallback);
    super._removeDataset(dataset);
    return this;
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

    let scale = <QuantitativeScale<any>>accScaleBinding.scale;

    // To account for inverted domains
    extents = extents.map((extent) => d3.extent([
      scale.invert(scale.scale(extent[0]) - this._barPixelWidth / 2),
      scale.invert(scale.scale(extent[0]) + this._barPixelWidth / 2),
      scale.invert(scale.scale(extent[1]) - this._barPixelWidth / 2),
      scale.invert(scale.scale(extent[1]) + this._barPixelWidth / 2),
    ]));

    return extents;
  }

  protected _generateAttrToProjector() {
    // Primary scale/direction: the "length" of the bars
    // Secondary scale/direction: the "width" of the bars
    let attrToProjector = super._generateAttrToProjector();
    let primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
    let primaryAttr = this._isVertical ? "y" : "x";
    let secondaryAttr = this._isVertical ? "x" : "y";
    let scaledBaseline = primaryScale.scale(this.baselineValue());

    let positionF = this._isVertical ? BaseBarPlot._scaledAccessor(this.x()) : BaseBarPlot._scaledAccessor(this.y());
    let widthF = attrToProjector["width"];
    let originalPositionFn = this._isVertical ? BaseBarPlot._scaledAccessor(this.y()) : BaseBarPlot._scaledAccessor(this.x());
    let heightF = (d: any, i: number, dataset: Dataset) => {
      return Math.abs(scaledBaseline - originalPositionFn(d, i, dataset));
    };

    attrToProjector["width"] = this._isVertical ? widthF : heightF;
    attrToProjector["height"] = this._isVertical ? heightF : widthF;

    attrToProjector[secondaryAttr] = (d: any, i: number, dataset: Dataset) =>
    positionF(d, i, dataset) - widthF(d, i, dataset) / 2;

    attrToProjector[primaryAttr] = (d: any, i: number, dataset: Dataset) => {
      let originalPos = originalPositionFn(d, i, dataset);
      // If it is past the baseline, it should start at the baselin then width/height
      // carries it over. If it's not past the baseline, leave it at original position and
      // then width/height carries it to baseline
      return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
    };

    return attrToProjector;
  }

  protected _generateDrawSteps(): DrawStep[] {
    let drawSteps: DrawStep[] = [];
    if (this._animateOnNextRender()) {
      let resetAttrToProjector = this._generateAttrToProjector();
      let primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      let scaledBaseline = primaryScale.scale(this.baselineValue());
      let positionAttr = this._isVertical ? "y" : "x";
      let dimensionAttr = this._isVertical ? "height" : "width";
      resetAttrToProjector[positionAttr] = () => scaledBaseline;
      resetAttrToProjector[dimensionAttr] = () => 0;
      drawSteps.push({ attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }
    drawSteps.push({
      attrToProjector: this._generateAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN)
    });
    return drawSteps;
  }

  /**
   * Computes the barPixelWidth of all the bars in the plot.
   *
   * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
   * If the position scale of the plot is a QuantitativeScale, then the bar width is equal to the smallest distance between
   * two adjacent data points, padded for visualisation.
   */
  public getBarPixelWidth(): number {
    if (!this._projectorsReady()) {
      return 0;
    }
    let barPixelWidth: number;
    let barScale: Scale<any, number> = this._isVertical ? this.x().scale : this.y().scale;
    if (barScale instanceof Scales.Category) {
      barPixelWidth = (<Scales.Category> barScale).rangeBand();
    } else {
      let barAccessor = this._isVertical ? this.x().accessor : this.y().accessor;

      let numberBarAccessorData = d3.set(Utils.Array.flatten(this.datasets().map((dataset) => {
        return dataset.data().map((d, i) => barAccessor(d, i, dataset))
          .filter((d) => d != null)
          .map((d) => d.valueOf());
      }))).values().map((value) => +value);

      numberBarAccessorData.sort((a, b) => a - b);

      let scaledData = numberBarAccessorData.map((datum) => barScale.scale(datum));
      let barAccessorDataPairs = d3.pairs(scaledData);
      let barWidthDimension = this._isVertical ? this._width() : this._height();

      barPixelWidth = Utils.Math.min(barAccessorDataPairs, (pair: any[], i: number) => {
        return Math.abs(pair[1] - pair[0]);
      }, barWidthDimension * BaseBarPlot._SINGLE_BAR_DIMENSION_RATIO);

      barPixelWidth *= BaseBarPlot._BAR_WIDTH_RATIO;
    }
    return barPixelWidth;
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw = new Utils.Map<Dataset, any[]>();
    let attrToProjector = this._generateAttrToProjector();
    this.datasets().forEach((dataset: Dataset) => {
      let data = dataset.data().filter((d, i) => Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)));
      dataToDraw.set(dataset, data);
    });
    return dataToDraw;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    let attrToProjector = this._generateAttrToProjector();
    let rectX = attrToProjector["x"](datum, index, dataset);
    let rectY = attrToProjector["y"](datum, index, dataset);
    let rectWidth = attrToProjector["width"](datum, index, dataset);
    let rectHeight = attrToProjector["height"](datum, index, dataset);
    let x: number;
    let y: number;
    let originalPosition = (this._isVertical ? BaseBarPlot._scaledAccessor(this.y()) : BaseBarPlot._scaledAccessor(this.x()))(datum, index, dataset);
    let scaledBaseline = (<Scale<any, any>> (this._isVertical ? this.y().scale : this.x().scale)).scale(this.baselineValue());
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

  private _entitiesIntersecting(xValOrRange: number | Range, yValOrRange: number | Range): PlotEntity[] {
    let intersected: PlotEntity[] = [];
    this._getEntityStore().forEach((entity) => {

      // HACKHACK Assume the drawer is SVG based
      const selection = (entity.drawer as Drawers.Rectangle).selectionForIndex(entity.validDatumIndex);
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
    let valueScale = this._isVertical ? this.y().scale : this.x().scale;
    if (valueScale instanceof QuantitativeScale) {
      let qscale = <QuantitativeScale<any>> valueScale;
      qscale.addPaddingExceptionsProvider(this._baselineValueProvider);
      qscale.addIncludedValuesProvider(this._baselineValueProvider);
    }
  }
}