///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
  export class DragPan<D> {

    private _dragInteraction: Interaction.Drag;
    private _scale: Scale.AbstractQuantitative<D>;
    private _bounds: D[] = [null, null];
    private _verticalPan: boolean;

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
      this._scale = scale;
      this._dragInteraction = new Interaction.Drag();
      this._setupInteraction(this._dragInteraction);
      this._verticalPan = isVertical;
    }

    public getInteraction(): Interaction.Drag {
      return this._dragInteraction;
    }

    public leftBound(): D;
    public leftBound(newBound: D): Behavior.DragPan<D>;
    public leftBound(newBound?: D): any {
      if (newBound === undefined) {
        return this._bounds[0];
      }
      this._bounds[0] = newBound;
      return this;
    }

    public rightBound(): D;
    public rightBound(newBound: D): Behavior.DragPan<D>;
    public rightBound(newBound?: D): any {
      if (newBound === undefined) {
        return this._bounds[1];
      }
      this._bounds[1] = newBound;
      return this;
    }

    private _setupInteraction(dragInteraction: Interaction.Drag) {
      var lastDragValue: number;

      dragInteraction.drag((startPoint: Point, endPoint: Point) => {
        var startPointDragValue = this._verticalPan ? startPoint.y : startPoint.x;
        var endPointDragValue = this._verticalPan ? endPoint.y : endPoint.x;
        var dragAmount = endPointDragValue - (lastDragValue == null ? startPointDragValue : lastDragValue);

        var leftLimit = this._scale.range()[0] - (this.leftBound() == null ? -Infinity : this._scale.scale(this.leftBound()));
        var rightLimit = this._scale.range()[1] - (this.rightBound() == null ? Infinity : this._scale.scale(this.rightBound()));

        if (dragAmount > 0) {
          dragAmount = Math.min(dragAmount, leftLimit);
        } else {
          dragAmount = Math.max(dragAmount, rightLimit);
        }

        this._scale.domain(ScaleDomainTransformers.translate(this._scale, -dragAmount));
        lastDragValue = endPointDragValue;
      });

      dragInteraction.dragend(() => lastDragValue = null);
    }
  }
}
}
