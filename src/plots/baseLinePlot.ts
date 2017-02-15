/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Plots from "../plots";
import * as Utils from "../utils";

import { PlotEntity } from "./";

import { BaseXYPlot, IXYPlot } from "./baseXYPlot";
import { Accessor, AttributeToProjector, Projector, Point, Bounds, Range } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { DrawStep } from "../drawers";

export type InterpolatorValue = "linear"
    | "linear-closed"
    | "step"
    | "step-before"
    | "step-after"
    | "basis"
    | "basis-open"
    | "basis-closed"
    | "bundle"
    | "cardinal"
    | "cardinal-open"
    | "cardinal-closed"
    | "monotone";

export interface ILinePlot<X> extends IXYPlot<X, number> {
  /**
   * Gets whether or not the autoranging is done smoothly.
   */
  autorangeSmooth(): boolean;
  /**
   * Sets whether or not the autorange is done smoothly.
   *
   * Smooth autoranging is done by making sure lines always exit on the left / right side of the plot
   * and deactivating the nice domain feature on the scales
   */
  autorangeSmooth(autorangeSmooth: boolean): this;
  autorangeSmooth(autorangeSmooth?: boolean): any;
  /**
   * Gets if croppedRendering is enabled
   *
   * When croppedRendering is enabled, lines that will not be visible in the viewport will not be drawn.
   */
  croppedRenderingEnabled(): boolean;
  /**
   * Sets if croppedRendering is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  croppedRenderingEnabled(croppedRendering: boolean): this;
  croppedRenderingEnabled(croppedRendering?: boolean): any;
  /**
   * Gets if downsampling is enabled
   *
   * When downsampling is enabled, two consecutive lines with the same slope will be merged to one line.
   */
  downsamplingEnabled(): boolean;
  /**
   * Sets if downsampling is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  downsamplingEnabled(downsampling: boolean): this;
  downsamplingEnabled(downsampling?: boolean): any;
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
  entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[];
  /**
   * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  entityNearestByXThenY(queryPoint: Point): PlotEntity;
  /**
   * Gets the interpolation function associated with the plot.
   *
   * @return {string | (points: Array<[number, number]>) => string)}
   */
  interpolator(): InterpolatorValue | ((points: Array<[number, number]>) => string);
  /**
   * Sets the interpolation function associated with the plot.
   *
   * @param {string | points: Array<[number, number]>) => string} interpolator Interpolation function
   * @return Plots.Line
   */
  interpolator(interpolator: InterpolatorValue | ((points: Array<[number, number]>) => string)): this;
  interpolator(interpolator?: string | ((points: Array<[number, number]>) => string)): any;
}

type EdgeIntersections = {
  left: Point[],
  right: Point[],
  top: Point[],
  bottom: Point[]
};

export class BaseLinePlot<X> extends BaseXYPlot<X, number> implements ILinePlot<X> {
  private _autorangeSmooth = false;
  private _croppedRenderingEnabled = true;
  private _downsamplingEnabled = false;
  private _interpolator: InterpolatorValue | ((points: Array<[number, number]>) => string) = "linear";

  public autorangeSmooth(): boolean;
  public autorangeSmooth(autorangeSmooth: boolean): this;
  public autorangeSmooth(autorangeSmooth?: boolean): any {
    if (autorangeSmooth == null) {
      return this._autorangeSmooth;
    }
    this._autorangeSmooth = autorangeSmooth;
    return this;
  }

  public croppedRenderingEnabled(croppedRendering?: boolean): any {
    if (croppedRendering == null) {
      return this._croppedRenderingEnabled;
    }
    this._croppedRenderingEnabled = croppedRendering;
    return this;
  }

  public downsamplingEnabled(downsampling?: boolean): any {
    if (downsampling == null) {
      return this._downsamplingEnabled;
    }
    this._downsamplingEnabled = downsampling;
    return this;
  }

  public entitiesAt(point: Point): PlotEntity[] {
    const entity = this.entityNearestByXThenY(point);
    if (entity != null) {
      return [entity];
    } else {
      return [];
    }
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
      let bounds = (<Bounds> xRangeOrBounds);
      dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    } else {
      dataXRange = (<Range> xRangeOrBounds);
      dataYRange = yRange;
    }

    const xProjector = BaseLinePlot._scaledAccessor(this.x());
    const yProjector = BaseLinePlot._scaledAccessor(this.y());
    return this.entities().filter((entity) => {
      const { datum, index, dataset } = entity;

      const x = xProjector(datum, index, dataset);
      const y = yProjector(datum, index, dataset);
      return dataXRange.min <= x && x <= dataXRange.max && dataYRange.min <= y && y <= dataYRange.max;
    });
  }

  /**
   * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  public entityNearestByXThenY(queryPoint: Point): PlotEntity {
    let minXDist = Infinity;
    let minYDist = Infinity;
    let closest: PlotEntity;

    const chartBounds = this._component.bounds();
    this.entities().forEach((entity) => {
      if (!this._entityVisibleOnPlot(entity, chartBounds)) {
        return;
      }
      let xDist = Math.abs(queryPoint.x - entity.position.x);
      let yDist = Math.abs(queryPoint.y - entity.position.y);

      if (xDist < minXDist || xDist === minXDist && yDist < minYDist) {
        closest = entity;
        minXDist = xDist;
        minYDist = yDist;
      }
    });

    return closest;
  }

  public interpolator(interpolator?: InterpolatorValue | ((points: Array<[number, number]>) => string)): any {
    if (interpolator == null) {
      return this._interpolator;
    }
    this._interpolator = interpolator;
    return this;
  }

  protected _constructLineProjector(xProjector: Projector, yProjector: Projector) {
    let definedProjector = (d: any, i: number, dataset: Dataset) => {
      let positionX = BaseLinePlot._scaledAccessor(this.x())(d, i, dataset);
      let positionY = BaseLinePlot._scaledAccessor(this.y())(d, i, dataset);
      return positionX != null && !Utils.Math.isNaN(positionX) &&
        positionY != null && !Utils.Math.isNaN(positionY);
    };
    return (datum: any, index: number, dataset: Dataset) => {
      return d3.svg.line()
        .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
        .y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
        .interpolate(this.interpolator())
        .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum);
    };
  }

  protected _extentsForProperty(property: string) {
    let extents = super._extentsForProperty(property);

    if (!this._autorangeSmooth) {
      return extents;
    }

    if (this.autorangeMode() !== property) {
      return extents;
    }

    if (this.autorangeMode() !== "x" && this.autorangeMode() !== "y") {
      return extents;
    }

    let edgeIntersectionPoints = this._getEdgeIntersectionPoints();
    let includedValues: number[];
    if (this.autorangeMode() === "y") {
      includedValues = edgeIntersectionPoints.left.concat(edgeIntersectionPoints.right).map((point) => point.y);
    } else { // === "x"
      includedValues = edgeIntersectionPoints.top.concat(edgeIntersectionPoints.bottom).map((point) => point.x);
    }

    return extents.map((extent: [number, number]) => d3.extent(d3.merge([extent, includedValues])));
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();
    Object.keys(attrToProjector).forEach((attribute: string) => {
      if (attribute === "d") {
        return;
      }
      let projector = attrToProjector[attribute];
      attrToProjector[attribute] = (data: any[], i: number, dataset: Dataset) =>
        data.length > 0 ? projector(data[0], i, dataset) : null;
    });

    return attrToProjector;
  }

  protected _generateDrawSteps(): DrawStep[] {
    let drawSteps: DrawStep[] = [];
    if (this._animateOnNextRender()) {
      let attrToProjector = this._generateAttrToProjector();
      attrToProjector["d"] = this._constructLineProjector(BaseLinePlot._scaledAccessor(this.x()), this._getResetYFunction());
      drawSteps.push({ attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }

    drawSteps.push({
      attrToProjector: this._generateAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN)
    });

    return drawSteps;
  }

  protected _getResetYFunction() {
    // gets the y-value generator for the animation start point
    let yDomain = this.y().scale.domain();
    let domainMax = Math.max(yDomain[0], yDomain[1]);
    let domainMin = Math.min(yDomain[0], yDomain[1]);
    // start from zero, or the closest domain value to zero
    // avoids lines zooming on from offscreen.
    let startValue = (domainMax < 0 && domainMax) || (domainMin > 0 && domainMin) || 0;
    let scaledStartValue = this.y().scale.scale(startValue);
    return (d: any, i: number, dataset: Dataset) => scaledStartValue;
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw = new Utils.Map<Dataset, any[]>();

    this.datasets().forEach((dataset) => {
      let data = dataset.data();

      if (!this._croppedRenderingEnabled && !this._downsamplingEnabled) {
        dataToDraw.set(dataset, [data]);
        return;
      }

      let filteredDataIndices = data.map((d, i) => i);
      if (this._croppedRenderingEnabled) {
        filteredDataIndices = this._filterCroppedRendering(dataset, filteredDataIndices);
      }
      if (this._downsamplingEnabled) {
        filteredDataIndices = this._filterDownsampling(dataset, filteredDataIndices);
      }
      dataToDraw.set(dataset, [filteredDataIndices.map((d, i) => data[d])]);
    });

    return dataToDraw;
  }

  protected _propertyProjectors(): AttributeToProjector {
    let propertyToProjectors = super._propertyProjectors();
    propertyToProjectors["d"] = this._constructLineProjector(BaseLinePlot._scaledAccessor(this.x()), BaseLinePlot._scaledAccessor(this.y()));
    return propertyToProjectors;
  }

  private _filterCroppedRendering(dataset: Dataset, indices: number[]) {
    let xProjector = BaseLinePlot._scaledAccessor(this.x());
    let yProjector = BaseLinePlot._scaledAccessor(this.y());

    let data = dataset.data();
    let filteredDataIndices: number[] = [];
    let pointInViewport = (x: number, y: number) => {
      return Utils.Math.inRange(x, 0, this._component.width()) &&
        Utils.Math.inRange(y, 0, this._component.height());
    };

    for (let i = 0; i < indices.length; i++) {
      let currXPoint = xProjector(data[indices[i]], indices[i], dataset);
      let currYPoint = yProjector(data[indices[i]], indices[i], dataset);
      let shouldShow = pointInViewport(currXPoint, currYPoint);

      if (!shouldShow && indices[i - 1] != null && data[indices[i - 1]] != null) {
        let prevXPoint = xProjector(data[indices[i - 1]], indices[i - 1], dataset);
        let prevYPoint = yProjector(data[indices[i - 1]], indices[i - 1], dataset);
        shouldShow = shouldShow || pointInViewport(prevXPoint, prevYPoint);
      }

      if (!shouldShow && indices[i + 1] != null && data[indices[i + 1]] != null) {
        let nextXPoint = xProjector(data[indices[i + 1]], indices[i + 1], dataset);
        let nextYPoint = yProjector(data[indices[i + 1]], indices[i + 1], dataset);
        shouldShow = shouldShow || pointInViewport(nextXPoint, nextYPoint);
      }

      if (shouldShow) {
        filteredDataIndices.push(indices[i]);
      }
    }
    return filteredDataIndices;
  }

  private _filterDownsampling(dataset: Dataset, indices: number[]) {
    if (indices.length === 0) {
      return [];
    }
    let data = dataset.data();
    let scaledXAccessor = BaseLinePlot._scaledAccessor(this.x());
    let scaledYAccessor = BaseLinePlot._scaledAccessor(this.y());
    let filteredIndices = [indices[0]];

    let indexOnCurrentSlope = (i: number, currentSlope: number) => {
      let p1x = scaledXAccessor(data[indices[i]], indices[i], dataset);
      let p1y = scaledYAccessor(data[indices[i]], indices[i], dataset);
      let p2x = scaledXAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      let p2y = scaledYAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      if (currentSlope === Infinity) {
        return Math.floor(p1x) === Math.floor(p2x);
      } else {
        let expectedP2y = p1y + (p2x - p1x) * currentSlope;
        return Math.floor(p2y) === Math.floor(expectedP2y);
      }
    };

    for (let i = 0; i < indices.length - 1;) {
      let indexFirst = indices[i];
      let p1x = scaledXAccessor(data[indices[i]], indices[i], dataset);
      let p1y = scaledYAccessor(data[indices[i]], indices[i], dataset);
      let p2x = scaledXAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      let p2y = scaledYAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      let currentSlope = (Math.floor(p1x) === Math.floor(p2x)) ? Infinity : (p2y - p1y) / (p2x - p1x);
      let indexMin = indices[i];
      let minScaledValue = (currentSlope === Infinity) ? p1y : p1x;
      let indexMax = indexMin;
      let maxScaledValue = minScaledValue;
      let firstIndexOnCurrentSlope = true;

      while (i < indices.length - 1 && (firstIndexOnCurrentSlope || indexOnCurrentSlope(i, currentSlope))) {
        i++;
        firstIndexOnCurrentSlope = false;
        let currScaledValue = currentSlope === Infinity ? scaledYAccessor(data[indices[i]], indices[i], dataset) :
          scaledXAccessor(data[indices[i]], indices[i], dataset);
        if (currScaledValue > maxScaledValue) {
          maxScaledValue = currScaledValue;
          indexMax = indices[i];
        }
        if (currScaledValue < minScaledValue) {
          minScaledValue = currScaledValue;
          indexMin = indices[i];
        }
      }

      let indexLast = indices[i];

      if (indexMin !== indexFirst) {
        filteredIndices.push(indexMin);
      }
      if (indexMax !== indexMin && indexMax !== indexFirst) {
        filteredIndices.push(indexMax);
      }
      if (indexLast !== indexFirst && indexLast !== indexMin && indexLast !== indexMax) {
        filteredIndices.push(indexLast);
      }
    }
    return filteredIndices;
  }

  private _getEdgeIntersectionPoints(): EdgeIntersections {
    if (!(this.y().scale instanceof QuantitativeScale && this.x().scale instanceof QuantitativeScale)) {
      return {
        left: [],
        right: [],
        top: [],
        bottom: [],
      };
    }

    let yScale = <QuantitativeScale<number>>this.y().scale;
    let xScale = <QuantitativeScale<any>>this.x().scale;

    let intersectionPoints: EdgeIntersections = {
      left: [],
      right: [],
      top: [],
      bottom: [],
    };
    let leftX = xScale.scale(xScale.domain()[0]);
    let rightX = xScale.scale(xScale.domain()[1]);
    let bottomY = yScale.scale(yScale.domain()[0]);
    let topY = yScale.scale(yScale.domain()[1]);

    this.datasets().forEach((dataset) => {
      let data = dataset.data();

      let x1: number, x2: number, y1: number, y2: number;
      let prevX: number, prevY: number, currX: number, currY: number;
      for (let i = 1; i < data.length; i++) {
        prevX = currX || xScale.scale(this.x().accessor(data[i - 1], i - 1, dataset));
        prevY = currY || yScale.scale(this.y().accessor(data[i - 1], i - 1, dataset));

        currX = xScale.scale(this.x().accessor(data[i], i, dataset));
        currY = yScale.scale(this.y().accessor(data[i], i, dataset));

        // If values crossed left edge
        if ((prevX < leftX) === (leftX <= currX)) {
          x1 = leftX - prevX;
          x2 = currX - prevX;
          y2 = currY - prevY;
          y1 = x1 * y2 / x2;

          intersectionPoints.left.push({
            x: leftX,
            y: yScale.invert(prevY + y1),
          });
        }

        // If values crossed right edge
        if ((prevX < rightX) === (rightX <= currX)) {
          x1 = rightX - prevX;
          x2 = currX - prevX;
          y2 = currY - prevY;
          y1 = x1 * y2 / x2;

          intersectionPoints.right.push({
            x: rightX,
            y: yScale.invert(prevY + y1),
          });
        }

        // If values crossed upper edge
        if ((prevY < topY) === (topY <= currY)) {
          x2 = currX - prevX;
          y1 = topY - prevY;
          y2 = currY - prevY;
          x1 = y1 * x2 / y2;

          intersectionPoints.top.push({
            x: xScale.invert(prevX + x1),
            y: topY,
          });
        }

        // If values crossed lower edge
        if ((prevY < bottomY) === (bottomY <= currY)) {
          x2 = currX - prevX;
          y1 = bottomY - prevY;
          y2 = currY - prevY;
          x1 = y1 * x2 / y2;

          intersectionPoints.bottom.push({
            x: xScale.invert(prevX + x1),
            y: bottomY,
          });
        }
      }
      ;
    });

    return intersectionPoints;
  }
}