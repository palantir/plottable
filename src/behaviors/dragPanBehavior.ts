///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
  export class DragPan {

    private _dragInteraction: Interaction.Drag;
    private _scale: Scale.AbstractQuantitative<any>;
    private _leftBounds = [-Infinity, Infinity];
    private _rightBounds = [-Infinity, Infinity];
    private _verticalPan: boolean;

    /**
     * Creates a DragPan Behavior.
     *
     * The allows you to move around and zoom in on a plot, interactively. It
     * does so by changing the xScale and yScales' domains repeatedly.
     *
     * @constructor
     * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
     * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
     */
    constructor(scale: Scale.AbstractQuantitative<any>, isVertical: boolean) {
      this._scale = scale;
      this._dragInteraction = new Interaction.Drag();
      this._setupInteraction(this._dragInteraction);
      this._verticalPan = isVertical;
    }

    public getInteraction(): Interaction.Drag {
      return this._dragInteraction;
    }

    public leftBounds(): number[];
    public leftBounds(newBounds: number[]): Behavior.DragPan;
    public leftBounds(newBounds?: number[]): any {
      if (newBounds == null) {
        return this._leftBounds;
      }
      this._leftBounds = newBounds;
      return this;
    }

    public rightBounds(): number[];
    public rightBounds(newBounds: number[]): Behavior.DragPan;
    public rightBounds(newBounds?: number[]): any {
      if (newBounds == null) {
        return this._rightBounds;
      }
      this._leftBounds = newBounds;
      return this;
    }

    private _setupInteraction(dragInteraction: Interaction.Drag) {
      var lastDragValue: number;

      dragInteraction.drag((startPoint: Point, endPoint: Point) => {
        var startPointDragValue = this._verticalPan ? startPoint.y : startPoint.x;
        var endPointDragValue = this._verticalPan ? endPoint.y : endPoint.x;
        var dragAmount = endPointDragValue - (lastDragValue == null ? startPointDragValue : lastDragValue);

        ScaleDomainTransformers.translate(this._scale, dragAmount, this.leftBounds(), this.rightBounds());
        lastDragValue = endPointDragValue;
      });

      dragInteraction.dragend(() => lastDragValue = null);
    }
  }
}
}
