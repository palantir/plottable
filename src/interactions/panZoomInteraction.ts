namespace Plottable.Interactions {

  export type PanCallback = () => void;
  export type ZoomCallback = () => void;

  export class PanZoom extends Interaction {
    /**
     * The number of pixels occupied in a line.
     */
    private static _PIXELS_PER_LINE = 120;

    private _xScales: Utils.Set<QuantitativeScale<any>>;
    private _yScales: Utils.Set<QuantitativeScale<any>>;
    private _dragInteraction: Interactions.Drag;
    private _mouseDispatcher: Dispatchers.Mouse;
    private _touchDispatcher: Dispatchers.Touch;

    private _touchIds: d3.Map<Point>;

    private _wheelCallback = (p: Point, e: WheelEvent) => this._handleWheelEvent(p, e);
    private _touchStartCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchStart(ids, idToPoint, e);
    private _touchMoveCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handlePinch(ids, idToPoint, e);
    private _touchEndCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEnd(ids, idToPoint, e);
    private _touchCancelCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEnd(ids, idToPoint, e);

    private _minDomainExtents: Utils.Map<QuantitativeScale<any>, any>;
    private _maxDomainExtents: Utils.Map<QuantitativeScale<any>, any>;

    private _minDomainValues: Utils.Map<QuantitativeScale<any>, any>;
    private _maxDomainValues: Utils.Map<QuantitativeScale<any>, any>;

    private _panEndCallbacks = new Utils.CallbackSet<PanCallback>();
    private _zoomEndCallbacks = new Utils.CallbackSet<ZoomCallback>();

    /**
     * A PanZoom Interaction updates the domains of an x-scale and/or a y-scale
     * in response to the user panning or zooming.
     *
     * @constructor
     * @param {QuantitativeScale} [xScale] The x-scale to update on panning/zooming.
     * @param {QuantitativeScale} [yScale] The y-scale to update on panning/zooming.
     */
    constructor(xScale?: QuantitativeScale<any>, yScale?: QuantitativeScale<any>) {
      super();
      this._xScales = new Utils.Set<QuantitativeScale<any>>();
      this._yScales = new Utils.Set<QuantitativeScale<any>>();
      this._dragInteraction = new Interactions.Drag();
      this._setupDragInteraction();
      this._touchIds = d3.map<Point>();
      this._minDomainExtents = new Utils.Map<QuantitativeScale<any>, number>();
      this._maxDomainExtents = new Utils.Map<QuantitativeScale<any>, number>();
      this._minDomainValues = new Utils.Map<QuantitativeScale<any>, number>();
      this._maxDomainValues = new Utils.Map<QuantitativeScale<any>, number>();
      if (xScale != null) {
        this.addXScale(xScale);
      }
      if (yScale != null) {
        this.addYScale(yScale);
      }
    }

    protected _anchor(component: Component) {
      super._anchor(component);
      this._dragInteraction.attachTo(component);

      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> this._componentAttachedTo.content().node());
      this._mouseDispatcher.onWheel(this._wheelCallback);

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> this._componentAttachedTo.content().node());
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

      this._dragInteraction.detachFrom(this._componentAttachedTo);
    }

    private _handleTouchStart(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      for (let i = 0; i < ids.length && this._touchIds.size() < 2; i++) {
        let id = ids[i];
        this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
      }
    }

    private _handlePinch(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      if (this._touchIds.size() < 2) {
        return;
      }

      let oldPoints = this._touchIds.values();

      if (!this._isInsideComponent(this._translateToComponentSpace(oldPoints[0])) ||
         !this._isInsideComponent(this._translateToComponentSpace(oldPoints[1]))) {
        return;
      }

      let oldCornerDistance = PanZoom._pointDistance(oldPoints[0], oldPoints[1]);

      if (oldCornerDistance === 0) {
        return;
      }

      ids.forEach((id) => {
        if (this._touchIds.has(id.toString())) {
          this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
        }
      });

      let points = this._touchIds.values();
      let newCornerDistance = PanZoom._pointDistance(points[0], points[1]);

      if (newCornerDistance === 0) {
        return;
      }

      let magnifyAmount = oldCornerDistance / newCornerDistance;

      let normalizedPointDiffs = points.map((point, i) => {
        return { x: (point.x - oldPoints[i].x) / magnifyAmount, y: (point.y - oldPoints[i].y) / magnifyAmount };
      });

      let oldCenterPoint = PanZoom._centerPoint(oldPoints[0], oldPoints[1]);
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

      let constrainedPoints = oldPoints.map((oldPoint, i) => {
        return {
          x: normalizedPointDiffs[i].x * magnifyAmount + oldPoint.x,
          y: normalizedPointDiffs[i].y * magnifyAmount + oldPoint.y,
        };
      });

      let translateAmountX = centerX - ((constrainedPoints[0].x + constrainedPoints[1].x) / 2);
      this.xScales().forEach((xScale) => {
        this._magnifyScale(xScale, magnifyAmount, centerX);
        this._translateScale(xScale, translateAmountX);
      });

      let translateAmountY = centerY - ((constrainedPoints[0].y + constrainedPoints[1].y) / 2);
      this.yScales().forEach((yScale) => {
        this._magnifyScale(yScale, magnifyAmount, centerY);
        this._translateScale(yScale, translateAmountY);
      });
    }

    private static _centerPoint(point1: Point, point2: Point) {
      let leftX = Math.min(point1.x, point2.x);
      let rightX = Math.max(point1.x, point2.x);
      let topY = Math.min(point1.y, point2.y);
      let bottomY = Math.max(point1.y, point2.y);

      return {x: (leftX + rightX) / 2, y: (bottomY + topY) / 2};
    }

    private static _pointDistance(point1: Point, point2: Point) {
      let leftX = Math.min(point1.x, point2.x);
      let rightX = Math.max(point1.x, point2.x);
      let topY = Math.min(point1.y, point2.y);
      let bottomY = Math.max(point1.y, point2.y);

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

    private _magnifyScale<D>(scale: QuantitativeScale<D>, magnifyAmount: number, centerValue: number) {
      let magnifyTransform = (rangeValue: number) => scale.invert(this._zoomAt(rangeValue, magnifyAmount, centerValue));
      scale.domain(scale.range().map(magnifyTransform));
    }

    private _translateScale<D>(scale: QuantitativeScale<D>, translateAmount: number) {
      let translateTransform = (rangeValue: number) => scale.invert(rangeValue + translateAmount);
      scale.domain(scale.range().map(translateTransform));
    }

    private _handleWheelEvent(p: Point, e: WheelEvent) {
      let translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        e.preventDefault();

        let deltaPixelAmount = e.deltaY * (e.deltaMode ? PanZoom._PIXELS_PER_LINE : 1);
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

        this.xScales().forEach((xScale) => {
          this._magnifyScale(xScale, zoomAmount, centerX);
        });
        this.yScales().forEach((yScale) => {
          this._magnifyScale(yScale, zoomAmount, centerY);
        });

        this._zoomEndCallbacks.callCallbacks();
      }
    }

    private _constrainedZoom(scale: QuantitativeScale<number>, zoomAmount: number, centerPoint: number) {
      zoomAmount = this._constrainZoomExtents(scale, zoomAmount);
      return this._constrainZoomValues(scale, zoomAmount, centerPoint);
    }

    private _constrainZoomExtents(scale: QuantitativeScale<any>, zoomAmount: number) {
      let extentIncreasing = zoomAmount > 1;

      let boundingDomainExtent = extentIncreasing ? this.maxDomainExtent(scale) : this.minDomainExtent(scale);
      if (boundingDomainExtent == null) { return zoomAmount; }

      let scaleDomain = scale.domain();
      let domainExtent = Math.abs(scaleDomain[1] - scaleDomain[0]);
      let compareF = extentIncreasing ? Math.min : Math.max;
      return compareF(zoomAmount, boundingDomainExtent / domainExtent);
    }

    private _constrainZoomValues(scale: QuantitativeScale<number>, zoomAmount: number, centerPoint: number) {
      // when zooming in, we don't have to worry about overflowing domain
      if (zoomAmount <= 1) {
        return { centerPoint, zoomAmount };
      }

      const minDomain = this.minDomainValue(scale);
      const maxDomain = this.maxDomainValue(scale);

      // if no constraints set, we're done
      if (minDomain == null && maxDomain == null) {
        return { centerPoint, zoomAmount };
      }

      const scaleDomain = scale.domain();

      if (maxDomain != null) {
        // compute max range point if zoom applied
        const maxRange = scale.scale(maxDomain);
        const currentMaxRange = scale.scale(scaleDomain[1]);
        const testMaxRange = this._zoomAt(currentMaxRange, zoomAmount, centerPoint);

        // move the center point to prevent max overflow, if necessary
        if (testMaxRange > maxRange) {
          centerPoint = this._getZoomCenterForTarget(currentMaxRange, zoomAmount, maxRange);
        }
      }

      if (minDomain != null) {
        // compute min range point if zoom applied
        const minRange = scale.scale(minDomain);
        const currentMinRange = scale.scale(scaleDomain[0]);
        const testMinRange = this._zoomAt(currentMinRange, zoomAmount, centerPoint);

        // move the center point to prevent min overflow, if necessary
        if (testMinRange < minRange) {
          centerPoint = this._getZoomCenterForTarget(currentMinRange, zoomAmount, minRange);
        }
      }

      // add fallback to prevent overflowing both min and max
      if (maxDomain != null && maxDomain != null) {
        const maxRange = scale.scale(maxDomain);
        const currentMaxRange = scale.scale(scaleDomain[1]);
        const testMaxRange = this._zoomAt(currentMaxRange, zoomAmount, centerPoint);

        const minRange = scale.scale(minDomain);
        const currentMinRange = scale.scale(scaleDomain[0]);
        const testMinRange = this._zoomAt(currentMinRange, zoomAmount, centerPoint);

        // If we overflow both, use some algebra to solve for centerPoint and
        // zoomAmount that will make the domain match the min/max exactly.
        // Algebra brought to you by Wolfram Alpha.
        if (testMaxRange > maxRange || testMinRange < minRange) {
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
     * Performs a zoom transformation of the `value` argument scaled by the
     * `zoom` argument about the point defined by the `center` argument.
     */
    private _zoomAt(value: number, zoom: number, center: number) {
      return center - (center - value) * zoom;
    }

    /**
     * Returns the `center` value to be used with `_zoomAt` that will produce
     * the `target` value given the same `value` and `zoom` arguments. Algebra
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
        let translateAmountX = (lastDragPoint == null ? startPoint.x : lastDragPoint.x) - endPoint.x;

        this.xScales().forEach((xScale) => {
          this._translateScale(xScale, this._constrainedTranslation(xScale, translateAmountX));
        });

        let translateAmountY = (lastDragPoint == null ? startPoint.y : lastDragPoint.y) - endPoint.y;

        this.yScales().forEach((yScale) => {
          this._translateScale(yScale, this._constrainedTranslation(yScale, translateAmountY));
        });
        lastDragPoint = endPoint;
      });

      this._dragInteraction.onDragEnd(() => this._panEndCallbacks.callCallbacks());
    }

    /**
     * Returns a new translation value that respects domain min/max value
     * constraints.
     */
    private _constrainedTranslation(scale: QuantitativeScale<number>, translation: number) {
      const scaleDomain = scale.domain();
      if (translation > 0) {
        const bound = this.maxDomainValue(scale);
        if (bound != null) {
          const currentRange = scale.scale(scaleDomain[1]);
          const maxRange = scale.scale(bound);
          translation = Math.min(currentRange + translation, maxRange) - currentRange;
        }
      } else {
        const bound = this.minDomainValue(scale);
        if (bound != null) {
          const currentRange = scale.scale(scaleDomain[0]);
          const minRange = scale.scale(bound);
          translation = Math.max(currentRange + translation, minRange) - currentRange;
        }
      }
      return translation;
    }

    private _nonLinearScaleWithExtents(scale: QuantitativeScale<any>) {
      return this.minDomainExtent(scale) != null && this.maxDomainExtent(scale) != null &&
             !(scale instanceof Scales.Linear) && !(scale instanceof Scales.Time);
    }

    /**
     * Gets the x scales for this PanZoom Interaction.
     */
    public xScales(): QuantitativeScale<any>[];
    /**
     * Sets the x scales for this PanZoom Interaction.
     *
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public xScales(xScales: QuantitativeScale<any>[]): this;
    public xScales(xScales?: QuantitativeScale<any>[]): any {
      if (xScales == null) {
        let scales: QuantitativeScale<any>[] = [];
        this._xScales.forEach((xScale) => {
          scales.push(xScale);
        });
        return scales;
      }
      this._xScales = new Utils.Set<QuantitativeScale<any>>();
      xScales.forEach((xScale) => {
        this.addXScale(xScale);
      });
      return this;
    }

    /**
     * Gets the y scales for this PanZoom Interaction.
     */
    public yScales(): QuantitativeScale<any>[];
    /**
     * Sets the y scales for this PanZoom Interaction.
     *
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public yScales(yScales: QuantitativeScale<any>[]): this;
    public yScales(yScales?: QuantitativeScale<any>[]): any {
      if (yScales == null) {
        let scales: QuantitativeScale<any>[] = [];
        this._yScales.forEach((yScale) => {
          scales.push(yScale);
        });
        return scales;
      }
      this._yScales = new Utils.Set<QuantitativeScale<any>>();
      yScales.forEach((yScale) => {
        this.addYScale(yScale);
      });
      return this;
    }

    /**
     * Adds an x scale to this PanZoom Interaction
     *
     * @param {QuantitativeScale<any>} An x scale to add
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public addXScale(xScale: QuantitativeScale<any>) {
      this._xScales.add(xScale);
      return this;
    }

    /**
     * Removes an x scale from this PanZoom Interaction
     *
     * @param {QuantitativeScale<any>} An x scale to remove
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public removeXScale(xScale: QuantitativeScale<any>) {
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
     * @param {QuantitativeScale<any>} A y scale to add
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public addYScale(yScale: QuantitativeScale<any>) {
      this._yScales.add(yScale);
      return this;
    }

    /**
     * Removes a y scale from this PanZoom Interaction
     *
     * @param {QuantitativeScale<any>} A y scale to remove
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public removeYScale(yScale: QuantitativeScale<any>) {
      this._yScales.delete(yScale);
      this._minDomainExtents.delete(yScale);
      this._maxDomainExtents.delete(yScale);
      this._minDomainValues.delete(yScale);
      this._maxDomainValues.delete(yScale);
      return this;
    }

    /**
     * Gets the minimum domain extent for the scale, specifying the minimum allowable amount
     * between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @returns {D} The minimum domain extent for the scale.
     */
    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>): D;
    /**
     * Sets the minimum domain extent for the scale, specifying the minimum allowable amount
     * between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @param {D} minDomainExtent The minimum domain extent for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, minDomainExtent: D): this;
    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, minDomainExtent?: D): any {
      if (minDomainExtent == null) {
        return this._minDomainExtents.get(quantitativeScale);
      }
      if (minDomainExtent.valueOf() < 0) {
        throw new Error("extent must be non-negative");
      }
      let maxExtentForScale = this.maxDomainExtent(quantitativeScale);
      if (maxExtentForScale != null && maxExtentForScale.valueOf() < minDomainExtent.valueOf()) {
        throw new Error("minDomainExtent must be smaller than maxDomainExtent for the same Scale");
      }
      if (this._nonLinearScaleWithExtents(quantitativeScale)) {
        Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
      }
      this._minDomainExtents.set(quantitativeScale, minDomainExtent);
      return this;
    }

    /**
     * Gets the maximum domain extent for the scale, specifying the maximum allowable amount
     * between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @returns {D} The maximum domain extent for the scale.
     */
    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>): D;
    /**
     * Sets the maximum domain extent for the scale, specifying the maximum allowable amount
     * between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @param {D} minDomainExtent The maximum domain extent for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, maxDomainExtent: D): this;
    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, maxDomainExtent?: D): any {
      if (maxDomainExtent == null) {
        return this._maxDomainExtents.get(quantitativeScale);
      }
      if (maxDomainExtent.valueOf() <= 0) {
        throw new Error("extent must be positive");
      }
      let minExtentForScale = this.minDomainExtent(quantitativeScale);
      if (minExtentForScale != null && maxDomainExtent.valueOf() < minExtentForScale.valueOf()) {
        throw new Error("maxDomainExtent must be larger than minDomainExtent for the same Scale");
      }
      if (this._nonLinearScaleWithExtents(quantitativeScale)) {
        Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
      }
      this._maxDomainExtents.set(quantitativeScale, maxDomainExtent);
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
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @returns {D} The minimum domain extent for the scale.
     */
    public minDomainValue<D>(quantitativeScale: QuantitativeScale<D>): D;
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
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @param {D} minDomainExtent The minimum domain extent for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public minDomainValue<D>(quantitativeScale: QuantitativeScale<D>, minDomainValue: D): this;
    public minDomainValue<D>(quantitativeScale: QuantitativeScale<D>, minDomainValue?: D): any {
      if (minDomainValue == null) {
        return this._minDomainValues.get(quantitativeScale);
      }
      let maxValueForScale = this.maxDomainValue(quantitativeScale);
      if (maxValueForScale != null && maxValueForScale.valueOf() < minDomainValue.valueOf()) {
        throw new Error("minDomainValue must be smaller than maxDomainValue for the same Scale");
      }
      this._minDomainValues.set(quantitativeScale, minDomainValue);
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
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @returns {D} The maximum domain extent for the scale.
     */
    public maxDomainValue<D>(quantitativeScale: QuantitativeScale<D>): D;
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
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @param {D} maxDomainExtent The maximum domain extent for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public maxDomainValue<D>(quantitativeScale: QuantitativeScale<D>, maxDomainValue: D): this;
    public maxDomainValue<D>(quantitativeScale: QuantitativeScale<D>, maxDomainValue?: D): any {
      if (maxDomainValue == null) {
        return this._maxDomainValues.get(quantitativeScale);
      }
      let minValueForScale = this.minDomainValue(quantitativeScale);
      if (minValueForScale != null && maxDomainValue.valueOf() < minValueForScale.valueOf()) {
        throw new Error("maxDomainValue must be larger than minDomainValue for the same Scale");
      }
      this._maxDomainValues.set(quantitativeScale, maxDomainValue);
      return this;
    }

    /**
     * Uses the current domain of each scale to apply a minimum and maximum
     * domain value for that scale.
     *
     * This constrains the pan/zoom interaction to show no more than the domain
     * of the scale.
     */
    public constrainToScaleDomainValues() {
      this.xScales().forEach((scale) => {
        this._minDomainValues.delete(scale);
        this._maxDomainValues.delete(scale);
        const domain = scale.domain();
        this.minDomainValue(scale, domain[0]);
        this.maxDomainValue(scale, domain[1]);
      });

      this.yScales().forEach((scale) => {
        this._minDomainValues.delete(scale);
        this._maxDomainValues.delete(scale);
        const domain = scale.domain();
        this.minDomainValue(scale, domain[0]);
        this.maxDomainValue(scale, domain[1]);
      });
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
}
