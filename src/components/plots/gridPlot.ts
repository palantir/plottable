///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Grid extends Abstract.XYPlot {
    public colorScale: Abstract.Scale;
    public xScale: Scale.Ordinal;
    public yScale: Scale.Ordinal;


    public _animators: Animator.IPlotAnimatorMap = {
      "cells" : new Animator.Null()
    };

    /**
     * Creates a GridPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {OrdinalScale} yScale The y scale to use.
     * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
     *     cell.
     */
    constructor(dataset: any, xScale: Scale.Ordinal, yScale: Scale.Ordinal, colorScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("grid-plot", true);

      // The x and y scales should render in bands with no padding
      this.xScale.rangeType("bands", 0, 0);
      this.yScale.rangeType("bands", 0, 0);

      this.colorScale = colorScale;
      this.project("fill", "value", colorScale); // default
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "fill") {
        this.colorScale = this._projectors["fill"].scale;
      }
      return this;
    }

    public _paint() {
      super._paint();

      var cells = this.renderArea.selectAll("rect").data(this._dataSource.data());
      cells.enter().append("rect");

      var xStep = this.xScale.rangeBand();
      var yStep = this.yScale.rangeBand();

      var attrToProjector = this._generateAttrToProjector();
      attrToProjector["width"]  = () => xStep;
      attrToProjector["height"] = () => yStep;

      this._applyAnimatedAttributes(cells, "cells", attrToProjector);
      cells.exit().remove();
    }
  }
}
}
