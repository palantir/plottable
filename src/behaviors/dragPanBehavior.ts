///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
export module Pan {
  export class DragPan<D> extends AbstractPan<D> {

    private _dragInteraction: Interaction.Drag;

    /**
     * Creates a DragPan Behavior.
     *
     * This behavior allows a consumer of Plottable to drag around in a component
     * in order to cause the input scale to translate,
     * resulting in a panning behavior to the consumer.
     *
     * @constructor
     * @param {Scale.AbstractQuantitative<number>} scale The scale to update on panning
     * @param {boolean} isVertical If the scale operates vertically or horizontally
     */
    constructor(scale: Scale.AbstractQuantitative<D>, isVertical: boolean) {
      super(scale, isVertical);
      this._dragInteraction = new Interaction.Drag();
      this._setupInteraction();
    }

    public getDragInteraction(): Interaction.Drag {
      return this._dragInteraction;
    }

    private _setupInteraction() {
      var lastDragValue: number;

      this._dragInteraction.drag((startPoint: Point, endPoint: Point) => {
        var startPointDragValue = this._verticalPan ? startPoint.y : startPoint.x;
        var endPointDragValue = this._verticalPan ? endPoint.y : endPoint.x;
        var dragAmount = endPointDragValue - (lastDragValue == null ? startPointDragValue : lastDragValue);

        var leftLimit = this._scale.range()[0] - (this.bounds()[0] == null ? -Infinity : this._scale.scale(this.bounds()[0]));
        var rightLimit = this._scale.range()[1] - (this.bounds()[1] == null ? Infinity : this._scale.scale(this.bounds()[1]));

        if (dragAmount > 0) {
          dragAmount = Math.min(dragAmount, leftLimit);
        } else {
          dragAmount = Math.max(dragAmount, rightLimit);
        }

        this._scale.domain(ScaleDomainTransformers.translate(this._scale, -dragAmount));
        lastDragValue = endPointDragValue;
      });

      this._dragInteraction.dragend(() => lastDragValue = null);
    }
  }
}
}
}
