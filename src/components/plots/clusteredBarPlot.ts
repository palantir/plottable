///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class ClusteredBar extends Abstract.NewStyleBarPlot {
    public static DEFAULT_WIDTH = 10;
    private innerScale: Scale.Ordinal;

    constructor(xScale: Abstract.Scale, yScale: Abstract.Scale, isVertical = true) {
      super(xScale, yScale);
      this.innerScale = new Scale.Ordinal();
      this._isVertical = isVertical;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var widthF = attrToProjector["width"];
      this.innerScale.range([0, widthF(null, 0)]);
      attrToProjector["width"] = (d: any, i: number) => this.innerScale.rangeBand();
      attrToProjector["x"] = (d: any) => d._PLOTTABLE_PROTECTED_FIELD_POSITION;

      if (!this._isVertical) {
        this._switchHeightWidthAttributes(attrToProjector);
        attrToProjector["y"] = attrToProjector["x"];
        attrToProjector["x"] = () => 0;
      }

      return attrToProjector;
    }

    private cluster(accessor: IAccessor) {
      this.innerScale.domain(this._datasetKeysInOrder);
      var lengths = this._getDatasetsInOrder().map((d) => d.data().length);
      if (Util.Methods.uniq(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to cluster data when datasets are of unequal length");
      }
      var clusters: {[key: string]: any[]} = {};
      this._datasetKeysInOrder.forEach((key: string) => {
        var data = this._key2DatasetDrawerKey.get(key).dataset.data();

        clusters[key] = data.map((d, i) => {
          var val = accessor(d, i);
          var primaryScale = this._isVertical ? this.xScale : this.yScale;
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
