///<reference path="../reference.ts" />

module Plottable {
  export class GridRenderer extends XYRenderer {
    public colorScale: ColorScale;

    /**
     * Creates a GridRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {ColorScale} colorScale The color scale to use for each grid cell.
     * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
     * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
     */
    constructor(dataset: any,
                xScale: Scale,
                yScale: Scale,
                colorScale: ColorScale,
                xAccessor?: IAccessor,
                yAccessor?: IAccessor,
                valueAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("grid-renderer", true);

      this.colorScale = colorScale;
      this.xScale     = xScale;
      this.yScale     = yScale;

      this.project("x", xAccessor, xScale);
      this.project("y", yAccessor, yScale);
      this.project("fill", valueAccessor, colorScale);
    }

    public project(attrToSet: string, accessor: any, scale?: Scale): GridRenderer {
      var activatedAccessor = Utils.accessorize(accessor);
      var p = {accessor: activatedAccessor, scale: scale};
      this._projectors[attrToSet] = p;

      if(scale != null){
        this.setScaleDomain(accessor, scale);
      }
      return this;
    }

    public setScaleDomain(accessor: IAccessor, scale: Scale): any {
      // up-convert to accessor function
      var accessorFn: IAccessor = Utils.accessorize(accessor);

      // map data with accessor
      var data: any[]   = this._dataSource.data();
      var metadata: any = this._dataSource.metadata();
      var mapped: any[] = data.map((d: any, i: number) => accessorFn(d, i, metadata));

      // update scale's domain
      scale.domain(mapped);
      return this;
    }

    public _paint() {
      super._paint();

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this.dataSelection.enter().append("rect");

      // switch to different type
      var xr    = this.yScale.range();
      var xStep = Math.abs(xr[1] - xr[0]) / this.xScale.domainUnits();

      var yr    = this.yScale.range();
      var yStep = Math.abs(yr[1] - yr[0]) / this.yScale.domainUnits();
      var yMax  = Math.max(yr[0], yr[1]);


      console.log(xr, yr, this.yScale._d3Scale("Sleep"));

      var attrToProjector = this._generateAttrToProjector();
      attrToProjector["width"]  = () => xStep;
      attrToProjector["height"] = () => yStep;
      var yAttr = attrToProjector["y"];
      attrToProjector["y"] = (d: any, i: number) => {
        console.log(d);
        return yMax - yAttr(d,i);
      }

      this.dataSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
    }
  }
}
