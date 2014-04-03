///<reference path="reference.ts" />

module Plottable {
  export class CategoryXYRenderer extends XYRenderer {
    public dataSelection: D3.UpdateSelection;
    public xScale: OrdinalScale;
    public yScale: QuantitiveScale;
    public _xAccessor: any;
    public _yAccessor: any;

    /**
     * Creates a CategoryXYRenderer with an Ordinal x scale and Quantitive y scale.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
    constructor(dataset: any,
                xScale: OrdinalScale,
                yScale: QuantitiveScale,
                xAccessor?: IAccessor,
                yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("category-renderer", true);
    }
  }
}
