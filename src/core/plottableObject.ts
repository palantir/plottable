///<reference path="../reference.ts" />

module Plottable {
  export class PlottableObject {
    private static nextID = 0;
    public _plottableID = PlottableObject.nextID++;
  }
}
