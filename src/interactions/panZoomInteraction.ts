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
    }

    private _handleTouchMove(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      if (this._touchIds.size() !== 2) {
        return;
      }
      var oldAvgX = (this._touchIds.values()[1].x + this._touchIds.values()[0].x) / 2;
      var oldAvgY = (this._touchIds.values()[1].y + this._touchIds.values()[0].y) / 2;
      var oldDiffX = Math.abs(this._touchIds.values()[1].x - this._touchIds.values()[0].x);
      var oldDiffY = Math.abs(this._touchIds.values()[1].y - this._touchIds.values()[0].y);

      ids.forEach((id) => {
        this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
      });

      var newAvgX = (this._touchIds.values()[1].x + this._touchIds.values()[0].x) / 2;
      var newAvgY = (this._touchIds.values()[1].y + this._touchIds.values()[0].y) / 2;
      var newDiffX = Math.abs(this._touchIds.values()[1].x - this._touchIds.values()[0].x);
      var newDiffY = Math.abs(this._touchIds.values()[1].y - this._touchIds.values()[0].y);

      if (this._xScale != null) {
        this._xScale.domain(PanZoom.magnify(this._xScale, oldDiffX / newDiffX, oldAvgX / 2));
      }
      if (this._yScale != null) {
        this._yScale.domain(PanZoom.magnify(this._yScale, oldDiffY / newDiffY, (oldAvgY + newAvgY) / 2));
      }
      console.log(oldDiffX / newDiffX);
    }

    private _handleTouchEnd(ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) {
      ids.forEach((id) => {
        this._touchIds.remove(id.toString());
      });
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
          this._xScale.domain(PanZoom.magnify(this._xScale, zoomAmount, p.x));
        }
        if (this._yScale != null) {
          this._yScale.domain(PanZoom.magnify(this._yScale, zoomAmount, p.y));
        }
      }
    }

    private _setupDragInteraction() {
//      var lastDragPoint: Point;
//      this._dragInteraction.onDragStart(() => lastDragPoint = null);
//      this._dragInteraction.onDrag((startPoint, endPoint) => {
//        if (this._xScale != null) {
//          var dragAmountX = endPoint.x - (lastDragPoint == null ? startPoint.x : lastDragPoint.x);
//          this._xScale.domain(PanZoom.translate(this._xScale, -dragAmountX));
//        }
//        if (this._yScale != null) {
//          var dragAmountY = endPoint.y - (lastDragPoint == null ? startPoint.y : lastDragPoint.y);
//          this._yScale.domain(PanZoom.translate(this._yScale, -dragAmountY));
//        }
//        lastDragPoint = endPoint;
//      });
    }

  }
}
}
