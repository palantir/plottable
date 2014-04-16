///<reference path="../reference.ts" />

module Plottable {
  export class AreaRenderer extends XYRenderer {
    private path: D3.Selection;
    private area: D3.Svg.Area;

/**
     * Creates an AreaRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {any} [xAccessor] A function for extracting x values from the data.
     * @param {any} [yAccessor] A function for extracting upper y values to color between.
     * @param {any} [y0Accessor] A function for extracting lower y values to color between.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale, xAccessor?: any, yAccessor?: any, y0Accessor?: any) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("area-renderer", true);
      if (!y0Accessor) {
        y0Accessor = () => 0;
      }
      this.project("y0", y0Accessor, yScale);
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this.path = this.renderArea.append("path").classed("area", true);
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      this.area = d3.svg.area()
            .x(attrToProjector["x"])
            .y0(attrToProjector["y0"])
            .y1(attrToProjector["y"]);
      this.dataSelection = this.path.datum(this._dataSource.data());
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];
      this.path.attr("d", this.area).attr(attrToProjector);
    }
  }
}
