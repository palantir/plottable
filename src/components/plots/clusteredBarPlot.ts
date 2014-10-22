///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class ClusteredBar<X,Y> extends AbstractBarPlot<X,Y> {
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
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>, isVertical = true) {
      this._isVertical = isVertical; // Has to be set before super()
      super(xScale, yScale);
      this.innerScale = new Scale.Ordinal();
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

    public _getDataToDraw() {
      var accessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
      this.innerScale.domain(this._datasetKeysInOrder);
      var clusters: D3.Map<any[]> = d3.map();
      this._datasetKeysInOrder.forEach((key: string) => {
        var data = this._key2DatasetDrawerKey.get(key).dataset.data();

        clusters.set(key, data.map((d, i) => {
          var val = accessor(d, i);
          var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._xScale : this._yScale;
          d["_PLOTTABLE_PROTECTED_FIELD_POSITION"] = primaryScale.scale(val) + this.innerScale.scale(key);
          return d;
        }));
      });
      return clusters;
    }
  }
}
}
