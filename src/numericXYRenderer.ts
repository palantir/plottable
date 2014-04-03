///<reference path="reference.ts" />

module Plottable {
  export class NumericXYRenderer extends XYRenderer {
    public dataSelection: D3.UpdateSelection;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    public _xAccessor: any;
    public _yAccessor: any;
    public autorangeDataOnLayout = true;

    /**
     * Creates an NumericXYRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
    constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("numeric-xy-renderer", true);
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
      var xA = this._getAppliedAccessor(this._xAccessor);
      var yA = this._getAppliedAccessor(this._yAccessor);
      var filterFunction = (d: any, i: number) => {
        var x: number = xA(d, i);
        var y: number = yA(d, i);
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
  }
}
