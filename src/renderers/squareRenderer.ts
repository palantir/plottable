///<reference path="../reference.ts" />

module Plottable {
  export class SquareRenderer extends XYRenderer {
    private _rAccessor: any;
    private static DEFAULT_R_ACCESSOR = 3;

    /**
     * Creates a SquareRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     * @param {IAccessor} [rAccessor] A function for extracting radius values from the data.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale,
                xAccessor?: IAccessor, yAccessor?: IAccessor, rAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.project("r", 3);
      this.classed("square-renderer", true);
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xF = attrToProjector["x"];
      var yF = attrToProjector["y"];
      var rF = attrToProjector["r"];
      attrToProjector["x"] = (d: any, i: number) => xF(d, i) - rF(d, i);
      attrToProjector["y"] = (d: any, i: number) => yF(d, i) - rF(d, i);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this.dataSelection.enter().append("rect");
      this.dataSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
    }
  }
}
