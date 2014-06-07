///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class PlottableObject {
    private static nextID = 0;
    public _plottableID = PlottableObject.nextID++;
  }
}
}
