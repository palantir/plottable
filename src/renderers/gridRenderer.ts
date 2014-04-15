///<reference path="../reference.ts" />

module Plottable {
  export class GridRenderer extends XYRenderer {
    public colorScale: ColorScale;
    public xScale: OrdinalScale;
    public yScale: OrdinalScale;

    /**
     * Creates a GridRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {ColorScale} colorScale The color scale to use for each grid
     *     cell.
     * @param {IAccessor} [xAccessor] A function for extracting the x position
     *     of each grid cell from the data.
     * @param {IAccessor} [yAccessor] A function for extracting the y position
     *     of each grid cell from the data.
     * @param {IAccessor} [valueAccessor] A function for extracting value of
     *     each grid cell from the data. This value will be pass through the
     *     color scale to determine the color of the cell.
     */
    constructor(dataset: any,
                xScale: OrdinalScale,
                yScale: OrdinalScale,
                colorScale: ColorScale,
                xAccessor?: IAccessor,
                yAccessor?: IAccessor,
                valueAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("grid-renderer", true);

      this.colorScale = colorScale;
      this.xScale     = xScale;
      this.yScale     = yScale;

      // The x and y scales should render in bands with no padding
      this.xScale.rangeType("bands", 0, 0);
      this.yScale.rangeType("bands", 0, 0);

      this.project("x", xAccessor, xScale);
      this.project("y", yAccessor, yScale);
      this.project("fill", valueAccessor, colorScale);

      this.setScaleDomain(xAccessor, xScale, false);
      this.setScaleDomain(yAccessor, yScale, false);
      this.setScaleDomain(valueAccessor, colorScale, true);
    }

    private setScaleDomain(accessor: IAccessor, scale: Scale, extentOnly: boolean): any {
      // up-convert to accessor function
      var accessorFn: IAccessor = Utils.accessorize(accessor);

      // map data with accessor
      var data: any[]   = this._dataSource.data();
      var metadata: any = this._dataSource.metadata();
      var mapped: any[] = data.map((d: any, i: number) => accessorFn(d, i, metadata));
      if (extentOnly) mapped = d3.extent(mapped);

      // update scale's domain
      scale.domain(mapped);
      return this;
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
