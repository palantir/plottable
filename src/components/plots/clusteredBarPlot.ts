///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class ClusteredBar<X, Y> extends Bar<X, Y> {

    private _clusterOffsets: Utils.Map<Dataset, number>;

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
      this._clusterOffsets = new Utils.Map<Dataset, number>();
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
      attrToProjector["x"] = this._isVertical ?
                               (d: any, i: number, ds: Dataset, m: PlotMetadata) => xAttr(d, i, ds, m) + this._clusterOffsets.get(ds) :
                               (d: any, i: number, ds: Dataset, m: PlotMetadata) => xAttr(d, i, ds, m);
      attrToProjector["y"] = this._isVertical ?
                               (d: any, i: number, ds: Dataset, m: PlotMetadata) => yAttr(d, i, ds, m) :
                               (d: any, i: number, ds: Dataset, m: PlotMetadata) => yAttr(d, i, ds, m) + this._clusterOffsets.get(ds);

      return attrToProjector;
    }

    private _updateClusterPosition() {
      var innerScale = this._makeInnerScale();
      this.datasets().forEach((d, i) => this._clusterOffsets.set(d, innerScale.scale(String(i)) - innerScale.rangeBand() / 2));
    }

    private _makeInnerScale() {
      var innerScale = new Scales.Category();
      innerScale.domain(this.datasets().map((d, i) => String(i)));
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
  }
}
}
