module Plottable {
export module Interactions {
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

      let constrainedPinchAmountUsingValueLimits = (scale: QuantitativeScale<any>, center: number) => {
        if (magnifyAmount <= 1) {
          return;
        }
        let minDomain = Math.min(scale.domain()[0], scale.domain()[1]);
        let maxDomain = Math.max(scale.domain()[1], scale.domain()[0]);
        let maxDomainValue = this.maxDomainValue(scale);
        if (maxDomainValue == null) {
          maxDomainValue = Infinity;
        }
        let minDomainValue = this.minDomainValue(scale);
        if (minDomainValue == null) {
          minDomainValue = -Infinity;
        }
        let centerDataValue = scale.invert(center);
        magnifyAmount = Math.min(magnifyAmount,
          (minDomainValue - centerDataValue) / (minDomain - centerDataValue),
          (maxDomainValue - centerDataValue) / (maxDomain - centerDataValue));
      };

      this.xScales().forEach((xScale) => {
        magnifyAmount = this._constrainedZoomAmountUsingExtent(xScale, magnifyAmount);
        constrainedPinchAmountUsingValueLimits(xScale, oldCenterPoint.x);
      });

      this.yScales().forEach((yScale) => {
        magnifyAmount = this._constrainedZoomAmountUsingExtent(yScale, magnifyAmount);
        constrainedPinchAmountUsingValueLimits(yScale, oldCenterPoint.y);
      });

      let constrainedPoints = oldPoints.map((oldPoint, i) => {
        return {
          x: normalizedPointDiffs[i].x * magnifyAmount + oldPoint.x,
          y: normalizedPointDiffs[i].y * magnifyAmount + oldPoint.y
        };
      });

      let translateAmountX = oldCenterPoint.x - ((constrainedPoints[0].x + constrainedPoints[1].x) / 2);
      this.xScales().forEach((xScale) => {
        this._magnifyScale(xScale, magnifyAmount, oldCenterPoint.x);
        this._translateScale(xScale, translateAmountX);
      });

      let translateAmountY = oldCenterPoint.y - ((constrainedPoints[0].y + constrainedPoints[1].y) / 2);
      this.yScales().forEach((yScale) => {
        this._magnifyScale(yScale, magnifyAmount, oldCenterPoint.y);
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
    }

    private _magnifyScale<D>(scale: QuantitativeScale<D>, magnifyAmount: number, centerValue: number) {
      let magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * magnifyAmount);
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

        this.xScales().forEach((xScale) => {
          zoomAmount = this._constrainedZoomAmountUsingExtent(xScale, zoomAmount);
          zoomAmount = this._constrainedZoomAmountUsingValueLimits(xScale, zoomAmount, translatedP.x);
        });

        this.yScales().forEach((yScale) => {
          zoomAmount = this._constrainedZoomAmountUsingExtent(yScale, zoomAmount);
          zoomAmount = this._constrainedZoomAmountUsingValueLimits(yScale, zoomAmount, translatedP.y);
        });

        this.xScales().forEach((xScale) => {
          this._magnifyScale(xScale, zoomAmount, translatedP.x);
        });
        this.yScales().forEach((yScale) => {
          this._magnifyScale(yScale, zoomAmount, translatedP.y);
        });
      }
    }

    private _constrainedZoomAmountUsingExtent(scale: QuantitativeScale<any>, zoomAmount: number) {
      let extentIncreasing = zoomAmount > 1;

      let boundingDomainExtent = extentIncreasing ? this.maxDomainExtent(scale) : this.minDomainExtent(scale);
      if (boundingDomainExtent == null) { return zoomAmount; }

      let scaleDomain = scale.domain();
      let domainExtent = Math.abs(scaleDomain[1] - scaleDomain[0]);
      let compareF = extentIncreasing ? Math.min : Math.max;
      return compareF(zoomAmount, boundingDomainExtent / domainExtent);
    }

    private _constrainedZoomAmountUsingValueLimits(scale: QuantitativeScale<any>, zoomAmount: number, zoomCenter: number) {
      if (zoomAmount <= 1) {
        return zoomAmount;
      }
      let zoomLimitForDomainValue = (domainLimit: any, domainValue: any) => {
        return domainLimit == null ? Infinity : (scale.scale(domainLimit) - zoomCenter) / (scale.scale(domainValue) - zoomCenter);
      };
      let minDomain = Math.min(scale.domain()[0], scale.domain()[1]);
      let maxDomain = Math.max(scale.domain()[0], scale.domain()[1]);
      let minDomainLimit = this.minDomainValue(scale);
      let maxDomainLimit = this.maxDomainValue(scale);
      let zoomLimitOnMin = zoomLimitForDomainValue(minDomainLimit, minDomain);
      let zoomLimitOnMax = zoomLimitForDomainValue(maxDomainLimit, maxDomain);
      return Math.min(zoomAmount, zoomLimitOnMin, zoomLimitOnMax);
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
          let domainIncreasing = xScale.domain()[1] > xScale.domain()[0];
          let positiveTranslate = translateAmountX > 0;
          let positiveDataTranslate = domainIncreasing === positiveTranslate;
          let limitingDomainValue = positiveDataTranslate ? this.maxDomainValue(xScale) : this.minDomainValue(xScale);
          if (limitingDomainValue == null) {
            return;
          }
          let relevantRangeValue = positiveTranslate ? xScale.range()[1] : xScale.range()[0];
          let limiter = positiveTranslate ? Math.min : Math.max;
          translateAmountX = limiter(translateAmountX, xScale.scale(limitingDomainValue) - relevantRangeValue);
        });

        this.xScales().forEach((xScale) => {
          this._translateScale(xScale, translateAmountX);
        });

        let translateAmountY = (lastDragPoint == null ? startPoint.y : lastDragPoint.y) - endPoint.y;

        this.yScales().forEach((yScale) => {
          let domainIncreasing = yScale.domain()[1] > yScale.domain()[0];
          let positiveTranslate = translateAmountY < 0;
          let positiveDataTranslate = domainIncreasing === positiveTranslate;
          let limitingDomainValue = positiveDataTranslate ? this.maxDomainValue(yScale) : this.minDomainValue(yScale);
          if (limitingDomainValue == null) {
            return;
          }
          let relevantRangeValue = positiveTranslate ? yScale.range()[1] : yScale.range()[0];
          let limiter = positiveTranslate ? Math.max : Math.min;
          translateAmountY = limiter(translateAmountY, yScale.scale(limitingDomainValue) - relevantRangeValue);
        });

        this.yScales().forEach((yScale) => {
          this._translateScale(yScale, translateAmountY);
        });
        lastDragPoint = endPoint;
      });
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
    public xScales(xScales: QuantitativeScale<any>[]): Interactions.PanZoom;
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
    public yScales(yScales: QuantitativeScale<any>[]): Interactions.PanZoom;
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
    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, minDomainExtent: D): Interactions.PanZoom;
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
    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, maxDomainExtent: D): Interactions.PanZoom;
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
     * Gets the minimum allowable domain value for the scale.
     *
     * Note that this will mainly work on scales that work linearly like Linear Scale and Time Scale.
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @returns {D} The minimum domain value for the scale.
     */
    public minDomainValue<D>(quantitativeScale: QuantitativeScale<D>): D;
    /**
     * Sets the minimum allowable domain value for the scale.
     *
     * Note that this will mainly work on scales that work linearly like Linear Scale and Time Scale.
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @param {D} minDomainValue The minimum domain value for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public minDomainValue<D>(quantitativeScale: QuantitativeScale<D>, minDomainValue: D): Interactions.PanZoom;
    public minDomainValue<D>(quantitativeScale: QuantitativeScale<D>, minDomainValue?: D): any {
      if (minDomainValue == null) {
        return this._minDomainValues.get(quantitativeScale);
      }
      const maxDomainValue = this.maxDomainValue(quantitativeScale);
      if (maxDomainValue != null && maxDomainValue.valueOf() < minDomainValue.valueOf()) {
        throw new Error("maxDomainValue must be larger than minDomainValue for the same Scale");
      }
      if (this._nonLinearScaleWithExtents(quantitativeScale)) {
        Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
      }
      this._minDomainValues.set(quantitativeScale, minDomainValue);
      return this;
    }

    /**
     * Gets the maximum allowable domain value for the scale.
     *
     * Note that this will mainly work on scales that work linearly like Linear Scale and Time Scale.
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @returns {D} The maximum domain value for the scale.
     */
    public maxDomainValue<D>(quantitativeScale: QuantitativeScale<D>): D;
    /**
     * Sets the maximum allowable domain value for the scale.
     *
     * Note that this will mainly work on scales that work linearly like Linear Scale and Time Scale.
     *
     * @param {QuantitativeScale<any>} quantitativeScale The scale to query
     * @param {D} maxDomainExtent The maximum domain value for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    public maxDomainValue<D>(quantitativeScale: QuantitativeScale<D>, maxDomainValue: D): Interactions.PanZoom;
    public maxDomainValue<D>(quantitativeScale: QuantitativeScale<D>, maxDomainValue?: D): any {
      if (maxDomainValue == null) {
        return this._maxDomainValues.get(quantitativeScale);
      }
      const minDomainValue = this.minDomainValue(quantitativeScale);
      if (minDomainValue != null && maxDomainValue.valueOf() < minDomainValue.valueOf()) {
        throw new Error("maxDomainValue must be larger than minDomainValue for the same Scale");
      }
      if (this._nonLinearScaleWithExtents(quantitativeScale)) {
        Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
      }
      this._maxDomainValues.set(quantitativeScale, maxDomainValue);
      return this;
    }
  }
}
}
