///<reference path="reference.ts" />

module Plottable {
  export class CircleRenderer extends NumericXYRenderer {

    /**
     * Creates a CircleRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     * @param {IAccessor} [rAccessor] A function for extracting radius values from the data.
     */
    constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale,
                xAccessor?: any, yAccessor?: any, rAccessor?: any) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
/*      this._rAccessor = (rAccessor != null) ? rAccessor : CircleRenderer.defaultRAccessor;*/
      this.classed("circle-renderer", true);
    }

    public projector(attrToSet: string, accessor: IAccessor, scale?: Scale) {
      attrToSet = attrToSet === "cx" ? "x" : attrToSet;
      attrToSet = attrToSet === "cy" ? "y" : attrToSet;
      super.projector(attrToSet, accessor, scale);
      return this;
    }

    public _paint() {
      super._paint();
      var attrHash = this._generateAttrHash();
      attrHash["cx"] = attrHash["x"];
      attrHash["cy"] = attrHash["y"];
      delete attrHash["x"];
      delete attrHash["y"];

      this.dataSelection = this.renderArea.selectAll("circle").data(this._data);
      this.dataSelection.enter().append("circle").attr(attrHash);
      this.dataSelection.exit().remove();
    }
  }
}
