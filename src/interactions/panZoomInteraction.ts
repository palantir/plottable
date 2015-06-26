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
      }
      if (newCornerDistance !== 0 && oldCornerDistance !== 0) {
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

        var extentIncreasing = zoomAmount > 1;

        this.xScales().forEach((xScale) => {
          var constrainZoomAmount = 1;
          var lowerBound = extentIncreasing ? constrainZoomAmount : 0;
          var upperBound = extentIncreasing ? Infinity : constrainZoomAmount;
          var iterations = 5;
          var magnifyTransform = (rangeValue: number) => xScale.invert(translatedP.x - (translatedP.x - rangeValue) * constrainZoomAmount);
          for (var i = 0; i < iterations; i++) {
            var transformedDomain = xScale.range().map(magnifyTransform);
            var transformedDomainExtent = Math.abs(transformedDomain[1] - transformedDomain[0]);
            if (extentIncreasing) {
              var maxDomainExtent = this.maxDomainExtent(xScale);
              if (maxDomainExtent == null) { return; }
              if (transformedDomainExtent <= maxDomainExtent) {
                lowerBound = constrainZoomAmount;
                constrainZoomAmount = upperBound === Infinity ? constrainZoomAmount * 2 : (upperBound + constrainZoomAmount) / 2;
              } else {
                upperBound = constrainZoomAmount;
                constrainZoomAmount = (lowerBound + constrainZoomAmount) / 2;
              }
            } else {
              var minDomainExtent = this.minDomainExtent(xScale);
              if (minDomainExtent == null) { return; }
              if (transformedDomainExtent >= minDomainExtent) {
                upperBound = constrainZoomAmount;
                constrainZoomAmount = (lowerBound + constrainZoomAmount) / 2;
              } else {
                lowerBound = constrainZoomAmount;
                constrainZoomAmount = (upperBound + constrainZoomAmount) / 2;
              }
            }
          }
          zoomAmount = (extentIncreasing ? Math.min : Math.max)(zoomAmount, constrainZoomAmount);
        });

        this.yScales().forEach((yScale) => {
          var constrainZoom = 1;
          var lowerBound = extentIncreasing ? constrainZoom : 0;
          var upperBound = extentIncreasing ? Infinity : constrainZoom;
          var iterations = 5;
          var magnifyTransform = (rangeValue: number) => yScale.invert(translatedP.y - (translatedP.y - rangeValue) * constrainZoom);
          for (var i = 0; i < iterations; i++) {
            var transformedDomain = yScale.range().map(magnifyTransform);
            var transformedDomainExtent = Math.abs(transformedDomain[1] - transformedDomain[0]);
            if (extentIncreasing) {
              var maxDomainExtent = this.maxDomainExtent(yScale);
              if (maxDomainExtent == null) { return; }
              if (transformedDomainExtent <= maxDomainExtent) {
                lowerBound = constrainZoom;
                constrainZoom = upperBound === Infinity ? constrainZoom * 2 : (upperBound + constrainZoom) / 2;
              } else {
                upperBound = constrainZoom;
                constrainZoom = (lowerBound + constrainZoom) / 2;
              }
            } else {
              var minDomainExtent = this.minDomainExtent(yScale);
              if (minDomainExtent == null) { return; }
              if (transformedDomainExtent >= minDomainExtent) {
                upperBound = constrainZoom;
                constrainZoom = (lowerBound + constrainZoom) / 2;
              } else {
                lowerBound = constrainZoom;
                constrainZoom = (upperBound + constrainZoom) / 2;
              }
            }
          }
          zoomAmount = (extentIncreasing ? Math.min : Math.max)(zoomAmount, constrainZoom);
        });
        this.xScales().forEach((xScale) => {
          this._magnifyScale(xScale, zoomAmount, translatedP.x);
        });
        this.yScales().forEach((yScale) => {
          this._magnifyScale(yScale, zoomAmount, translatedP.y);
        });
      }
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
        var positiveTranslateX = translateAmountX > 0;
        this.xScales().forEach((xScale) => {
          if (xScale instanceof Scales.ModifiedLog) {
            var constrainTranslate = positiveTranslateX ? 1 : -1;
            var lowerBound = positiveTranslateX ? 0 : -Infinity;
            var upperBound = positiveTranslateX ? Infinity : 0;
            var iterations = 5;
            for (var i = 0; i < iterations; i++) {
              var translateTransform = (rangeValue: number) => xScale.invert(rangeValue + constrainTranslate);
              var constrainedDomain = xScale.range().map(translateTransform);
              var constrainedDomainExtent = Math.abs(constrainedDomain[1] - constrainedDomain[0]);
              var minDomainExtent = this.minDomainExtent(xScale) || 0;
              var maxDomainExtent = this.maxDomainExtent(xScale) || Infinity;
              if (constrainedDomainExtent >= minDomainExtent && constrainedDomainExtent <= maxDomainExtent) {
                if (positiveTranslateX) {
                  lowerBound = constrainTranslate;
                  constrainTranslate = upperBound === Infinity ? constrainTranslate * 2 : (constrainTranslate + upperBound) / 2;
                } else {
                  upperBound = constrainTranslate;
                  constrainTranslate = lowerBound === -Infinity ? constrainTranslate * 2 : (constrainTranslate + lowerBound) / 2;
                }
              } else {
                if (positiveTranslateX) {
                  upperBound = constrainTranslate;
                  constrainTranslate = (constrainTranslate + lowerBound) / 2;
                } else {
                  lowerBound = constrainTranslate;
                  constrainTranslate = (constrainTranslate + upperBound) / 2;
                }
              }
            }
            translateAmountX = (positiveTranslateX ? Math.min : Math.max)(translateAmountX, constrainTranslate);
          }
        });
        this.xScales().forEach((xScale) => {
          this._translateScale(xScale, translateAmountX);
        });

        var translateAmountY = (lastDragPoint == null ? startPoint.y : lastDragPoint.y) - endPoint.y;

        var positiveTranslateY = endPoint.y > startPoint.y;
        this.yScales().forEach((yScale) => {
          if (yScale instanceof Scales.ModifiedLog) {
            var constrainTranslate = positiveTranslateY ? 1 : -1;
            var lowerBound = positiveTranslateY ? 0 : -Infinity;
            var upperBound = positiveTranslateY ? Infinity : 0;
            var iterations = 5;
            for (var i = 0; i < iterations; i++) {
              var translateTransform = (rangeValue: number) => yScale.invert(rangeValue + constrainTranslate);
              var constrainedDomain = yScale.range().map(translateTransform);
              var constrainedDomainExtent = Math.abs(constrainedDomain[1] - constrainedDomain[0]);
              var minDomainExtent = this.minDomainExtent(yScale) || 0;
              var maxDomainExtent = this.maxDomainExtent(yScale) || Infinity;
              if (constrainedDomainExtent >= minDomainExtent && constrainedDomainExtent <= maxDomainExtent) {
                if (positiveTranslateY) {
                  lowerBound = constrainTranslate;
                  constrainTranslate = upperBound === Infinity ? constrainTranslate * 2 : (constrainTranslate + upperBound) / 2;
                } else {
                  upperBound = constrainTranslate;
                  constrainTranslate = lowerBound === -Infinity ? constrainTranslate * 2 : (constrainTranslate + lowerBound) / 2;
                }
              } else {
                if (positiveTranslateY) {
                  upperBound = constrainTranslate;
                  constrainTranslate = (constrainTranslate + lowerBound) / 2;
                } else {
                  lowerBound = constrainTranslate;
                  constrainTranslate = (constrainTranslate + upperBound) / 2;
                }
              }
            }
          }

          translateAmountX = (positiveTranslateY ? Math.min : Math.max)(translateAmountY, constrainTranslate);
        });

        this.yScales().forEach((yScale) => {
          this._translateScale(yScale, translateAmountY);
        });
        lastDragPoint = endPoint;
      });
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
