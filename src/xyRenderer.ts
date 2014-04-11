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
    constructor(dataset: any, xScale: Scale, yScale: Scale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
      super(dataset);
      this.classed("xy-renderer", true);

      this._xAccessor = (xAccessor != null) ? xAccessor : "x"; // default
      this._yAccessor = (yAccessor != null) ? yAccessor : "y"; // default

      this.xScale = xScale;
      this.yScale = yScale;

      this.projector("x", this._xAccessor, this.xScale);
      this.projector("y", this._yAccessor, this.yScale);

      this.xScale.registerListener(() => this.rescale());
      this.yScale.registerListener(() => this.rescale());
    }

    public projector(attrToSet: string, accessor: any, scale?: Scale) {
      super.projector(attrToSet, accessor, scale);
      if (attrToSet === "x") {
        this._xAccessor = this._projectors["x"].accessor;
        if (scale != null) {
          this.xScale = this._projectors["x"].scale;
          this.xScale.registerListener(() => this.rescale());
          // TODO - unregister the old listener.
        }
      }
      if (attrToSet === "y") {
        this._yAccessor = this._projectors["y"].accessor;
        if (scale != null) {
          this.yScale = this._projectors["y"].scale;
          this.yScale.registerListener(() => this.rescale());
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
