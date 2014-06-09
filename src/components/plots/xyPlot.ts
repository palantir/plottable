///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class XYPlot extends Plot {
    public xScale: Abstract.Scale;
    public yScale: Abstract.Scale;
    public _xAccessor: any;
    public _yAccessor: any;

    /**
     * Creates an XYPlot.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset);
      this.classed("xy-renderer", true);

      this.project("x", "x", xScale); // default accessor
      this.project("y", "y", yScale); // default accessor
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x") {
        this.xScale = scale != null ? scale : this.xScale;
        this._xAccessor = accessor;
        this.xScale._autoNice = true;
        this.xScale._autoPad = true;
      }
      if (attrToSet === "y") {
        this.yScale = scale != null ? scale : this.yScale;
        this._yAccessor = accessor;
        this.yScale._autoNice = true;
        this.yScale._autoPad = true;
      }
      super.project(attrToSet, accessor, scale);

      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.availableWidth]);
      this.yScale.range([this.availableHeight, 0]);
      return this;
    }

    private rescale() {
      if (this.element != null) {
        this._render();
      }
    }

    public expandExtent(extent: any[], mappedData: any[], attr: string): any[] {
      switch (attr) {
        case "x":
        case "y":
        case "x0":
        case "y0":
        return Plot.includeExtent(extent, mappedData);

        default:
        return extent;
      }
    }
  }
}
}
