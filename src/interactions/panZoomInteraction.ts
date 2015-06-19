///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class PanZoom extends Interaction {
    /**
     * The number of pixels occupied in a line.
     */
    private static _PIXELS_PER_LINE = 120;

    private _xScale: QuantitativeScale<any>;
    private _yScale: QuantitativeScale<any>;
    private _dragInteraction: Interactions.Drag;
    private _mouseDispatcher: Dispatchers.Mouse;
    private _touchDispatcher: Dispatchers.Touch;

    private _touchIds: d3.Map<Point>;

    private _wheelCallback = (p: Point, e: WheelEvent) => this._handleWheelEvent(p, e);
    private _touchStartCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchStart(ids, idToPoint, e);
    private _touchMoveCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handlePinch(ids, idToPoint, e);
    private _touchEndCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEnd(ids, idToPoint, e);
    private _touchCancelCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEnd(ids, idToPoint, e);

    private _minXExtent = 0;
    private _maxXExtent = Infinity;
    private _minYExtent = 0;
    private _maxYExtent = Infinity;

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
      this._xScale = xScale;
      this._yScale = yScale;

      this._dragInteraction = new Interactions.Drag();
      this._setupDragInteraction();
      this._touchIds = d3.map<Point>();
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

      if (this._xScale != null && newCornerDistance !== 0 && oldCornerDistance !== 0) {
        this._magnifyXScale(oldCornerDistance / newCornerDistance, oldCenterPoint.x);
        this._translateXScale(oldCenterPoint.x - newCenterPoint.x);
      }
      if (this._yScale != null && newCornerDistance !== 0 && oldCornerDistance !== 0) {
        this._magnifyYScale(oldCornerDistance / newCornerDistance, oldCenterPoint.x);
        this._translateYScale(oldCenterPoint.x - newCenterPoint.x);
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

    private _magnifyXScale(magnifyAmount: number, centerValue: number) {
      var magnifyTransform = PanZoom._magnifyScaleTransform(this._xScale, magnifyAmount, centerValue);
      magnifyTransform = this._constrainToXExtent(magnifyTransform);
      this._xScale.domain(magnifyTransform);
    }

    private _magnifyYScale(magnifyAmount: number, centerValue: number) {
      var magnifyTransform = PanZoom._magnifyScaleTransform(this._yScale, magnifyAmount, centerValue);
      magnifyTransform = this._constrainToYExtent(magnifyTransform);
      this._yScale.domain(magnifyTransform);
    }

    private static _magnifyScaleTransform<D>(scale: QuantitativeScale<D>, magnifyAmount: number, centerValue: number) {
      var magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * magnifyAmount);
      return scale.range().map(magnifyTransform);
    }

    private _translateXScale(translateAmount: number) {
      var translateTransform = PanZoom._translateScaleTransform(this._xScale, translateAmount);
      translateTransform = this._constrainToXExtent(translateTransform);
      this._xScale.domain(translateTransform);
    }

    private _translateYScale(translateAmount: number) {
      var translateTransform = PanZoom._translateScaleTransform(this._yScale, translateAmount);
      translateTransform = this._constrainToYExtent(translateTransform);
      this._yScale.domain(translateTransform);
    }

    private static _translateScaleTransform<D>(scale: QuantitativeScale<D>, translateAmount: number): D[] {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue + translateAmount);
      return scale.range().map(translateTransform);
    }

    private _constrainToXExtent<D>(domain: D[]) {
      var extent = Math.abs(<any> domain[1].valueOf() - <any> domain[0].valueOf());
      if (extent < this.minXExtent()) {
        return PanZoom._constrainToExtent(this._xScale, this.minXExtent());
      }
      if (extent > this.maxXExtent()) {
        return PanZoom._constrainToExtent(this._xScale, this.maxXExtent());
      }
      return domain;
    }

    private _constrainToYExtent<D>(domain: D[]) {
      var extent = Math.abs(<any> domain[1].valueOf() - <any> domain[0].valueOf());
      if (extent < this.minYExtent()) {
        return PanZoom._constrainToExtent(this._yScale, this.minYExtent());
      }
      if (extent > this.maxYExtent()) {
        return PanZoom._constrainToExtent(this._yScale, this.maxYExtent());
      }
      return domain;
    }

    private static _constrainToExtent<D>(scale: QuantitativeScale<D>, extent: number): D[] {
      var scaleDomain = scale.domain();
      var domainCenter = (<any> scaleDomain[1].valueOf() + <any> scaleDomain[0].valueOf()) / 2;
      var domainMin = domainCenter - extent / 2;
      var domainMax = domainCenter + extent / 2;
      var isAscending = scaleDomain[1] > scaleDomain[0];
      if (scale instanceof Scales.Time) {
        return <any[]> (isAscending ? [new Date(domainMin), new Date(domainMax)] : [new Date(domainMax), new Date(domainMin)]);
      }
      return <any[]> (isAscending ? [domainMin, domainMax] : [domainMax, domainMin]);
    }

    private _handleWheelEvent(p: Point, e: WheelEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        e.preventDefault();

        var deltaPixelAmount = e.deltaY * (e.deltaMode ? PanZoom._PIXELS_PER_LINE : 1);
        var zoomAmount = Math.pow(2, deltaPixelAmount * .002);
        if (this._xScale != null) {
          this._magnifyXScale(zoomAmount, translatedP.x);
        }
        if (this._yScale != null) {
          this._magnifyYScale(zoomAmount, translatedP.y);
        }
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
        if (this._xScale != null) {
          var dragAmountX = endPoint.x - (lastDragPoint == null ? startPoint.x : lastDragPoint.x);
          this._translateXScale(-dragAmountX);
        }
        if (this._yScale != null) {
          var dragAmountY = endPoint.y - (lastDragPoint == null ? startPoint.y : lastDragPoint.y);
          this._translateYScale(-dragAmountY);
        }
        lastDragPoint = endPoint;
      });
    }

    public minXExtent(): number;
    public minXExtent(minXExtent: number): Interactions.PanZoom;
    public minXExtent(minXExtent?: number): any {
      if (minXExtent == null) {
        return this._minXExtent;
      }
      this._minXExtent = minXExtent;
      return this;
    }

    public maxXExtent(): number;
    public maxXExtent(maxXExtent: number): Interactions.PanZoom;
    public maxXExtent(maxXExtent?: number): any {
      if (maxXExtent == null) {
        return this._maxXExtent;
      }
      this._maxXExtent = maxXExtent;
      return this;
    }

    public minYExtent(): number;
    public minYExtent(minYExtent: number): Interactions.PanZoom;
    public minYExtent(minYExtent?: number): any {
      if (minYExtent == null) {
        return this._minYExtent;
      }
      this._minYExtent = minYExtent;
      return this;
    }

    public maxYExtent(): number;
    public maxYExtent(maxYExtent: number): Interactions.PanZoom;
    public maxYExtent(maxYExtent?: number): any {
      if (maxYExtent == null) {
        return this._maxYExtent;
      }
      this._maxXExtent = maxYExtent;
      return this;
    }

  }
}
}
