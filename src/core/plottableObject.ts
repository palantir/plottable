///<reference path="../reference.ts" />

module Plottable {
export module Core {
  /**
   * A class most other Plottable classes inherit from, in order to have a
   * unique ID.
   */
  export class PlottableObject {
    private static _nextID = 0;
    private _plottableID = PlottableObject._nextID++;

    public getID() {
      return this._plottableID;
    }
  }
}
}
