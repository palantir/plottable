///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   */
  export class Pie extends Abstract.Plot {
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

    /**
     * Adds a dataset to this plot. Only one dataset can be added to a PiePlot.
     *
     * A key is automatically generated if not supplied.
     *
     * @param {string} [key] The key of the dataset.
     * @param {any[]|Dataset} dataset dataset to add.
     * @returns {PiePlot} The calling PiePlot.
     */
    public addDataset(key: string, dataset: Dataset): Pie;
    public addDataset(key: string, dataset: any[]): Pie;
    public addDataset(dataset: Dataset): Pie;
    public addDataset(dataset: any[]): Pie;
    public addDataset(keyOrDataset: any, dataset?: any): Pie {
      /**
       * Implementation will be very similar to newStylePlot's implementation if not identical.
       * A dataset will be added for the PiePlot to plot.  Any additional ones will be ignored.
       */
      throw new Error("MUST IMPLEMENT");
    }

    /**
     * Removes a dataset.
     *
     * @param {string} key The key of the dataset
     * @returns {PiePlot} The calling PiePlot.
     */
    public removeDataset(key: string): Pie {
      /**
       * Implementation will be very similar to newStylePlot's implementation if not identical.
       * Removal of a dataset will allow a new one to be added.
       */
      throw new Error("WILL IMPLEMENT");
    }

    public _generateAttrToProjector(): IAttributeToProjector {
      /**
       * Under the assumption that the data is now nicely formatted,
       * d3.arc should be able to be set on the "d" attribute to paint
       */
      throw new Error("MUST IMPLEMENT");
    }

    public _getDrawer(key: string): Abstract._Drawer {
      /**
       * Probably will need an arc drawer here
       */
      throw new Error("MUST IMPLEMENT");
    }

    public _paint() {
      /**
       * Grab the attributes from _generateAttrToProjector and then use
       * an arcDrawer or so to draw the arc
       */
      throw new Error("MUST IMPLEMENT");
    }

  }
}
}
