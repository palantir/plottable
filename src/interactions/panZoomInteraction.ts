///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class PanZoom extends AbstractInteraction {

    /**
     * The number of pixels occupied in a line.
     */
    public static PIXELS_PER_LINE = 120;

    private _xScale: Scale.AbstractQuantitative<any>;
    private _yScale: Scale.AbstractQuantitative<any>;

    private _dragInteraction: Interaction.Drag;
    private _touchDispatcher: Dispatcher.Touch;

    private _touchIds: D3.Map<Point>;

    /**
     * Creates a PanZoomInteraction.
     *
     * The allows you to move around and zoom in on a plot, interactively. It
     * does so by changing the xScale and yScales' domains repeatedly.
     *
     * @constructor
     * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
     * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
     */
    constructor(xScale?: Scale.AbstractQuantitative<any>, yScale?: Scale.AbstractQuantitative<any>) {
      super();
      this._xScale = xScale;
      this._yScale = yScale;

      this._dragInteraction = new Interaction.Drag();
      this._setupDragInteraction();
      this._touchIds = d3.map();
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._dragInteraction._anchor(component, hitBox);

      var mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      mouseDispatcher.onWheel("Interaction.PanZoom" + this.getID(), (p: Point, e: WheelEvent) => this._handleWheelEvent(p, e));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._touchDispatcher.onTouchStart("Interaction.PanZoom" + this.getID(),
        (ids, idToPoint, e) => this._handlePinchStart(ids, idToPoint, e));
      this._touchDispatcher.onTouchMove("Interaction.PanZoom" + this.getID(),
        (ids, idToPoint, e) => this._handlePinch(ids, idToPoint, e));
      this._touchDispatcher.onTouchEnd("Interaction.PanZoom" + this.getID(),
        (ids, idToPoint, e) => this._handlePinchFinish(ids, idToPoint, e));
      this._touchDispatcher.onTouchCancel("Interaction.PanZoom" + this.getID(),
        (ids, idToPoint, e) => this._handlePinchFinish(ids, idToPoint, e));
    }

    private _handlePinchStart(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      ids.forEach((id) => {
        if (this._touchIds.size() === 2) {
          return;
        }

        this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
      });
    }

    private _handlePinch(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      if (this._touchIds.size() < 2) {
        return;
      }

      var oldCenterPoint = this.centerPoint();
      var oldCornerDistance = this.cornerDistance();

      ids.forEach((id) => {
        if (!this._touchIds.has(id.toString())) {
          return;
        }
        var translatedP = this._translateToComponentSpace(idToPoint[id]);
        if (this._isInsideComponent(translatedP)) {
          this._touchIds.set(id.toString(), translatedP);
        }
      });

      var newCenterPoint = this.centerPoint();
      var newCornerDistance = this.cornerDistance();

      if (this._xScale != null && newCornerDistance !== 0 && oldCornerDistance !== 0) {
        PanZoom.magnifyScale(this._xScale, oldCornerDistance / newCornerDistance, oldCenterPoint.x);
        PanZoom.translateScale(this._xScale, oldCenterPoint.x - newCenterPoint.x);
      }
      if (this._yScale != null && newCornerDistance !== 0 && oldCornerDistance !== 0) {
        PanZoom.magnifyScale(this._yScale, oldCornerDistance / newCornerDistance, oldCenterPoint.y);
        PanZoom.translateScale(this._yScale, oldCenterPoint.y - newCenterPoint.y);
      }
    }

    private centerPoint() {
      var points = this._touchIds.values();
      var firstTouchPoint = points[0];
      var secondTouchPoint = points[1];

      var leftX = Math.min(firstTouchPoint.x, secondTouchPoint.x);
      var rightX = Math.max(firstTouchPoint.x, secondTouchPoint.x);
      var topY = Math.min(firstTouchPoint.y, secondTouchPoint.y);
      var bottomY = Math.max(firstTouchPoint.y, secondTouchPoint.y);

      return {x: (leftX + rightX) / 2, y: (bottomY + topY) / 2};
    }

    private cornerDistance() {
      var points = this._touchIds.values();
      var firstTouchPoint = points[0];
      var secondTouchPoint = points[1];

      var leftX = Math.min(firstTouchPoint.x, secondTouchPoint.x);
      var rightX = Math.max(firstTouchPoint.x, secondTouchPoint.x);
      var topY = Math.min(firstTouchPoint.y, secondTouchPoint.y);
      var bottomY = Math.max(firstTouchPoint.y, secondTouchPoint.y);

      return Math.sqrt(Math.pow(rightX - leftX, 2) + Math.pow(bottomY - topY, 2));
    }

    private _handlePinchFinish(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      ids.forEach((id) => {
        this._touchIds.remove(id.toString());
      });
    }

    private static magnifyScale<D>(scale: Scale.AbstractQuantitative<D>, magnifyAmount: number, centerValue: number) {
      var magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * magnifyAmount);
      scale.domain(scale.range().map(magnifyTransform));
    }

    private static translateScale<D>(scale: Scale.AbstractQuantitative<D>, translateAmount: number) {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue + translateAmount);
      scale.domain(scale.range().map(translateTransform));
    }

    private _handleWheelEvent(p: Point, e: WheelEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        e.preventDefault();

        var deltaPixelAmount = e.deltaY * (e.deltaMode ? PanZoom.PIXELS_PER_LINE : 1);
        var zoomAmount = Math.pow(2, deltaPixelAmount * .002);
        if (this._xScale != null) {
          PanZoom.magnifyScale(this._xScale, zoomAmount, translatedP.x);
        }
        if (this._yScale != null) {
          PanZoom.magnifyScale(this._yScale, zoomAmount, translatedP.y);
        }
      }
    }

    private _setupDragInteraction() {
      var lastDragPoint: Point;
      this._dragInteraction.onDragStart(() => lastDragPoint = null);
      this._dragInteraction.onDrag((startPoint, endPoint) => {
        if (this._touchIds.size() === 2) {
          return;
        }
        if (this._xScale != null) {
          var dragAmountX = endPoint.x - (lastDragPoint == null ? startPoint.x : lastDragPoint.x);
          PanZoom.translateScale(this._xScale, -dragAmountX);
        }
        if (this._yScale != null) {
          var dragAmountY = endPoint.y - (lastDragPoint == null ? startPoint.y : lastDragPoint.y);
          PanZoom.translateScale(this._yScale, -dragAmountY);
        }
        lastDragPoint = endPoint;
      });
    }

  }
}
}
