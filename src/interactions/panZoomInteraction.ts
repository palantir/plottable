/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Component } from "../components/component";
import { Point } from "../core/interfaces";
import * as Dispatchers from "../dispatchers";
import * as Scales from "../scales";
import { TransformableScale } from "../scales/scale";
import * as Utils from "../utils";

import * as Interactions from "./";
import { Interaction } from "./interaction";

export type PanCallback = () => void;
export type ZoomCallback = () => void;

export type WheelFilter = (wheelEvent: WheelEvent) => boolean;

/**
 * Performs a zoom transformation of the `value` argument scaled by the
 * `zoom` argument about the point defined by the `center` argument.
 */
export function zoomAt(value: number, zoom: number, center: number) {
  return center - (center - value) * zoom;
}

export class PanZoom extends Interaction {
  /**
   * The number of pixels occupied in a line.
   */
  private static _PIXELS_PER_LINE = 120;

  private _xScales: Utils.Set<TransformableScale<any, number>>;
  private _yScales: Utils.Set<TransformableScale<any, number>>;
  private _dragInteraction: Interactions.Drag;
  private _mouseDispatcher: Dispatchers.Mouse;
  private _touchDispatcher: Dispatchers.Touch;
  private _wheelFilter: WheelFilter = (e: WheelEvent) => true;

  private _touchIds: d3.Map<Point>;

  private _wheelCallback = (p: Point, e: WheelEvent) => this._handleWheelEvent(p, e);
  private _touchStartCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchStart(ids, idToPoint, e);
  private _touchMoveCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handlePinch(ids, idToPoint, e);
  private _touchEndCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEnd(ids, idToPoint, e);
  private _touchCancelCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEnd(ids, idToPoint, e);

  private _minDomainExtents: Utils.Map<TransformableScale<any, number>, any>;
  private _maxDomainExtents: Utils.Map<TransformableScale<any, number>, any>;

  private _minDomainValues: Utils.Map<TransformableScale<any, number>, any>;
  private _maxDomainValues: Utils.Map<TransformableScale<any, number>, any>;

  private _panEndCallbacks = new Utils.CallbackSet<PanCallback>();
  private _zoomEndCallbacks = new Utils.CallbackSet<ZoomCallback>();

  /**
   * A PanZoom Interaction updates the domains of an x-scale and/or a y-scale
   * in response to the user panning or zooming.
   *
   * @constructor
   * @param {TransformableScale} [xScale] The x-scale to update on panning/zooming.
   * @param {TransformableScale} [yScale] The y-scale to update on panning/zooming.
   */
  constructor(xScale?: TransformableScale<any, number>, yScale?: TransformableScale<any, number>) {
    super();
    this._xScales = new Utils.Set<TransformableScale<any, number>>();
    this._yScales = new Utils.Set<TransformableScale<any, number>>();
    this._dragInteraction = new Interactions.Drag();
    this._setupDragInteraction();
    this._touchIds = d3.map<Point>();
    this._minDomainExtents = new Utils.Map<TransformableScale<any, number>, number>();
    this._maxDomainExtents = new Utils.Map<TransformableScale<any, number>, number>();
    this._minDomainValues = new Utils.Map<TransformableScale<any, number>, any>();
    this._maxDomainValues = new Utils.Map<TransformableScale<any, number>, any>();
    if (xScale != null) {
      this.addXScale(xScale);
    }
    if (yScale != null) {
      this.addYScale(yScale);
    }
  }

  /**
   * Get the backing drag interaction. Useful to customize the panzoom interaction.
   * @returns {Drag}
   */
  public dragInteraction(): Interactions.Drag {
    return this._dragInteraction;
  }

  /**
   * Get the current mouse wheel filter.
   * @returns {WheelFilter}
   */
  public wheelFilter(): WheelFilter;
  /** Set the current mouse wheel filter. PanZoomInteraction will only zoom
   * when the wheelFilter evaluates to true for the source wheel event. Use
   * this to define custom filters (e.g. requires shift to be held down.)
   */
  public wheelFilter(filter: WheelFilter): this;
  public wheelFilter(filter?: WheelFilter) {
    if (arguments.length === 0) {
      return this._wheelFilter;
    }
    this._wheelFilter = filter;
    return this;
  }

  /**
   * Pans the chart by a specified amount
   *
   * @param {Plottable.Point} [translateAmount] The amount by which to translate the x and y scales.
   */
  public pan(translateAmount: Point) {
    this.xScales().forEach((xScale) => {
      xScale.pan(this._constrainedTranslation(xScale, translateAmount.x));
    });

    this.yScales().forEach((yScale) => {
      yScale.pan(this._constrainedTranslation(yScale, translateAmount.y));
    });
  }

  /**
   * Zooms the chart by a specified amount around a specific point
   *
   * @param {number} [maginfyAmount] The percentage by which to zoom the x and y scale.
   * A value of 0.9 zooms in by 10%. A value of 1.1 zooms out by 10%. A value of 1 has
   * no effect.
   * @param {Plottable.Point} [centerValue] The center in pixels around which to zoom.
   * By default, `centerValue` is the center of the x and y range of each scale.
   */
  public zoom(zoomAmount: number, centerValue?: Point) {
    this.xScales().forEach((xScale) => {
      const range = xScale.range();
      const xCenter = centerValue === undefined
        ? (range[1] - range[0]) / 2
        : centerValue.x;

      xScale.zoom(zoomAmount, xCenter);
    });

    this.yScales().forEach((yScale) => {
      const range = yScale.range();
      const yCenter = centerValue === undefined
        ? (range[1] - range[0]) / 2
        : centerValue.y;

      yScale.zoom(zoomAmount, yCenter);
    });
  }

  protected _anchor(component: Component) {
    super._anchor(component);
    this._dragInteraction.attachTo(component);

    this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(this._componentAttachedTo);
    this._mouseDispatcher.onWheel(this._wheelCallback);

    this._touchDispatcher = Dispatchers.Touch.getDispatcher(this._componentAttachedTo);
    this._touchDispatcher.onTouchStart(this._touchStartCallback);
    this._touchDispatcher.onTouchMove(this._touchMoveCallback);
    this._touchDispatcher.onTouchEnd(this._touchEndCallback);
    this._touchDispatcher.onTouchCancel(this._touchCancelCallback);
  }

  protected _unanchor() {
    super._unanchor();
    this._mouseDispatcher.offWheel(this._wheelCallback);
    this._mouseDispatcher = null;

    this._touchDispatcher.offTouchStart(this._touchStartCallback);
    this._touchDispatcher.offTouchMove(this._touchMoveCallback);
    this._touchDispatcher.offTouchEnd(this._touchEndCallback);
    this._touchDispatcher.offTouchCancel(this._touchCancelCallback);
    this._touchDispatcher = null;

    this._dragInteraction.detach();
  }

  private _handleTouchStart(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
    for (let i = 0; i < ids.length && this._touchIds.size() < 2; i++) {
      const id = ids[i];
      this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
    }
  }

  private _handlePinch(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
    if (this._touchIds.size() < 2) {
      return;
    }

    const oldPoints = this._touchIds.values();

    if (!this._isInsideComponent(this._translateToComponentSpace(oldPoints[0])) || !this._isInsideComponent(this._translateToComponentSpace(oldPoints[1]))) {
      return;
    }

    const oldCornerDistance = PanZoom._pointDistance(oldPoints[0], oldPoints[1]);

    if (oldCornerDistance === 0) {
      return;
    }

    ids.forEach((id) => {
      if (this._touchIds.has(id.toString())) {
        this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
      }
    });

    const points = this._touchIds.values();
    const newCornerDistance = PanZoom._pointDistance(points[0], points[1]);

    if (newCornerDistance === 0) {
      return;
    }

    let magnifyAmount = oldCornerDistance / newCornerDistance;

    const normalizedPointDiffs = points.map((point, i) => {
      return { x: (point.x - oldPoints[i].x) / magnifyAmount, y: (point.y - oldPoints[i].y) / magnifyAmount };
    });

    const oldCenterPoint = PanZoom.centerPoint(oldPoints[0], oldPoints[1]);
    let centerX = oldCenterPoint.x;
    let centerY = oldCenterPoint.y;

    this.xScales().forEach((xScale) => {
      const constrained = this._constrainedZoom(xScale, magnifyAmount, centerX);
      centerX = constrained.centerPoint;
      magnifyAmount = constrained.zoomAmount;
    });

    this.yScales().forEach((yScale) => {
      const constrained = this._constrainedZoom(yScale, magnifyAmount, centerY);
      centerY = constrained.centerPoint;
      magnifyAmount = constrained.zoomAmount;
    });

    const constrainedPoints = oldPoints.map((oldPoint, i) => {
      return {
        x: normalizedPointDiffs[i].x * magnifyAmount + oldPoint.x,
        y: normalizedPointDiffs[i].y * magnifyAmount + oldPoint.y,
      };
    });

    const translateAmount = {
      x: centerX - ((constrainedPoints[0].x + constrainedPoints[1].x) / 2),
      y: centerY - ((constrainedPoints[0].y + constrainedPoints[1].y) / 2),
    };

    this.zoom(magnifyAmount, { x: centerX, y: centerY });
    this.pan(translateAmount);
  }

  public static centerPoint(point1: Point, point2: Point) {
    const leftX = Math.min(point1.x, point2.x);
    const rightX = Math.max(point1.x, point2.x);
    const topY = Math.min(point1.y, point2.y);
    const bottomY = Math.max(point1.y, point2.y);

    return { x: (leftX + rightX) / 2, y: (bottomY + topY) / 2 };
  }

  private static _pointDistance(point1: Point, point2: Point) {
    const leftX = Math.min(point1.x, point2.x);
    const rightX = Math.max(point1.x, point2.x);
    const topY = Math.min(point1.y, point2.y);
    const bottomY = Math.max(point1.y, point2.y);

    return Math.sqrt(Math.pow(rightX - leftX, 2) + Math.pow(bottomY - topY, 2));
  }

  private _handleTouchEnd(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
    ids.forEach((id) => {
      this._touchIds.remove(id.toString());
    });

    if (this._touchIds.size() > 0) {
      this._zoomEndCallbacks.callCallbacks();
    }
  }

  private _handleWheelEvent(p: Point, e: WheelEvent) {
    if (!this._wheelFilter(e)) {
      return;
    }
    const translatedP = this._translateToComponentSpace(p);
    if (this._isInsideComponent(translatedP)) {
      e.preventDefault();

      // in cases where only horizontal scroll is present, use that in lieu of nothing.
      const deltaAmount = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      const deltaPixelAmount = deltaAmount * (e.deltaMode ? PanZoom._PIXELS_PER_LINE : 1);
      let zoomAmount = Math.pow(2, deltaPixelAmount * .002);
      let centerX = translatedP.x;
      let centerY = translatedP.y;

      this.xScales().forEach((xScale) => {
        const constrained = this._constrainedZoom(xScale, zoomAmount, centerX);
        centerX = constrained.centerPoint;
        zoomAmount = constrained.zoomAmount;
      });

      this.yScales().forEach((yScale) => {
        const constrained = this._constrainedZoom(yScale, zoomAmount, centerY);
        centerY = constrained.centerPoint;
        zoomAmount = constrained.zoomAmount;
      });

      this.zoom(zoomAmount, { x: centerX, y: centerY });
      this._zoomEndCallbacks.callCallbacks();
    }
  }

  /**
   * When scale ranges are reversed (i.e. range[1] < range[0]), we must alter the
   * the calculations we do in screen space to constrain pan and zoom. This method
   * returns `true` if the scale is reversed.
   */
  private _isRangeReversed(scale: TransformableScale<any, number>): boolean {
    const range = scale.range();
    return range[1] < range[0];
  }

  private _constrainedZoom(scale: TransformableScale<any, number>, zoomAmount: number, centerPoint: number) {
    zoomAmount = this._constrainZoomExtents(scale, zoomAmount);
    return this._constrainZoomValues(scale, zoomAmount, centerPoint);
  }

  private _constrainZoomExtents(scale: TransformableScale<any, number>, zoomAmount: number) {
    const extentIncreasing = zoomAmount > 1;

    const boundingDomainExtent = extentIncreasing ? this.maxDomainExtent(scale) : this.minDomainExtent(scale);
    if (boundingDomainExtent == null) {
      return zoomAmount;
    }

    const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();
    const domainExtent = Math.abs(scaleDomainMax - scaleDomainMin);
    const compareF = extentIncreasing ? Math.min : Math.max;
    return compareF(zoomAmount, boundingDomainExtent / domainExtent);
  }

  private _constrainZoomValues(scale: TransformableScale<any, number>, zoomAmount: number, centerPoint: number) {
    // when zooming in, we don't have to worry about overflowing domain
    if (zoomAmount <= 1) {
      return { centerPoint, zoomAmount };
    }

    const reversed = this._isRangeReversed(scale);
    const minDomain = this.minDomainValue(scale);
    const maxDomain = this.maxDomainValue(scale);

    // if no constraints set, we're done
    if (minDomain == null && maxDomain == null) {
      return { centerPoint, zoomAmount };
    }

    const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();

    if (maxDomain != null) {
      // compute max range point if zoom applied
      const maxRange = scale.scaleTransformation(maxDomain);
      const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
      const testMaxRange = zoomAt(currentMaxRange, zoomAmount, centerPoint);

      // move the center point to prevent max overflow, if necessary
      if (testMaxRange > maxRange != reversed) {
        centerPoint = this._getZoomCenterForTarget(currentMaxRange, zoomAmount, maxRange);
      }
    }

    if (minDomain != null) {
      // compute min range point if zoom applied
      const minRange = scale.scaleTransformation(minDomain);
      const currentMinRange = scale.scaleTransformation(scaleDomainMin);
      const testMinRange = zoomAt(currentMinRange, zoomAmount, centerPoint);

      // move the center point to prevent min overflow, if necessary
      if (testMinRange < minRange != reversed) {
        centerPoint = this._getZoomCenterForTarget(currentMinRange, zoomAmount, minRange);
      }
    }

    // add fallback to prevent overflowing both min and max
    if (maxDomain != null && maxDomain != null) {
      const maxRange = scale.scaleTransformation(maxDomain);
      const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
      const testMaxRange = zoomAt(currentMaxRange, zoomAmount, centerPoint);

      const minRange = scale.scaleTransformation(minDomain);
      const currentMinRange = scale.scaleTransformation(scaleDomainMin);
      const testMinRange = zoomAt(currentMinRange, zoomAmount, centerPoint);

      // If we overflow both, use some algebra to solve for centerPoint and
      // zoomAmount that will make the domain match the min/max exactly.
      // Algebra brought to you by Wolfram Alpha.
      if (testMaxRange > maxRange != reversed || testMinRange < minRange != reversed) {
        const denominator = (currentMaxRange - currentMinRange + minRange - maxRange);
        if (denominator === 0) {
          // In this case the domains already match, so just return no-op values.
          centerPoint = (currentMaxRange + currentMinRange) / 2;
          zoomAmount = 1;
        } else {
          centerPoint = (currentMaxRange * minRange - currentMinRange * maxRange) / denominator;
          zoomAmount = (maxRange - minRange) / (currentMaxRange - currentMinRange);
        }
      }
    }

    return { centerPoint, zoomAmount };
  }

  /**
   * Returns the `center` value to be used with `zoomAt` that will produce the
   * `target` value given the same `value` and `zoom` arguments. Algebra
   * brought to you by Wolfram Alpha.
   */
  private _getZoomCenterForTarget(value: number, zoom: number, target: number) {
    return (value * zoom - target) / (zoom - 1);
  }

  private _setupDragInteraction() {
    this._dragInteraction.constrainedToComponent(false);

    let lastDragPoint: Point;
    this._dragInteraction.onDragStart(() => lastDragPoint = null);
    this._dragInteraction.onDrag((startPoint, endPoint) => {
      if (this._touchIds.size() >= 2) {
        return;
      }

      const translateAmount = {
        x: (lastDragPoint == null ? startPoint.x : lastDragPoint.x) - endPoint.x,
        y: (lastDragPoint == null ? startPoint.y : lastDragPoint.y) - endPoint.y,
      };
      this.pan(translateAmount);

      lastDragPoint = endPoint;
    });

    this._dragInteraction.onDragEnd(() => this._panEndCallbacks.callCallbacks());
  }

  /**
   * Returns a new translation value that respects domain min/max value
   * constraints.
   */
  private _constrainedTranslation(scale: TransformableScale<any, number>, translation: number) {
    const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();
    const reversed = this._isRangeReversed(scale);

    if (translation > 0 !== reversed) {
      const bound = this.maxDomainValue(scale);
      if (bound != null) {
        const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
        const maxRange = scale.scaleTransformation(bound);
        translation = (reversed ? Math.max : Math.min)(currentMaxRange + translation, maxRange) - currentMaxRange;
      }
    } else {
      const bound = this.minDomainValue(scale);
      if (bound != null) {
        const currentMinRange = scale.scaleTransformation(scaleDomainMin);
        const minRange = scale.scaleTransformation(bound);
        translation = (reversed ? Math.min : Math.max)(currentMinRange + translation, minRange) - currentMinRange;
      }
    }

    return translation;
  }

  private _nonLinearScaleWithExtents(scale: TransformableScale<any, number>) {
    return this.minDomainExtent(scale) != null && this.maxDomainExtent(scale) != null && !(scale instanceof Scales.Linear) && !(scale instanceof Scales.Time);
  }

  /**
   * Gets the x scales for this PanZoom Interaction.
   */
  public xScales(): TransformableScale<any, number>[];
  /**
   * Sets the x scales for this PanZoom Interaction.
   *
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public xScales(xScales: TransformableScale<any, number>[]): this;
  public xScales(xScales?: TransformableScale<any, number>[]): any {
    if (xScales == null) {
      const scales: TransformableScale<any, number>[] = [];
      this._xScales.forEach((xScale) => {
        scales.push(xScale);
      });
      return scales;
    }
    this._xScales = new Utils.Set<TransformableScale<any, number>>();
    xScales.forEach((xScale) => {
      this.addXScale(xScale);
    });
    return this;
  }

  /**
   * Gets the y scales for this PanZoom Interaction.
   */
  public yScales(): TransformableScale<any, number>[];
  /**
   * Sets the y scales for this PanZoom Interaction.
   *
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public yScales(yScales: TransformableScale<any, number>[]): this;
  public yScales(yScales?: TransformableScale<any, number>[]): any {
    if (yScales == null) {
      const scales: TransformableScale<any, number>[] = [];
      this._yScales.forEach((yScale) => {
        scales.push(yScale);
      });
      return scales;
    }
    this._yScales = new Utils.Set<TransformableScale<any, number>>();
    yScales.forEach((yScale) => {
      this.addYScale(yScale);
    });
    return this;
  }

  /**
   * Adds an x scale to this PanZoom Interaction
   *
   * @param {TransformableScale} An x scale to add
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public addXScale(xScale: TransformableScale<any, number>) {
    this._xScales.add(xScale);
    return this;
  }

  /**
   * Removes an x scale from this PanZoom Interaction
   *
   * @param {TransformableScale} An x scale to remove
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public removeXScale(xScale: TransformableScale<any, number>) {
    this._xScales.delete(xScale);
    this._minDomainExtents.delete(xScale);
    this._maxDomainExtents.delete(xScale);
    this._minDomainValues.delete(xScale);
    this._maxDomainValues.delete(xScale);
    return this;
  }

  /**
   * Adds a y scale to this PanZoom Interaction
   *
   * @param {TransformableScale} A y scale to add
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public addYScale(yScale: TransformableScale<any, number>) {
    this._yScales.add(yScale);
    return this;
  }

  /**
   * Removes a y scale from this PanZoom Interaction
   *
   * @param {TransformableScale} A y scale to remove
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public removeYScale(yScale: TransformableScale<any, number>) {
    this._yScales.delete(yScale);
    this._minDomainExtents.delete(yScale);
    this._maxDomainExtents.delete(yScale);
    this._minDomainValues.delete(yScale);
    this._maxDomainValues.delete(yScale);
    return this;
  }

  /**
   * Gets the minimum domain extent for the scale, specifying the minimum
   * allowable amount between the ends of the domain.
   *
   * Note that extents will mainly work on scales that work linearly like
   * Linear Scale and Time Scale
   *
   * @param {TransformableScale} scale The scale to query
   * @returns {number} The minimum numerical domain extent for the scale.
   */
  public minDomainExtent(scale: TransformableScale<any, number>): number;
  /**
   * Sets the minimum domain extent for the scale, specifying the minimum
   * allowable amount between the ends of the domain.
   *
   * Note that extents will mainly work on scales that work linearly like
   * Linear Scale and Time Scale
   *
   * @param {TransformableScale} scale The scale to query
   * @param {number} minDomainExtent The minimum numerical domain extent for
   * the scale.
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public minDomainExtent(scale: TransformableScale<any, number>, minDomainExtent: number): this;
  public minDomainExtent(scale: TransformableScale<any, number>, minDomainExtent?: number): number | this {
    if (minDomainExtent == null) {
      return this._minDomainExtents.get(scale);
    }
    if (minDomainExtent.valueOf() < 0) {
      throw new Error("extent must be non-negative");
    }
    const maxExtentForScale = this.maxDomainExtent(scale);
    if (maxExtentForScale != null && maxExtentForScale.valueOf() < minDomainExtent.valueOf()) {
      throw new Error("minDomainExtent must be smaller than maxDomainExtent for the same Scale");
    }
    if (this._nonLinearScaleWithExtents(scale)) {
      Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
    }
    this._minDomainExtents.set(scale, minDomainExtent);
    return this;
  }

  /**
   * Gets the maximum domain extent for the scale, specifying the maximum
   * allowable amount between the ends of the domain.
   *
   * Note that extents will mainly work on scales that work linearly like
   * Linear Scale and Time Scale
   *
   * @param {TransformableScale} scale The scale to query
   * @returns {number} The maximum numerical domain extent for the scale.
   */
  public maxDomainExtent(scale: TransformableScale<any, number>): number;
  /**
   * Sets the maximum domain extent for the scale, specifying the maximum
   * allowable amount between the ends of the domain.
   *
   * For example, if the scale's transformation domain is `[500, 600]` and the
   * `maxDomainExtent` is set to `50`, then the user will only be able to zoom
   * out to see an interval like `[500, 550]` or `[520, 570]`.
   *
   * Note that extents will mainly work on scales that work linearly like
   * Linear Scale and Time Scale
   *
   * @param {TransformableScale} scale The scale to query
   * @param {number} minDomainExtent The maximum numerical domain extent for
   * the scale.
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public maxDomainExtent(scale: TransformableScale<any, number>, maxDomainExtent: number): this;
  public maxDomainExtent(scale: TransformableScale<any, number>, maxDomainExtent?: number): number | this {
    if (maxDomainExtent == null) {
      return this._maxDomainExtents.get(scale);
    }
    if (maxDomainExtent.valueOf() <= 0) {
      throw new Error("extent must be positive");
    }
    const minExtentForScale = this.minDomainExtent(scale);
    if (minExtentForScale != null && maxDomainExtent.valueOf() < minExtentForScale.valueOf()) {
      throw new Error("maxDomainExtent must be larger than minDomainExtent for the same Scale");
    }
    if (this._nonLinearScaleWithExtents(scale)) {
      Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
    }
    this._maxDomainExtents.set(scale, maxDomainExtent);
    return this;
  }

  /**
   * Gets the minimum domain value for the scale, constraining the pan/zoom
   * interaction to a minimum value in the domain.
   *
   * Note that this differs from minDomainExtent/maxDomainExtent, in that
   * those methods provide constraints such as showing at least 2 but no more
   * than 5 values at a time.
   *
   * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
   * the user cannot pan/zoom.
   *
   * @param {TransformableScale} scale The scale to query
   * @returns {number} The minimum domain value for the scale.
   */
  public minDomainValue(scale: TransformableScale<any, number>): number;
  /**
   * Sets the minimum domain value for the scale, constraining the pan/zoom
   * interaction to a minimum value in the domain.
   *
   * Note that this differs from minDomainExtent/maxDomainExtent, in that
   * those methods provide constraints such as showing at least 2 but no more
   * than 5 values at a time.
   *
   * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
   * the user cannot pan/zoom.
   *
   * @param {TransformableScale} scale The scale to query
   * @param {number} minDomainExtent The minimum domain value for the scale.
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public minDomainValue(scale: TransformableScale<any, number>, minDomainValue: number): this;
  public minDomainValue(scale: TransformableScale<any, number>, minDomainValue?: number): number | this {
    if (minDomainValue == null) {
      return this._minDomainValues.get(scale);
    }
    this._minDomainValues.set(scale, minDomainValue);
    return this;
  }

  /**
   * Gets the maximum domain value for the scale, constraining the pan/zoom
   * interaction to a maximum value in the domain.
   *
   * Note that this differs from minDomainExtent/maxDomainExtent, in that
   * those methods provide constraints such as showing at least 2 but no more
   * than 5 values at a time.
   *
   * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
   * the user cannot pan/zoom.
   *
   * @param {TransformableScale} scale The scale to query
   * @returns {number} The maximum domain value for the scale.
   */
  public maxDomainValue(scale: TransformableScale<any, number>): number;
  /**
   * Sets the maximum domain value for the scale, constraining the pan/zoom
   * interaction to a maximum value in the domain.
   *
   * Note that this differs from minDomainExtent/maxDomainExtent, in that
   * those methods provide constraints such as showing at least 2 but no more
   * than 5 values at a time.
   *
   * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
   * the user cannot pan/zoom.
   *
   * @param {TransformableScale} scale The scale to query
   * @param {number} maxDomainExtent The maximum domain value for the scale.
   * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
   */
  public maxDomainValue(scale: TransformableScale<any, number>, maxDomainValue: number): this;
  public maxDomainValue(scale: TransformableScale<any, number>, maxDomainValue?: number): number | this {
    if (maxDomainValue == null) {
      return this._maxDomainValues.get(scale);
    }
    this._maxDomainValues.set(scale, maxDomainValue);
    return this;
  }

  /**
   * Uses the current domain of the scale to apply a minimum and maximum
   * domain value for that scale.
   *
   * This constrains the pan/zoom interaction to show no more than the domain
   * of the scale.
   */
  public setMinMaxDomainValuesTo(scale: TransformableScale<any, number>) {
    this._minDomainValues.delete(scale);
    this._maxDomainValues.delete(scale);
    const [ domainMin, domainMax ] = scale.getTransformationDomain();
    this.minDomainValue(scale, domainMin);
    this.maxDomainValue(scale, domainMax);
    return this;
  }

  /**
   * Adds a callback to be called when panning ends.
   *
   * @param {PanCallback} callback
   * @returns {this} The calling PanZoom Interaction.
   */
  public onPanEnd(callback: PanCallback) {
    this._panEndCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when panning ends.
   *
   * @param {PanCallback} callback
   * @returns {this} The calling PanZoom Interaction.
   */
  public offPanEnd(callback: PanCallback) {
    this._panEndCallbacks.delete(callback);
    return this;
  }

  /**
   * Adds a callback to be called when zooming ends.
   *
   * @param {ZoomCallback} callback
   * @returns {this} The calling PanZoom Interaction.
   */
  public onZoomEnd(callback: ZoomCallback) {
    this._zoomEndCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when zooming ends.
   *
   * @param {ZoomCallback} callback
   * @returns {this} The calling PanZoom Interaction.
   */
  public offZoomEnd(callback: ZoomCallback) {
    this._zoomEndCallbacks.delete(callback);
    return this;
  }
}
