///<reference path="reference.ts" />

module Plottable {
  export class CategoryRenderer extends Renderer {
    public dataSelection: D3.UpdateSelection;
    public xScale: OrdinalScale;
    public yScale: QuantitiveScale;
    public _xAccessor: any;
    public _yAccessor: any;
    public autorangeDataOnLayout = true;

    /**
     * Creates a CategoryRenderer with an Ordinal x scale and Quantitive y scale.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
    constructor(dataset: IDataset,
                xScale: OrdinalScale,
                yScale: QuantitiveScale,
                xAccessor?: IAccessor,
                yAccessor?: IAccessor) {
      super(dataset);
      this.classed("category-renderer", true);

      this.xScale = xScale;
      this.yScale = yScale;

      this._xAccessor = (xAccessor != null) ? xAccessor : "x"; // default
      this._yAccessor = (yAccessor != null) ? yAccessor : "y"; // default

      this.xScale.registerListener(() => this.rescale());
      this.yScale.registerListener(() => this.rescale());
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.availableWidth]);
      this.yScale.range([this.availableHeight, 0]);
      if (this.autorangeDataOnLayout) {
        this.autorange();
      }
      return this;
    }

    public autorange() {
      super.autorange();
      var data = this._data;
      var xA = (d: any) => this._getAppliedAccessor(this._xAccessor)(d, null);
      this.xScale.domain(data.map(xA));

      var yA = (d: any) => this._getAppliedAccessor(this._yAccessor)(d, null);
      var yDomain: number[] = d3.extent(data, yA);
      this.yScale.widenDomain(yDomain);
      return this;
    }

    private rescale() {
      if (this.element != null) {
        this._render();
      }
    }
  }
}
