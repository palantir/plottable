///<reference path="reference.ts" />

module Plottable {
  export class XYRenderer extends Renderer {
    public dataSelection: D3.UpdateSelection;
    private static defaultXAccessor = (d: any) => d.x;
    private static defaultYAccessor = (d: any) => d.y;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    public xAccessor: IAccessor;
    public yAccessor: IAccessor;

    /**
     * Creates an XYRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
      super(dataset);
      this.classed("xy-renderer", true);

      this.xAccessor = (xAccessor != null) ? xAccessor : XYRenderer.defaultXAccessor;
      this.yAccessor = (yAccessor != null) ? yAccessor : XYRenderer.defaultYAccessor;

      this.xScale = xScale;
      this.yScale = yScale;

      var data = dataset.data;

      var appliedXAccessor = (d: any) => this.xAccessor(d, null, this._metadata);
      var xDomain = d3.extent(data, appliedXAccessor);
      this.xScale.widenDomain(xDomain);

      var appliedYAccessor = (d: any) => this.yAccessor(d, null, this._metadata);
      var yDomain = d3.extent(data, appliedYAccessor);
      this.yScale.widenDomain(yDomain);

      this.xScale.registerListener(() => this.rescale());
      this.yScale.registerListener(() => this.rescale());
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.availableWidth]);
      this.yScale.range([this.availableHeight, 0]);
      return this;
    }

    /**
     * Converts a SelectionArea with pixel ranges to one with data ranges.
     *
     * @param {SelectionArea} pixelArea The selected area, in pixels.
     * @returns {SelectionArea} The corresponding selected area in the domains of the scales.
     */
    public invertXYSelectionArea(pixelArea: SelectionArea): SelectionArea {
      var xMin = this.xScale.invert(pixelArea.xMin);
      var xMax = this.xScale.invert(pixelArea.xMax);
      var yMin = this.yScale.invert(pixelArea.yMin);
      var yMax = this.yScale.invert(pixelArea.yMax);
      var dataArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
      return dataArea;
    }

    private getDataFilterFunction(dataArea: SelectionArea): (d: any, i: number) => boolean {
      var filterFunction = (d: any, i: number) => {
        var x = this.xAccessor(d, i, this._metadata);
        var y = this.yAccessor(d, i, this._metadata);
        return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
      };
      return filterFunction;
    }

    /**
     * Gets the data in a selected area.
     *
     * @param {SelectionArea} dataArea The selected area.
     * @returns {D3.UpdateSelection} The data in the selected area.
     */
    public getSelectionFromArea(dataArea: SelectionArea) {
      var filterFunction = this.getDataFilterFunction(dataArea);
      return this.dataSelection.filter(filterFunction);
    }

    /**
     * Gets the indices of data in a selected area
     *
     * @param {SelectionArea} dataArea The selected area.
     * @returns {number[]} An array of the indices of datapoints in the selected area.
     */
    public getDataIndicesFromArea(dataArea: SelectionArea): number[] {
      var filterFunction = this.getDataFilterFunction(dataArea);
      var results: number[] = [];
      this._data.forEach((d, i) => {
        if (filterFunction(d, i)) {
          results.push(i);
        }
      });
      return results;
    }

    private rescale() {
      if (this.element != null) {
        this._render();
      }
    }
  }
}
