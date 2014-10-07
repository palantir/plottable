///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class ClusteredBar<X,Y> extends Abstract.BarPlot<X,Y> {
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
    constructor(xScale: Abstract.Scale<X, number>, yScale: Abstract.Scale<Y, number>, isVertical = true) {
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

    private cluster(accessor: _Accessor) {
      this.innerScale.domain(this._datasetKeysInOrder);
      var clusters: {[key: string]: any[]} = {};
      this._datasetKeysInOrder.forEach((key: string) => {
        var data = this._key2DatasetDrawerKey.get(key).dataset.data();

        clusters[key] = data.map((d, i) => {
          var val = accessor(d, i);
          var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._xScale : this._yScale;
          d["_PLOTTABLE_PROTECTED_FIELD_POSITION"] = primaryScale.scale(val) + this.innerScale.scale(key);
          return d;
        });
      });
      return clusters;
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var accessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
      var clusteredData = this.cluster(accessor);
      this._getDrawersInOrder().forEach((d) => d.draw(clusteredData[d.key], attrHash));

      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);

      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };

      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);

    }
  }
}
}
