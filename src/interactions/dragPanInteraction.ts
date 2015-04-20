///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
export module Pan {
  export class Drag extends AbstractPan {

    private _dragInteraction: Interaction.Drag;

    /**
     * Creates a PanInteraction.
     *
     * The allows you to move around a plot interactively.
     * It does so by translating the xScale and yScales' domains repeatedly.
     *
     * @constructor
     * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
     * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
     */
    constructor(xScale?: Scale.AbstractQuantitative<any>, yScale?: Scale.AbstractQuantitative<any>) {
      super(xScale, yScale);

      this._dragInteraction = new Interaction.Drag();
      this._setupDragInteraction();
    }

    public _requiresHitbox() {
      return true;
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._dragInteraction._anchor(component, hitBox);
    }

    private _setupDragInteraction() {
      var lastDragPoint: Point;
      this._dragInteraction.drag((startPoint, endPoint) => {
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
      this._dragInteraction.dragend(() => lastDragPoint = null);
    }

  }
}
}
}
