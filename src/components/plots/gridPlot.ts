///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Grid extends Abstract.XYPlot<string,string> {
    public _colorScale: Abstract.Scale<any, string>;
    public _xScale: Scale.Ordinal;
    public _yScale: Scale.Ordinal;

    public _animators: Animator.PlotAnimatorMap = {
      "cells" : new Animator.Null()
    };

    /**
     * Constructs a GridPlot.
     *
     * A GridPlot is used to shade a grid of data. Each datum is a cell on the
     * grid, and the datum can control what color it is.
     *
     * @constructor
     * @param {DatasetInterface | any} dataset The dataset to render.
     * @param {Scale.Ordinal} xScale The x scale to use.
     * @param {Scale.Ordinal} yScale The y scale to use.
     * @param {Scale.Color|Scale.InterpolatedColor} colorScale The color scale
     * to use for each grid cell.
     */
    constructor(dataset: any, xScale: Scale.Ordinal, yScale: Scale.Ordinal, colorScale: Abstract.Scale<any, string>) {
      super(dataset, xScale, yScale);
      this.classed("grid-plot", true);

      // The x and y scales should render in bands with no padding
      this._xScale.rangeType("bands", 0, 0);
      this._yScale.rangeType("bands", 0, 0);

      this._colorScale = colorScale;
      this.project("fill", "value", colorScale); // default
    }

    /**
     * @param {string} attrToSet One of ["x", "y", "fill"]. If "fill" is used,
     * the data should return a valid CSS color.
     */
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "fill") {
        this._colorScale = this._projectors["fill"].scale;
      }
      return this;
    }

    public _paint() {
      super._paint();

      var cells = this._renderArea.selectAll("rect").data(this._dataset.data());
      cells.enter().append("rect");

      var xStep = this._xScale.rangeBand();
      var yStep = this._yScale.rangeBand();

      var attrToProjector = this._generateAttrToProjector();
      attrToProjector["width"]  = () => xStep;
      attrToProjector["height"] = () => yStep;

      this._applyAnimatedAttributes(cells, "cells", attrToProjector);
      cells.exit().remove();
    }
  }
}
}
