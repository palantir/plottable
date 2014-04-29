///<reference path="../../reference.ts" />

module Plottable {
  export class XYRenderer extends Renderer {
    public dataSelection: D3.UpdateSelection;
    public xScale: Scale;
    public yScale: Scale;
    public _xAccessor: any;
    public _yAccessor: any;

    /**
     * Creates an XYRenderer.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset);
      this.classed("xy-renderer", true);

      this.project("x", "x", xScale); // default accessor
      this.project("y", "y", yScale); // default accessor
    }

    public project(attrToSet: string, accessor: any, scale?: Scale) {
      super.project(attrToSet, accessor, scale);
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x") {
        this._xAccessor = this._projectors["x"].accessor;
        this.xScale = this._projectors["x"].scale;
        this.xScale._autoNice = true;
        this.xScale._autoPad  = true;
      }
      if (attrToSet === "y") {
        this._yAccessor = this._projectors["y"].accessor;
        this.yScale = this._projectors["y"].scale;
        this.yScale._autoNice = true;
        this.yScale._autoPad  = true;
      }
      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
      this._hasRendered = false;
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.availableWidth]);
      this.yScale.range([this.availableHeight, 0]);
      return this;
    }

    private rescale() {
      if (this.element != null && this._hasRendered) {
        this._render();
      }
    }
  }
}
