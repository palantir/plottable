///<reference path="reference.ts" />

module Plottable {
  export class XYRenderer extends Renderer {
    public dataSelection: D3.UpdateSelection;
    public xScale: Scale;
    public yScale: Scale;
    public _xAccessor: any;
    public _yAccessor: any;
    public autorangeDataOnLayout = true;

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

      this.xScale.registerListener(() => this.rescale());
      this.yScale.registerListener(() => this.rescale());
    }

    public xAccessor(accessor: any) {
      this._xAccessor = accessor;
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
      return this;
    }

    public yAccessor(accessor: any) {
      this._yAccessor = accessor;
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
      this._hasRendered = false;
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.availableWidth]);
      this.yScale.range([this.availableHeight, 0]);
      if (this.autorangeDataOnLayout) {
        this.autorange();
      }
      return this;
    }

    /**
     * Autoranges the scales over the data.
     * Actual behavior is dependent on the scales.
     */
    public autorange() {
      super.autorange();
      var data = this._dataSource.data();
      var xA = (d: any) => this._getAppliedAccessor(this._xAccessor)(d, null);
      this.xScale.widenDomainOnData(data, xA);

      var yA = (d: any) => this._getAppliedAccessor(this._yAccessor)(d, null);
      this.yScale.widenDomainOnData(data, yA);
      return this;
    }

    private rescale() {
      if (this.element != null && this._hasRendered) {
        this._render();
      }
    }
  }
}
