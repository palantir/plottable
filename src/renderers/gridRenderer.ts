///<reference path="../reference.ts" />

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
     * @param {IAccessor|string|number} [xAccessor] An accessor for extracting
     *     the x position of each grid cell from the data.
     * @param {IAccessor|string|number} [yAccessor] An accessor for extracting
     *     the y position of each grid cell from the data.
     * @param {IAccessor|string|number} [valueAccessor] An accessor for
     *     extracting value of each grid cell from the data. This value will
     *     be pass through the color scale to determine the color of the cell.
     */
    constructor(dataset: any,
                xScale: OrdinalScale,
                yScale: OrdinalScale,
                colorScale: Scale,
                xAccessor?: any,
                yAccessor?: any,
                valueAccessor?: any) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("grid-renderer", true);

      // The x and y scales should render in bands with no padding
      this.xScale.rangeType("bands", 0, 0);
      this.yScale.rangeType("bands", 0, 0);

      this.colorScale = colorScale;
      this.project("fill", valueAccessor, colorScale);
    }

    public _paint() {
      super._paint();

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this.dataSelection.enter().append("rect");

      var xStep = this.xScale.rangeBand();
      var yr    = this.yScale.range();
      var yStep = this.yScale.rangeBand();
      var yMax  = Math.max(yr[0], yr[1]) - yStep;

      var attrToProjector = this._generateAttrToProjector();
      attrToProjector["width"]  = () => xStep;
      attrToProjector["height"] = () => yStep;
      var yAttr = attrToProjector["y"];
      attrToProjector["y"] = (d: any, i: number) => yMax - yAttr(d,i);

      this.dataSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
    }
  }
}
