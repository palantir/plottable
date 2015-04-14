///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
export module Pan {
  export class AbstractPan<D> {

    private _panBounds: D[] = [null, null];
    protected _scale: Scale.AbstractQuantitative<D>;
    protected _verticalPan: boolean;

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
      this._verticalPan = isVertical;
    }

    public bounds(): D[];
    public bounds(newBounds: D[]): Behavior.Pan.AbstractPan<D>;
    public bounds(newBounds?: D[]): any {
      if (newBounds == null) {
        return this._panBounds;
      }
      this._panBounds = newBounds;
      return this;
    }

  }
}
}
}
