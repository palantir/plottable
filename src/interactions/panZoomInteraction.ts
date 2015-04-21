///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class PanZoom extends AbstractInteraction {

    private _xScale: Scale.AbstractQuantitative<any>;
    private _yScale: Scale.AbstractQuantitative<any>;

    private _dragInteraction: Interaction.Drag;
    private _scrollInteraction: Interaction.Scroll;

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
      this._scrollInteraction = new Interaction.Scroll();
      this._setupInteractions();
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._dragInteraction._anchor(component, hitBox);
      this._scrollInteraction._anchor(component, hitBox);
    }

    private _setupInteractions() {
      this._setupDragInteraction();
      this._setupScrollInteraction();
    }

    private _setupDragInteraction() {
      var lastDragPoint: Point;
      this._dragInteraction.onDragStart(() => lastDragPoint = null);
      this._dragInteraction.onDrag((startPoint, endPoint) => {
        if (this._xScale != null) {
          var dragAmountX = endPoint.x - (lastDragPoint == null ? startPoint.x : lastDragPoint.x);
          this._xScale.domain(ScaleDomainTransformers.translate(this._xScale, -dragAmountX));
        }
        if (this._yScale != null) {
          var dragAmountY = endPoint.y - (lastDragPoint == null ? startPoint.y : lastDragPoint.y);
          this._yScale.domain(ScaleDomainTransformers.translate(this._yScale, -dragAmountY));
        }
        lastDragPoint = endPoint;
      });
    }

    private _setupScrollInteraction() {
      this._scrollInteraction.onScroll((point: Point, deltaAmount: number) => {
        var zoomAmount = Math.pow(2, -deltaAmount * .002);
        if (this._xScale != null) {
          this._xScale.domain(ScaleDomainTransformers.magnify(this._xScale, zoomAmount, point.x));
        }
        if (this._yScale != null) {
          this._yScale.domain(ScaleDomainTransformers.magnify(this._yScale, zoomAmount, point.y));
        }
      });
    }

  }
}
}
