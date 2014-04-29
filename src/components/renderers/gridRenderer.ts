///<reference path="../../reference.ts" />

module Plottable {
  export class GridRenderer extends XYRenderer {
    public colorScale: Scale;
    public xScale: OrdinalScale;
    public yScale: OrdinalScale;

    /**
     * Creates a GridRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {OrdinalScale} yScale The y scale to use.
     * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
     *     cell.
     */
    constructor(dataset: any, xScale: OrdinalScale, yScale: OrdinalScale, colorScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("grid-renderer", true);

      // The x and y scales should render in bands with no padding
      this.xScale.rangeType("bands", 0, 0);
      this.yScale.rangeType("bands", 0, 0);

      this.colorScale = colorScale;
      this.project("fill", "value", colorScale); // default
    }

    public project(attrToSet: string, accessor: any, scale?: Scale) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "fill") {
        this.colorScale = this._projectors["fill"].scale;
      }
      return this;
    }

    public _paint() {
      super._paint();

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this.dataSelection.enter().append("rect");

      var xStep = this.xScale.rangeBand();
      var yStep = this.yScale.rangeBand();

      var attrToProjector = this._generateAttrToProjector();
      attrToProjector["width"]  = () => xStep;
      attrToProjector["height"] = () => yStep;

      this.dataSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
    }
  }
}
