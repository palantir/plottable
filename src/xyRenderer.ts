///<reference path="reference.ts" />

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
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale, xAccessor: any = "x", yAccessor: any = "y") {
      super(dataset);
      this.classed("xy-renderer", true);

      this.project("x", xAccessor, xScale);
      this.project("y", yAccessor, yScale);
    }

    public project(attrToSet: string, accessor: any, scale?: Scale) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "x") {
        this._xAccessor = this._projectors["x"].accessor;
        if (scale != null) {
          this.xScale = this._projectors["x"].scale;
          this.xScale.registerListener(this, () => this.rescale());
          // TODO - unregister the old listener.
        }
      }
      if (attrToSet === "y") {
        this._yAccessor = this._projectors["y"].accessor;
        if (scale != null) {
          this.yScale = this._projectors["y"].scale;
          this.yScale.registerListener(this, () => this.rescale());
        }
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
