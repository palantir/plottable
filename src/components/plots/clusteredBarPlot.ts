///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
<<<<<<< HEAD
  export class ClusteredBar<X,Y> extends Abstract.NewStyleBarPlot<X,Y> {
    public static DEFAULT_WIDTH = 10;
||||||| merged common ancestors
  export class ClusteredBar extends Abstract.NewStyleBarPlot {
    public static DEFAULT_WIDTH = 10;
=======
  export class ClusteredBar extends Abstract.NewStyleBarPlot {

>>>>>>> api-breaking-changes
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
    constructor(xScale: Abstract.Scale<any, number>, yScale: Abstract.Scale<any, number>, isVertical = true) {
      super(xScale, yScale);
      this.innerScale = new Scale.Ordinal();
      this._isVertical = isVertical;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var widthF = attrToProjector["width"];
      this.innerScale.range([0, widthF(null, 0)]);

      var innerWidthF = (d: any, i: number) => this.innerScale.rangeBand();
      var heightF = attrToProjector["height"];
      attrToProjector["width"] = this._isVertical ? innerWidthF : heightF;
      attrToProjector["height"] = this._isVertical ? heightF : innerWidthF;

      var positionF = (d: any) => d._PLOTTABLE_PROTECTED_FIELD_POSITION;
      attrToProjector["x"] = this._isVertical ? positionF : attrToProjector["x"];
      attrToProjector["y"] = this._isVertical ? attrToProjector["y"] : positionF;

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
<<<<<<< HEAD
          var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._xScale : this._yScale;
||||||| merged common ancestors
          var primaryScale = this._isVertical ? this._xScale : this._yScale;
=======
          var primaryScale = this._isVertical ? this._xScale : this._yScale;
>>>>>>> api-breaking-changes
          d["_PLOTTABLE_PROTECTED_FIELD_POSITION"] = primaryScale.scale(val) + this.innerScale.scale(key);
          return d;
        });
      });
      return clusters;
    }

    public _paint() {
      super._paint();
      var attrHash = this._generateAttrToProjector();
      var accessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
      var clusteredData = this.cluster(accessor);
      this._getDrawersInOrder().forEach((d) => d.draw(clusteredData[d.key], attrHash));
    }
  }
}
}
