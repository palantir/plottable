///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export interface ClusteredPlotMetadata extends PlotMetadata {
    position: number;
  }

  export class ClusteredBar<X, Y> extends Bar<X, Y> {

    /**
     * Creates a ClusteredBarPlot.
     *
     * A ClusteredBarPlot is a plot that plots several bar plots next to each
     * other. For example, when plotting life expectancy across each country,
     * you would want each country to have a "male" and "female" bar.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     * @param {string} mode the mode of the plot.
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, mode = Bars.Mode.VERTICAL) {
      super(xScale, yScale, mode);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var innerScale = this._makeInnerScale();
      var innerWidthF = (d: any, i: number) => innerScale.rangeBand();
      attrToProjector["width"] = this._isVertical ? innerWidthF : attrToProjector["width"];
      attrToProjector["height"] = !this._isVertical ? innerWidthF : attrToProjector["height"];

      var xAttr = attrToProjector["x"];
      var yAttr = attrToProjector["y"];
      attrToProjector["x"] = (d: any, i: number, dataset: Dataset, m: ClusteredPlotMetadata) =>
        this._isVertical ? xAttr(d, i, dataset, m) + m.position : xAttr(d, i, dataset, m);
      attrToProjector["y"] = (d: any, i: number, dataset: Dataset, m: ClusteredPlotMetadata) =>
        this._isVertical ? yAttr(d, i, dataset, m) : yAttr(d, i, dataset, m) + m.position;

      return attrToProjector;
    }

    private _updateClusterPosition() {
      var innerScale = this._makeInnerScale();
      this._datasetKeysInOrder.forEach((key: string) => {
        var plotMetadata = <ClusteredPlotMetadata>this._key2PlotDatasetKey.get(key).plotMetadata;
        plotMetadata.position = innerScale.scale(key) - innerScale.rangeBand() / 2;
      });
    }

    private _makeInnerScale() {
      var innerScale = new Scales.Category();
      innerScale.domain(this._datasetKeysInOrder);
      if (!this._attrBindings.get("width")) {
        innerScale.range([0, this._getBarPixelWidth()]);
      } else {
        var projection = this._attrBindings.get("width");
        var accessor = projection.accessor;
        var scale = projection.scale;
        var fn = scale ? (d: any, i: number, dataset: Dataset, m: PlotMetadata) => scale.scale(accessor(d, i, dataset, m)) : accessor;
        innerScale.range([0, fn(null, 0, null, null)]);
      }
      return innerScale;
    }

    protected _getDataToDraw() {
      this._updateClusterPosition();
      return super._getDataToDraw();
    }

    protected _getPlotMetadataForDataset(key: string): ClusteredPlotMetadata {
      var metadata = <ClusteredPlotMetadata>super._getPlotMetadataForDataset(key);
      metadata.position = 0;
      return metadata;
    }
  }
}
}
