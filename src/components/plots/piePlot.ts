///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   */
  export class PiePlot<X,Y> extends Plot {
    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      super(new Plottable.Dataset());
      this.classed("pie-plot", true);
    }
  }
}
}
