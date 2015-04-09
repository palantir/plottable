///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
  export class DragPan {

    private _dragInteraction: Interaction.Drag;
    private _scale: Scale.AbstractQuantitative<any>;
    private _leftBound: number;
    private _rightBound: number;
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
    constructor(scale: Scale.AbstractQuantitative<number>, isVertical: boolean) {
      this._scale = scale;
      this._dragInteraction = new Interaction.Drag();
      this._setupInteraction(this._dragInteraction);
      this._verticalPan = isVertical;
    }

    public getInteraction(): Interaction.Drag {
      return this._dragInteraction;
    }

    public leftBound(): number;
    public leftBound(newBound: number): Behavior.DragPan;
    public leftBound(newBound?: number): any {
      if (newBound === undefined) {
        return this._leftBound;
      }
      this._leftBound = newBound;
      return this;
    }

    public rightBound(): number;
    public rightBound(newBound: number): Behavior.DragPan;
    public rightBound(newBound?: number): any {
      if (newBound === undefined) {
        return this._rightBound;
      }
      this._rightBound = newBound;
      return this;
    }

    private _setupInteraction(dragInteraction: Interaction.Drag) {
      var lastDragValue: number;

      dragInteraction.drag((startPoint: Point, endPoint: Point) => {
        var startPointDragValue = this._verticalPan ? startPoint.y : startPoint.x;
        var endPointDragValue = this._verticalPan ? endPoint.y : endPoint.x;
        var dragAmount = endPointDragValue - (lastDragValue == null ? startPointDragValue : lastDragValue);

        var leftLimit = this._scale.range()[0] - (this.leftBound() === undefined ? -Infinity : this._scale.scale(this.leftBound()));
        var rightLimit = this._scale.range()[1] - (this.rightBound() === undefined ? Infinity : this._scale.scale(this.rightBound()));

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
