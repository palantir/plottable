///<reference path="reference.ts" />

module Plottable {
  export class SquareRenderer extends NumericXYRenderer {
    private _rAccessor: any;
    private static defaultRAccessor = 3;

    /**
     * Creates a SquareRenderer.
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
                xAccessor?: IAccessor, yAccessor?: IAccessor, rAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.projector("r", 3);
      this.classed("square-renderer", true);
    }

    public _paint() {
      super._paint();
      var attrHash = this._generateAttrHash();
      var xF = attrHash["x"];
      var yF = attrHash["y"];
      var rF = attrHash["r"];
      attrHash["x"] = (d: any, i: number) => xF(d, i) - rF(d, i);
      attrHash["y"] = (d: any, i: number) => yF(d, i) - rF(d, i);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this.dataSelection.enter().append("rect");
      this.dataSelection.attr(attrHash);
      this.dataSelection.exit().remove();
    }
  }
}
