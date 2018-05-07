/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as d3Shape from "d3-shape";

import * as Animators from "../animators";
import { Dataset } from "../core/dataset";
import { AttributeToProjector, IAccessor, IRangeProjector, Point, Projector } from "../core/interfaces";
import * as Drawers from "../drawers";
import { ProxyDrawer } from "../drawers/drawer";
import { LineSVGDrawer, makeLineCanvasDrawStep } from "../drawers/lineDrawer";
import * as Scales from "../scales";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import { makeEnum } from "../utils/makeEnum";
import * as Plots from "./";
import { IPlotEntity } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

type EdgeIntersections = {
  left: Point[],
  right: Point[],
  top: Point[],
  bottom: Point[],
};

interface ILineBucket {
  minY: number;
  maxY: number;
  minIndex: number;
  maxIndex: number;
  prevX: number;
  prevIndex: number;
}

const CURVE_NAME_MAPPING: { [P in CurveName]: d3.CurveFactory | d3.CurveFactoryLineOnly } = {
  linear: d3.curveLinear,
  linearClosed: d3.curveLinearClosed,
  step: d3.curveStep,
  stepBefore: d3.curveStepBefore,
  stepAfter: d3.curveStepAfter,
  basis: d3.curveBasis,
  basisOpen: d3.curveBasisOpen,
  basisClosed: d3.curveBasisClosed,
  bundle: d3.curveBundle,
  cardinal: d3.curveCardinal,
  cardinalOpen: d3.curveCardinalOpen,
  cardinalClosed: d3.curveCardinalClosed,
  monotone: d3.curveMonotoneX,
};

/**
 * Known curve types that line and area plot's .curve() methods understand
 */
export const CurveName = makeEnum([
  "linear",
  "linearClosed",
  "step",
  "stepBefore",
  "stepAfter",
  "basis",
  "basisOpen",
  "basisClosed",
  "bundle",
  "cardinal",
  "cardinalOpen",
  "cardinalClosed",
  "monotone",
]);
export type CurveName = keyof typeof CurveName;

export class Line<X> extends XYPlot<X, number> {
  private _curve: CurveName | d3.CurveFactory | d3.CurveFactoryLineOnly = "linear";

  private _autorangeSmooth = false;
  private _croppedRenderingEnabled = true;
  private _collapseDenseVerticalLinesEnabled = false;
  private _downsamplingEnabled = false;

  /**
   * A Line Plot draws line segments starting from the first data point to the next.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("line-plot");
    const animator = new Animators.Easing();
    animator.stepDuration(Plot._ANIMATION_MAX_DURATION);
    animator.easingMode("expInOut");
    animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
    this.animator(Plots.Animator.MAIN, animator);
    this.attr("stroke", new Scales.Color().range()[0]);
    this.attr("stroke-width", "2px");
  }

  public x(): Plots.ITransformableAccessorScaleBinding<X, number>;
  public x(x: number | IAccessor<number>): this;
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>, postScale?: IRangeProjector<number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>, postScale?: IRangeProjector<number>): any {
    if (x == null) {
      return super.x();
    } else {
      super.x(x as X | IAccessor<X>, xScale, postScale);
      this._setScaleSnapping();
      return this;
    }
  }

  public y(): Plots.ITransformableAccessorScaleBinding<number, number>;
  public y(y: number | IAccessor<number>): this;
  public y(y: number | IAccessor<number>, yScale: Scale<number, number>, postScale?: IRangeProjector<number>): this;
  public y(y?: number | IAccessor<number>, yScale?: Scale<number, number>, postScale?: IRangeProjector<number>): any {
    if (y == null) {
      return super.y();
    } else {
      super.y(y, yScale, postScale);
      this._setScaleSnapping();
      return this;
    }
  }

  public autorangeMode(): string;
  public autorangeMode(autorangeMode: string): this;
  public autorangeMode(autorangeMode?: string): any {
    if (autorangeMode == null) {
      return super.autorangeMode();
    }

    super.autorangeMode(autorangeMode);
    this._setScaleSnapping();
    return this;
  }

  /**
   * Gets whether or not the autoranging is done smoothly.
   */
  public autorangeSmooth(): boolean;
  /**
   * Sets whether or not the autorange is done smoothly.
   *
   * Smooth autoranging is done by making sure lines always exit on the left / right side of the plot
   * and deactivating the nice domain feature on the scales
   */
  public autorangeSmooth(autorangeSmooth: boolean): this;
  public autorangeSmooth(autorangeSmooth?: boolean): any {
    if (autorangeSmooth == null) {
      return this._autorangeSmooth;
    }
    this._autorangeSmooth = autorangeSmooth;
    this._setScaleSnapping();
    return this;
  }

  private _setScaleSnapping() {
    if (this.autorangeMode() === "x" && this.x() && this.x().scale && this.x().scale instanceof QuantitativeScale) {
      (<QuantitativeScale<X>>this.x().scale).snappingDomainEnabled(!this.autorangeSmooth());
    }

    if (this.autorangeMode() === "y" && this.y() && this.y().scale && this.y().scale instanceof QuantitativeScale) {
      (<QuantitativeScale<number>>this.y().scale).snappingDomainEnabled(!this.autorangeSmooth());
    }
  }

  /**
   * Gets the curve function associated with the plot.
   *
   * @return {string | d3.CurveFactory | d3.CurveFactoryLineOnly}
   */
  public curve(): CurveName | d3.CurveFactory | d3.CurveFactoryLineOnly;
  /**
   * Sets the curve function associated with the plot. The curve function specifies how to
   * draw the interpolated line between successive points.
   *
   * @param {string | points: Array<[number, number]>) => string} curve Curve function
   * @return Plots.Line
   */
  public curve(curve: CurveName | d3.CurveFactory | d3.CurveFactoryLineOnly): this;
  public curve(curve?: CurveName | d3.CurveFactory | d3.CurveFactoryLineOnly): any {
    if (curve == null) {
      return this._curve;
    }
    this._curve = curve;
    this.render();
    return this;
  }

  /**
   * Gets if downsampling is enabled
   *
   * When downsampling is enabled, two consecutive lines with the same slope will be merged to one line.
   */
  public downsamplingEnabled(): boolean;
  /**
   * Sets if downsampling is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  public downsamplingEnabled(downsampling: boolean): this;
  public downsamplingEnabled(downsampling?: boolean): any {
    if (downsampling == null) {
      return this._downsamplingEnabled;
    }
    this._downsamplingEnabled = downsampling;
    return this;
  }

  /**
   * Gets if croppedRendering is enabled
   *
   * When croppedRendering is enabled, lines that will not be visible in the viewport will not be drawn.
   */
  public croppedRenderingEnabled(): boolean;
  /**
   * Sets if croppedRendering is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  public croppedRenderingEnabled(croppedRendering: boolean): this;
  public croppedRenderingEnabled(croppedRendering?: boolean): any {
    if (croppedRendering == null) {
      return this._croppedRenderingEnabled;
    }
    this._croppedRenderingEnabled = croppedRendering;
    this.render();
    return this;
  }

  /**
   * Gets if collapseDenseLines is enabled
   *
   * When collapseDenseLines is enabled, vertical or nearly vertical line
   * segments that have the same floored x coordinate will be bucketed then
   * drawn, drastically reducing the render time of dense line plots like
   * timeseries. Only applies to the high performance "canvas" drawer.
   */
  public collapseDenseLinesEnabled(): boolean;
  /**
   * Sets if collapseDenseLines is enabled
   *
   * @returns {Plots.Line} The calling Plots.Line
   */
  public collapseDenseLinesEnabled(collapseDenseLines: boolean): this;
  public collapseDenseLinesEnabled(collapseDenseLines?: boolean): any {
    if (collapseDenseLines == null) {
      return this._collapseDenseVerticalLinesEnabled;
    }
    this._collapseDenseVerticalLinesEnabled = collapseDenseLines;
    this.render();
    return this;
  }

  protected _createDrawer(dataset: Dataset) {
    return new ProxyDrawer(
      () => new LineSVGDrawer(),
      (ctx) => new Drawers.CanvasDrawer(ctx, makeLineCanvasDrawStep(() => this._d3LineFactory(dataset))),
    );
  }

  protected getExtentsForProperty(property: string) {
    const extents = super.getExtentsForProperty(property);

    if (!this._autorangeSmooth) {
      return extents;
    }

    if (this.autorangeMode() !== property) {
      return extents;
    }

    if (this.autorangeMode() !== "x" && this.autorangeMode() !== "y") {
      return extents;
    }

    const edgeIntersectionPoints = this._getEdgeIntersectionPoints();
    let includedValues: number[];
    if (this.autorangeMode() === "y") {
      includedValues = edgeIntersectionPoints.left.concat(edgeIntersectionPoints.right).map((point) => point.y);
    } else { // === "x"
      includedValues = edgeIntersectionPoints.top.concat(edgeIntersectionPoints.bottom).map((point) => point.x);
    }

    return extents.map((extent: [number, number]) => d3.extent(d3.merge([extent, includedValues])));
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

    const yScale = <QuantitativeScale<number>>this.y().scale;
    const xScale = <QuantitativeScale<any>>this.x().scale;

    const intersectionPoints: EdgeIntersections = {
      left: [],
      right: [],
      top: [],
      bottom: [],
    };
    const leftX = xScale.scale(xScale.domain()[0]);
    const rightX = xScale.scale(xScale.domain()[1]);
    const bottomY = yScale.scale(yScale.domain()[0]);
    const topY = yScale.scale(yScale.domain()[1]);

    this.datasets().forEach((dataset) => {
      const data = dataset.data();

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
    });

    return intersectionPoints;
  }

  protected _getResetYFunction() {
    // gets the y-value generator for the animation start point
    const yDomain = this.y().scale.domain();
    const domainMax = Math.max(yDomain[0], yDomain[1]);
    const domainMin = Math.min(yDomain[0], yDomain[1]);
    // start from zero, or the closest domain value to zero
    // avoids lines zooming on from offscreen.
    const startValue = (domainMax < 0 && domainMax) || (domainMin > 0 && domainMin) || 0;
    const scaledStartValue = this.y().scale.scale(startValue);
    return (d: any, i: number, dataset: Dataset) => scaledStartValue;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    const drawSteps: Drawers.DrawStep[] = [];
    if (this._animateOnNextRender()) {
      const attrToProjector = this._getAttrToProjector();
      attrToProjector["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), this._getResetYFunction());
      drawSteps.push({ attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }

    drawSteps.push({
      attrToProjector: this._getAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN),
    });

    return drawSteps;
  }

  protected _generateAttrToProjector() {
    const attrToProjector = super._generateAttrToProjector();
    Object.keys(attrToProjector).forEach((attribute: string) => {
      if (attribute === "d") {
        return;
      }
      const projector = attrToProjector[attribute];
      attrToProjector[attribute] = (data: any[], i: number, dataset: Dataset) =>
        data.length > 0 ? projector(data[i], i, dataset) : null;
    });

    return attrToProjector;
  }

  public entitiesAt(point: Point): IPlotEntity[] {
    const entity = this.entityNearestByXThenY(point);
    if (entity != null) {
      return [entity];
    } else {
      return [];
    }
  }

  /**
   * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  public entityNearestByXThenY(queryPoint: Point): IPlotEntity {
    let minXDist = Infinity;
    let minYDist = Infinity;
    let closest: IPlotEntity;

    const chartBounds = this.bounds();
    this.entities().forEach((entity) => {
      if (!Utils.Math.within(entity.position, chartBounds)) {
        return;
      }
      const xDist = Math.abs(queryPoint.x - entity.position.x);
      const yDist = Math.abs(queryPoint.y - entity.position.y);

      if (xDist < minXDist || xDist === minXDist && yDist < minYDist) {
        closest = entity;
        minXDist = xDist;
        minYDist = yDist;
      }
    });

    return closest;
  }

  protected _propertyProjectors(): AttributeToProjector {
    const propertyToProjectors = super._propertyProjectors();
    propertyToProjectors["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), Plot._scaledAccessor(this.y()));
    return propertyToProjectors;
  }

  protected _constructLineProjector(xProjector: Projector, yProjector: Projector) {
    return (datum: any, index: number, dataset: Dataset) => {
      return this._d3LineFactory(dataset, xProjector, yProjector)(datum);
    };
  }

  /**
   * Return a d3.Line whose .x, .y, and .defined accessors are hooked up to the xProjector and yProjector
   * after they've been fed the dataset, and whose curve is configured to this plot's curve.
   * @param dataset
   * @param xProjector
   * @param yProjector
   * @returns {Line<[number,number]>}
   * @private
   */
  protected _d3LineFactory(
    dataset: Dataset,
    xProjector = Plot._scaledAccessor(this.x()),
    yProjector = Plot._scaledAccessor(this.y())): d3Shape.Line<any> {
    const definedProjector = (d: any, i: number, dataset: Dataset) => {
      const positionX = xProjector(d, i, dataset);
      const positionY = yProjector(d, i, dataset);
      return Utils.Math.isValidNumber(positionX) && Utils.Math.isValidNumber(positionY);
    };

    return d3.line()
      .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
      .y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
      .curve(this._getCurveFactory())
      .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset));
  };

  protected _getCurveFactory(): d3.CurveFactory | d3.CurveFactoryLineOnly {
    const curve = this.curve();
    if(typeof curve === "string") {
      const maybeCurveFunction = CURVE_NAME_MAPPING[curve];
      if (maybeCurveFunction == null) {
        // oops; name is wrong - default to linear instead
        return CURVE_NAME_MAPPING["linear"];
      } else {
        return maybeCurveFunction;
      }
    } else {
      return curve;
    }
  }

  /**
   * Line plots represent each dataset with a single <path> element, so we wrap the dataset data in a single element array.
   * @returns {Map<Dataset, any[]>}
   * @private
   */
  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw = new Utils.Map<Dataset, any[]>();

    this.datasets().forEach((dataset) => {
      const data = dataset.data();

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
      if (this._collapseDenseVerticalLinesEnabled) {
        filteredDataIndices = this._filterDenseLines(dataset, filteredDataIndices);
      }
      dataToDraw.set(dataset, [filteredDataIndices.map((d, i) => data[d])]);
    });

    return dataToDraw;
  }

  private _filterCroppedRendering(dataset: Dataset, indices: number[]) {
    const xProjector = Plot._scaledAccessor(this.x());
    const yProjector = Plot._scaledAccessor(this.y());

    const data = dataset.data();
    const filteredDataIndices: number[] = [];
    const pointInViewport = (x: number, y: number) => {
      return Utils.Math.inRange(x, 0, this.width()) &&
        Utils.Math.inRange(y, 0, this.height());
    };

    for (let i = 0; i < indices.length; i++) {
      const currXPoint = xProjector(data[indices[i]], indices[i], dataset);
      const currYPoint = yProjector(data[indices[i]], indices[i], dataset);
      let shouldShow = pointInViewport(currXPoint, currYPoint);

      if (!shouldShow && indices[i - 1] != null && data[indices[i - 1]] != null) {
        const prevXPoint = xProjector(data[indices[i - 1]], indices[i - 1], dataset);
        const prevYPoint = yProjector(data[indices[i - 1]], indices[i - 1], dataset);
        shouldShow = shouldShow || pointInViewport(prevXPoint, prevYPoint);
      }

      if (!shouldShow && indices[i + 1] != null && data[indices[i + 1]] != null) {
        const nextXPoint = xProjector(data[indices[i + 1]], indices[i + 1], dataset);
        const nextYPoint = yProjector(data[indices[i + 1]], indices[i + 1], dataset);
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
    const data = dataset.data();
    const scaledXAccessor = Plot._scaledAccessor(this.x());
    const scaledYAccessor = Plot._scaledAccessor(this.y());
    const filteredIndices = [indices[0]];

    const indexOnCurrentSlope = (i: number, currentSlope: number) => {
      const p1x = scaledXAccessor(data[indices[i]], indices[i], dataset);
      const p1y = scaledYAccessor(data[indices[i]], indices[i], dataset);
      const p2x = scaledXAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      const p2y = scaledYAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      if (currentSlope === Infinity) {
        return Math.floor(p1x) === Math.floor(p2x);
      } else {
        const expectedP2y = p1y + (p2x - p1x) * currentSlope;
        return Math.floor(p2y) === Math.floor(expectedP2y);
      }
    };

    for (let i = 0; i < indices.length - 1;) {
      const indexFirst = indices[i];
      const p1x = scaledXAccessor(data[indices[i]], indices[i], dataset);
      const p1y = scaledYAccessor(data[indices[i]], indices[i], dataset);
      const p2x = scaledXAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      const p2y = scaledYAccessor(data[indices[i + 1]], indices[i + 1], dataset);
      const currentSlope = (Math.floor(p1x) === Math.floor(p2x)) ? Infinity : (p2y - p1y) / (p2x - p1x);
      let indexMin = indices[i];
      let minScaledValue = (currentSlope === Infinity) ? p1y : p1x;
      let indexMax = indexMin;
      let maxScaledValue = minScaledValue;
      let firstIndexOnCurrentSlope = true;

      while (i < indices.length - 1 && (firstIndexOnCurrentSlope || indexOnCurrentSlope(i, currentSlope))) {
        i++;
        firstIndexOnCurrentSlope = false;
        const currScaledValue = currentSlope === Infinity ? scaledYAccessor(data[indices[i]], indices[i], dataset) :
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

      const indexLast = indices[i];

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

  /**
   * Collapse line geometry
   *
   * Assuming that there are many points that are drawn on the same coordinate,
   * we can save a lot of render time by just drawing one line from the min to
   * max y-coordinate of all those points.
   */
  private _filterDenseLines(dataset: Dataset, indices: number[]) {
    if (indices.length === 0) {
      return [];
    }

    const data = dataset.data();
    const scaledXAccessor = Plot._scaledAccessor(this.x());
    const scaledYAccessor = Plot._scaledAccessor(this.y());
    const xFn = (i: number) => scaledXAccessor(data[i], i, dataset);
    const yFn = (i: number) => scaledYAccessor(data[i], i, dataset);

    // TODO determine if we should collapse x or y or not collapse at all.
    // For now, we assume line charts are always a function of x
    return this._bucketByX(dataset, indices, xFn, yFn);
  }

  /**
   * Iterates over the line points collapsing points that fall on the same
   * floored x coordinate.
   *
   * Once all the points with the same x coordinate are detected, we draw a
   * single line from the min to max y coorindate.
   *
   * The "entrance" and "exit" lines to/from this collapsed vertical line are
   * also drawn. This allows lines with no collapsed segments to render
   * correctly.
   */
  private _bucketByX(
      dataset: Dataset,
      indices: number[],
      xFn: (i: number) => number,
      yFn: (i: number) => number,
  ) {
    const filteredIndices: number[] = [];
    const data = dataset.data();
    let bucket: Utils.Bucket = null;

    for (let ii = 0; ii <= indices.length; ++ii) {
      const i = indices[ii];
      if (data[i] == null) {
        continue;
      }

      const x = Math.floor(xFn(i));
      const y = yFn(i);

      if (bucket == null) {
        bucket = new Utils.Bucket(i, x, y);
      } else if (bucket.isInBucket(x)) {
        bucket.addToBucket(y, i);
      } else {
        filteredIndices.push(...bucket.getUniqueIndices());
        bucket = new Utils.Bucket(i, x, y);
      }
    }

    if (bucket != null) {
      filteredIndices.push(...bucket.getUniqueIndices());
    }

    return filteredIndices;
  }
}
