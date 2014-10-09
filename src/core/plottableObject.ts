///<reference path="../reference.ts" />

module Plottable {
export module Core {
  /**
   * A class most other Plottable classes inherit from, in order to have a
   * unique ID.
   */
  export class PlottableObject {
    private static nextID = 0;
    public _plottableID = PlottableObject.nextID++;
  }
}
}
