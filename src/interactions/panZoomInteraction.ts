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
        (ids, idToPoint, e) => this._handleTouchStart(ids, idToPoint, e));
      this._touchDispatcher.onTouchMove("Interaction.PanZoom" + this.getID(),
        (ids, idToPoint, e) => this._handleTouchMove(ids, idToPoint, e));
      this._touchDispatcher.onTouchEnd("Interaction.PanZoom" + this.getID(),
        (ids, idToPoint, e) => this._handleTouchEnd(ids, idToPoint, e));
    }

    private _handleTouchStart(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      ids.forEach((id) => {
        if (this._touchIds.size() === 2) {
          return;
        }

        this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
      });
      if (this._touchIds.size() === 2) {
        this._dragInteraction.onDrag(null);
      }
    }

    private _handleTouchMove(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      if (this._touchIds.size() !== 2) {
        return;
      }
      var points = this._touchIds.values();
      var firstTouchPoint = points[0];
      var secondTouchPoint = points[1];

      var leftX = Math.min(firstTouchPoint.x, secondTouchPoint.x);
      var rightX = Math.max(firstTouchPoint.x, secondTouchPoint.x);
      var topY = Math.min(firstTouchPoint.y, secondTouchPoint.y);
      var bottomY = Math.max(firstTouchPoint.y, secondTouchPoint.y);

      var oldAvgX = (leftX + rightX) / 2;
      var oldAvgY = (bottomY + topY) / 2;
      var oldDiffX = rightX - leftX;
      var oldDiffY = bottomY - topY;

      ids.forEach((id) => {
        var translatedP = this._translateToComponentSpace(idToPoint[id]);
        if (this._isInsideComponent(translatedP)) {
          this._touchIds.set(id.toString(), translatedP);
        }
      });

      var newPoints = this._touchIds.values();
      var newFirstTouchPoint = newPoints[0];
      var newSecondTouchPoint = newPoints[1];

      var newLeftX = Math.min(newFirstTouchPoint.x, newSecondTouchPoint.x);
      var newRightX = Math.max(newFirstTouchPoint.x, newSecondTouchPoint.x);
      var newTopY = Math.min(newFirstTouchPoint.y, newSecondTouchPoint.y);
      var newBottomY = Math.max(newFirstTouchPoint.y, newSecondTouchPoint.y);

      var newAvgX = (newLeftX + newRightX) / 2;
      var newAvgY = (newBottomY + newTopY) / 2;
      var newDiffX = newRightX - newLeftX;
      var newDiffY = newBottomY - newTopY;

      if (this._xScale != null && newDiffX !== 0 && oldDiffX !== 0) {
        this._xScale.domain(PanZoom.magnify(this._xScale, oldDiffX / newDiffX, oldAvgX));
        this._xScale.domain(PanZoom.translate(this._xScale, oldAvgX - newAvgX));
      }
      if (this._yScale != null && newDiffY !== 0 && oldDiffY !== 0) {
        this._yScale.domain(PanZoom.magnify(this._yScale, oldDiffY / newDiffY, oldAvgY));
        this._yScale.domain(PanZoom.translate(this._yScale, oldAvgY - newAvgY));
      }
    }

    private _handleTouchEnd(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      ids.forEach((id) => {
        this._touchIds.remove(id.toString());
      });
      if (this._touchIds.size() < 2) {
        this._setupDragInteraction();
      }
    }

    private static magnify<D>(scale: Scale.AbstractQuantitative<D>, magnifyAmount: number, centerValue: number) {
      var magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * magnifyAmount);
      return scale.range().map(magnifyTransform);
    }

    private static translate<D>(scale: Scale.AbstractQuantitative<D>, translateAmount: number) {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue + translateAmount);
      return scale.range().map(translateTransform);
    }

    private _handleWheelEvent(p: Point, e: WheelEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        e.preventDefault();

        var deltaPixelAmount = e.deltaY * (e.deltaMode ? PanZoom.PIXELS_PER_LINE : 1);
        var zoomAmount = Math.pow(2, -deltaPixelAmount * .002);
        if (this._xScale != null) {
          this._xScale.domain(PanZoom.magnify(this._xScale, zoomAmount, translatedP.x));
        }
        if (this._yScale != null) {
          this._yScale.domain(PanZoom.magnify(this._yScale, zoomAmount, translatedP.y));
        }
      }
    }

    private _setupDragInteraction() {
      var lastDragPoint: Point;
      this._dragInteraction.onDragStart(() => lastDragPoint = null);
      this._dragInteraction.onDrag((startPoint, endPoint) => {
        if (this._xScale != null) {
          var dragAmountX = endPoint.x - (lastDragPoint == null ? startPoint.x : lastDragPoint.x);
          this._xScale.domain(PanZoom.translate(this._xScale, -dragAmountX));
        }
        if (this._yScale != null) {
          var dragAmountY = endPoint.y - (lastDragPoint == null ? startPoint.y : lastDragPoint.y);
          this._yScale.domain(PanZoom.translate(this._yScale, -dragAmountY));
        }
        lastDragPoint = endPoint;
      });
    }

  }
}
}
