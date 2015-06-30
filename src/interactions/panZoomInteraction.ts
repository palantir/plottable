///<reference path="../reference.ts" />

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
      for (var i = 0; i < ids.length && this._touchIds.size() < 2; i++) {
        var id = ids[i];
        this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
      }
    }

    private _handlePinch(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      if (this._touchIds.size() < 2) {
        return;
      }

      var oldCenterPoint = this._centerPoint();
      var oldCornerDistance = this._cornerDistance();

      ids.forEach((id) => {
        if (this._touchIds.has(id.toString())) {
          this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
        }
      });

      var newCenterPoint = this._centerPoint();
      var newCornerDistance = this._cornerDistance();

      if (newCornerDistance !== 0 && oldCornerDistance !== 0) {
        this.xScales().forEach((xScale) => {
          this._magnifyScale(xScale, oldCornerDistance / newCornerDistance, oldCenterPoint.x);
          this._translateScale(xScale, oldCenterPoint.x - newCenterPoint.x);
        });

        this.yScales().forEach((yScale) => {
          this._magnifyScale(yScale, oldCornerDistance / newCornerDistance, oldCenterPoint.y);
          this._translateScale(yScale, oldCenterPoint.y - newCenterPoint.y);
        });
      }
    }

    private _centerPoint() {
      var points = this._touchIds.values();
      var firstTouchPoint = points[0];
      var secondTouchPoint = points[1];

      var leftX = Math.min(firstTouchPoint.x, secondTouchPoint.x);
      var rightX = Math.max(firstTouchPoint.x, secondTouchPoint.x);
      var topY = Math.min(firstTouchPoint.y, secondTouchPoint.y);
      var bottomY = Math.max(firstTouchPoint.y, secondTouchPoint.y);

      return {x: (leftX + rightX) / 2, y: (bottomY + topY) / 2};
    }

    private _cornerDistance() {
      var points = this._touchIds.values();
      var firstTouchPoint = points[0];
      var secondTouchPoint = points[1];

      var leftX = Math.min(firstTouchPoint.x, secondTouchPoint.x);
      var rightX = Math.max(firstTouchPoint.x, secondTouchPoint.x);
      var topY = Math.min(firstTouchPoint.y, secondTouchPoint.y);
      var bottomY = Math.max(firstTouchPoint.y, secondTouchPoint.y);

      return Math.sqrt(Math.pow(rightX - leftX, 2) + Math.pow(bottomY - topY, 2));
    }

    private _handleTouchEnd(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      ids.forEach((id) => {
        this._touchIds.remove(id.toString());
      });
    }

    private _magnifyScale<D>(scale: QuantitativeScale<D>, magnifyAmount: number, centerValue: number) {
      var magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * magnifyAmount);
      scale.domain(scale.range().map(magnifyTransform));
    }

    private _translateScale<D>(scale: QuantitativeScale<D>, translateAmount: number) {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue + translateAmount);
      scale.domain(scale.range().map(translateTransform));
    }

    private _handleWheelEvent(p: Point, e: WheelEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        e.preventDefault();

        var deltaPixelAmount = e.deltaY * (e.deltaMode ? PanZoom._PIXELS_PER_LINE : 1);
        var zoomAmount = Math.pow(2, deltaPixelAmount * .002);

        this.xScales().forEach((xScale) => {
          zoomAmount = this._constrainedZoomAmount(xScale, translatedP.x, zoomAmount);
        });

        this.yScales().forEach((yScale) => {
          zoomAmount = this._constrainedZoomAmount(yScale, translatedP.y, zoomAmount);
        });

        this.xScales().forEach((xScale) => {
          this._magnifyScale(xScale, zoomAmount, translatedP.x);
        });
        this.yScales().forEach((yScale) => {
          this._magnifyScale(yScale, zoomAmount, translatedP.y);
        });
      }
    }

    private _constrainedZoomAmount(scale: QuantitativeScale<any>, centerValue: number, zoomAmount: number) {
      var extentIncreasing = zoomAmount > 1;

      var boundingDomainExtent = extentIncreasing ? this.maxDomainExtent(scale) : this.minDomainExtent(scale);
      if (boundingDomainExtent == null) { return zoomAmount; }

      if (scale instanceof Scales.Linear || scale instanceof Scales.Time) {
        var scaleDomain = (<any> scale).domain();
        var domainExtent = Math.abs(scaleDomain[1] - scaleDomain[0]);
        var compareF = extentIncreasing ? Math.min : Math.max;
        return compareF(zoomAmount, boundingDomainExtent / domainExtent);
      }

      var constrainedZoomAmount = 1;
      var lowerBound = extentIncreasing ? constrainedZoomAmount : 0;
      var upperBound = extentIncreasing ? Infinity : constrainedZoomAmount;
      var iterations = 20;
      var magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * constrainedZoomAmount);
      var scaleRange = scale.range();
      for (var i = 0; i < iterations; i++) {
        var transformedDomain = scaleRange.map(magnifyTransform);
        var transformedDomainExtent = Math.abs(transformedDomain[1] - transformedDomain[0]);
        if (transformedDomainExtent === boundingDomainExtent) { return constrainedZoomAmount; }

        if (extentIncreasing === transformedDomainExtent < boundingDomainExtent) {
          lowerBound = constrainedZoomAmount;
          constrainedZoomAmount = upperBound === Infinity ? constrainedZoomAmount * 2 : (upperBound + constrainedZoomAmount) / 2;
        } else {
          upperBound = constrainedZoomAmount;
          constrainedZoomAmount = (lowerBound + constrainedZoomAmount) / 2;
        }
      }
      return (extentIncreasing ? Math.min : Math.max)(zoomAmount, constrainedZoomAmount);
    }

    private _setupDragInteraction() {
      this._dragInteraction.constrainedToComponent(false);

      var lastDragPoint: Point;
      this._dragInteraction.onDragStart(() => lastDragPoint = null);
      this._dragInteraction.onDrag((startPoint, endPoint) => {
        if (this._touchIds.size() >= 2) {
          return;
        }
        var translateAmountX = (lastDragPoint == null ? startPoint.x : lastDragPoint.x) - endPoint.x;

        this.xScales().forEach((xScale) => {
          translateAmountX = this._constrainedPanAmount(xScale, translateAmountX, translateAmountX > 0);
        });

        this.xScales().forEach((xScale) => {
          this._translateScale(xScale, translateAmountX);
        });

        var translateAmountY = (lastDragPoint == null ? startPoint.y : lastDragPoint.y) - endPoint.y;

        this.yScales().forEach((yScale) => {
          translateAmountY = this._constrainedPanAmount(yScale, translateAmountY, translateAmountY > 0);
        });

        this.yScales().forEach((yScale) => {
          this._translateScale(yScale, translateAmountY);
        });
        lastDragPoint = endPoint;
      });
    }

    private _constrainedPanAmount(scale: QuantitativeScale<any>, panAmount: number, positiveTranslate: boolean) {
      if (scale instanceof Scales.ModifiedLog) {
        var minDomainExtent = this.minDomainExtent(scale) || 0;
        var maxDomainExtent = this.maxDomainExtent(scale) || Infinity;
        var constrainTranslate = positiveTranslate ? 1 : -1;
        var lowerBound = positiveTranslate ? 0 : -Infinity;
        var upperBound = positiveTranslate ? Infinity : 0;
        var iterations = 20;
        var translateTransform = (rangeValue: number) => scale.invert(rangeValue + constrainTranslate);
        for (var i = 0; i < iterations; i++) {
          var constrainedDomain = scale.range().map(translateTransform);
          var constrainedDomainExtent = Math.abs(constrainedDomain[1] - constrainedDomain[0]);
          var insideExtent = constrainedDomainExtent >= minDomainExtent && constrainedDomainExtent <= maxDomainExtent;
          if (positiveTranslate === insideExtent) {
            lowerBound = constrainTranslate;
            constrainTranslate = upperBound === Infinity ? constrainTranslate * 2 : (constrainTranslate + upperBound) / 2;
          } else {
            upperBound = constrainTranslate;
            constrainTranslate = lowerBound === -Infinity ? constrainTranslate * 2 : (constrainTranslate + lowerBound) / 2;
          }
        }
        return (positiveTranslate ? Math.min : Math.max)(panAmount, constrainTranslate);
      }

      return panAmount;
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
        var scales: QuantitativeScale<any>[] = [];
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
        var scales: QuantitativeScale<any>[] = [];
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
      return this;
    }

    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>): D;
    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, minDomainExtent: D): Interactions.PanZoom;
    public minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, minDomainExtent?: D): any {
      if (minDomainExtent == null) {
        return this._minDomainExtents.get(quantitativeScale);
      }
      this._minDomainExtents.set(quantitativeScale, minDomainExtent);
      return this;
    }

    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>): D;
    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, maxDomainExtent: D): Interactions.PanZoom;
    public maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, maxDomainExtent?: D): any {
      if (maxDomainExtent == null) {
        return this._maxDomainExtents.get(quantitativeScale);
      }
      this._maxDomainExtents.set(quantitativeScale, maxDomainExtent);
      return this;
    }
  }
}
}
