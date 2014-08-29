///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class ClusteredBar extends Abstract.NewStyleBarPlot {
    public _isVertical = true;
    private innerScale: Scale.Ordinal;

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
     */
    constructor(xScale: Abstract.Scale, yScale: Abstract.QuantitativeScale) {
      super(xScale, yScale);
      this.innerScale = new Scale.Ordinal();
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var widthF = attrToProjector["width"];
      this.innerScale.range([0, widthF(null, 0)]);
      attrToProjector["width"] = (d: any, i: number) => this.innerScale.rangeBand();
      attrToProjector["x"] = (d: any) => d._PLOTTABLE_PROTECTED_FIELD_X;
      return attrToProjector;
    }

    private cluster(accessor: _IAccessor) {
      this.innerScale.domain(this._datasetKeysInOrder);
      var lengths = this._getDatasetsInOrder().map((d) => d.data().length);
      if (_Util.Methods.uniq(lengths).length > 1) {
        _Util.Methods.warn("Warning: Attempting to cluster data when datasets are of unequal length");
      }
      var clusters: {[key: string]: any[]} = {};
      this._datasetKeysInOrder.forEach((key: string) => {
        var data = this._key2DatasetDrawerKey.get(key).dataset.data();

        clusters[key] = data.map((d, i) => {
          var val = accessor(d, i);
          d["_PLOTTABLE_PROTECTED_FIELD_X"] = this._xScale.scale(val) + this.innerScale.scale(key);
          return d;
        });
      });
      return clusters;
    }

    public _paint() {
      super._paint();
      var accessor = this._projectors["x"].accessor;
      var attrHash = this._generateAttrToProjector();
      var clusteredData = this.cluster(accessor);
      this._getDrawersInOrder().forEach((d) => d.draw(clusteredData[d.key], attrHash));
    }
  }
}
}
