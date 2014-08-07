///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class ClusteredBar extends Abstract.NewStyleBarPlot {
    public static DEFAULT_WIDTH = 10;
    public _isVertical = true;
    private innerScale: Scale.Ordinal;
    public colorScale: Scale.Color;

    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitativeScale) {
      super(dataset, xScale, yScale);
      this.innerScale = new Scale.Ordinal();
    }

    public clusterOrder(): string[];
    public clusterOrder(order: string[]): ClusteredBar;
    public clusterOrder(order?: string[]): any {
      if (order === undefined) {
        return this._datasetKeysInOrder;
      }
      this._datasetKeysInOrder = order;
      this._onDataSourceUpdate();
      return this;
    }

    public cluster(accessor: IAccessor) {
      this.innerScale.domain(this._datasetKeysInOrder);
      this.colorScale.domain(this._datasetKeysInOrder);

      var lengths = this._datasetKeysInOrder.map((e) => this._key2DatasetDrawerKey[e].dataset.data().length);
      if (Util.Methods.uniqNumbers(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to cluster data when datasets are of unequal length");
      }
      var clusters: {[key: string]: any[]} = {};
      this._datasetKeysInOrder.forEach((key: string) => {
        var data = this._key2DatasetDrawerKey[key].dataset.data();
        var vals = data.map((d) => accessor(d));

        clusters[key] = data.map((d, i) => {
          d["_PLOTTABLE_PROTECTED_FIELD_X"] = this.xScale.scale(vals[i]) + this.innerScale.scale(key);
          d["_PLOTTABLE_PROTECTED_FIELD_FILL"] = this.colorScale.scale(key);
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
      this._datasetKeysInOrder.forEach((key: string) => this._key2DatasetDrawerKey[key].drawer.draw(clusteredData[key], attrHash));
    }

    public getDrawer(key: string) {
      return new Drawer.RectDrawer(key);
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var widthF = attrToProjector["width"];
      this.innerScale.range([0, widthF(null, 0)]);
      attrToProjector["width"] = (d: any, i: number) => this.innerScale.rangeBand();

      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      var getFill = (d: any) => d._PLOTTABLE_PROTECTED_FIELD_FILL;
      var getX = (d: any) => d._PLOTTABLE_PROTECTED_FIELD_X;
      attrToProjector["fill"] = getFill;
      attrToProjector["x"] = getX;
      return attrToProjector;
    }

    // manually set colorscale for now, this should be easy to fix once the accessor changes come through
    public setColor(scale: Scale.Color) {
      this.colorScale = scale;
    }
  }
}
}
