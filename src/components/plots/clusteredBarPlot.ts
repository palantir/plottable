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
     * @param {boolean} isVertical if the plot if vertical.
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, isVertical = true) {
      super(xScale, yScale, isVertical);
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var innerScale = this.makeInnerScale();
      var innerWidthF = (d: any, i: number) => innerScale.rangeBand();
      attrToProjector["width"] = this._isVertical ? innerWidthF : attrToProjector["width"];
      attrToProjector["height"] = !this._isVertical ? innerWidthF : attrToProjector["height"];

      var xAttr = attrToProjector["x"];
      var yAttr = attrToProjector["y"];
      attrToProjector["x"] = (d: any, i: number, u: any, m: ClusteredPlotMetadata) =>
        this._isVertical ? xAttr(d, i, u, m) + m.position : xAttr(d, u, u, m);
      attrToProjector["y"] = (d: any, i: number, u: any, m: ClusteredPlotMetadata) =>
        this._isVertical ? yAttr(d, i, u, m) : yAttr(d, i, u, m) + m.position;

      return attrToProjector;
    }

    private updateClusterPosition() {
      var innerScale = this.makeInnerScale();
      this.datasetKeysInOrder.forEach((key: string) => {
        var plotMetadata = <ClusteredPlotMetadata>this.key2PlotDatasetKey.get(key).plotMetadata;
        plotMetadata.position = innerScale.scale(key) - innerScale.rangeBand() / 2;
      });
    }

    private makeInnerScale(){
      var innerScale = new Scales.Category();
      innerScale.domain(this.datasetKeysInOrder);
      if (!this.projections["width"]) {
        innerScale.range([0, this._getBarPixelWidth()]);
      } else {
        var projection = this.projections["width"];
        var accessor = projection.accessor;
        var scale = projection.scale;
        var fn = scale ? (d: any, i: number, u: any, m: PlotMetadata) => scale.scale(accessor(d, i, u, m)) : accessor;
        innerScale.range([0, fn(null, 0, null, null)]);
      }
      return innerScale;
    }

    protected getDataToDraw() {
      this.updateClusterPosition();
      return super.getDataToDraw();
    }

    protected getPlotMetadataForDataset(key: string): ClusteredPlotMetadata {
      var metadata = <ClusteredPlotMetadata>super.getPlotMetadataForDataset(key);
      metadata.position = 0;
      return metadata;
    }
  }
}
}
