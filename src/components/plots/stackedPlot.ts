///<reference path="../../reference.ts" />

module Plottable {

  export class Stacked<X, Y> extends XYPlot<X, Y> {
    private _stackedExtent = [0, 0];
    protected _isVertical: boolean;

    public _getPlotMetadataForDataset(key: string): Plots.StackedPlotMetadata {
      var metadata = <Plots.StackedPlotMetadata> super._getPlotMetadataForDataset(key);
      metadata.offsets = d3.map();
      return metadata;
    }

    public x(x?: number | Accessor<number> | X | Accessor<X>, scale?: Scale<X, number>): any {
      if (this._projectorsReady()) {
        this._updateStackOffsets();
      }
      return this;
    }

    public y(y?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (this._projectorsReady()) {
        this._updateStackOffsets();
      }
      return this;
    }

    public _onDatasetUpdate() {
      if (this._projectorsReady()) {
        this._updateStackOffsets();
      }
      super._onDatasetUpdate();
    }

    public _updateStackOffsets() {
      var orientation = this._isVertical ? "vertical" : "horizontal";
      var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
      var valueAccessor = StackedPlotUtils.valueAccessor(this, orientation);
      var datasetKeys = this._datasetKeysInOrder;
      var keyToPlotDatasetKey = this._key2PlotDatasetKey;
      var domainKeys = Stacked.prototype._getDomainKeys(keyAccessor, datasetKeys, keyToPlotDatasetKey);

      var dataMapArray = StackedPlotUtils.generateDefaultMapArray
        (keyAccessor, valueAccessor, domainKeys, datasetKeys, keyToPlotDatasetKey);

      var positiveDataMapArray: D3.Map<Plots.StackedDatum>[] = dataMapArray.map((dataMap) => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: Math.max(0, dataMap.get(domainKey).value) || 0 };
        });
      });

      var negativeDataMapArray: D3.Map<Plots.StackedDatum>[] = dataMapArray.map((dataMap) => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: Math.min(dataMap.get(domainKey).value, 0) || 0 };
        });
      });

      var stackOffsets = StackedPlotUtils.generateStackOffsets(
        StackedPlotUtils.stack(positiveDataMapArray, domainKeys),
        StackedPlotUtils.stack(negativeDataMapArray, domainKeys),
        keyAccessor,
        valueAccessor,
        datasetKeys,
        keyToPlotDatasetKey);

      for (var datasetKey in stackOffsets) {
        var plotMetadata = <Plots.StackedPlotMetadata> this._key2PlotDatasetKey.get(datasetKey).plotMetadata;
        plotMetadata.offsets = stackOffsets[datasetKey];
      }

      this._updateStackExtents();
    }

    public _updateStackExtents() {
      var orientation = this._isVertical ? "vertical" : "horizontal";
      var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
      var valueAccessor = StackedPlotUtils.valueAccessor(this, orientation);
      var filter = this._filterForProperty(this._isVertical ? "y" : "x");
      var maxStackExtent = Utils.Methods.max<string, number>(this._datasetKeysInOrder, (k: string) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this._key2PlotDatasetKey.get(k).plotMetadata;
        var data = dataset.data();
        if (filter != null) {
          data = data.filter((d, i) => filter(d, i, dataset, plotMetadata));
        }
        return Utils.Methods.max<any, number>(data, (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset, plotMetadata) +
            plotMetadata.offsets.get(String(keyAccessor(datum, i, dataset, plotMetadata)));
        }, 0);
      }, 0);

      var minStackExtent = Utils.Methods.min<string, number>(this._datasetKeysInOrder, (k: string) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this._key2PlotDatasetKey.get(k).plotMetadata;
        var data = dataset.data();
        if (filter != null) {
          data = data.filter((d, i) => filter(d, i, dataset, plotMetadata));
        }
        return Utils.Methods.min<any, number>(data, (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset, plotMetadata) +
            plotMetadata.offsets.get(String(keyAccessor(datum, i, dataset, plotMetadata)));
        }, 0);
      }, 0);

      this._stackedExtent = [Math.min(minStackExtent, 0), Math.max(0, maxStackExtent)];
    }

    public _getDomainKeys(
        keyAccessor: Accessor<any>,
        datasetKeys: string[],
        keyToPlotDatasetKey: D3.Map<Plots.PlotDatasetKey>
        ) {

      var domainKeys = d3.set();

      datasetKeys.forEach((k) => {
        var dataset = keyToPlotDatasetKey.get(k).dataset;
        var plotMetadata = keyToPlotDatasetKey.get(k).plotMetadata;
        dataset.data().forEach((datum, index) => {
          domainKeys.add(keyAccessor(datum, index, dataset, plotMetadata));
        });
      });

      return domainKeys.values();
    }

    protected _extentsForProperty(attr: string) {
      var extents = super._extentsForProperty(attr);
      var primaryAttr = this._isVertical ? "y" : "x";
      if (attr === primaryAttr && this._stackedExtent) {
        var clonedExtents = extents.slice();
        clonedExtents.push(this._stackedExtent);
        return clonedExtents;
      } else {
        return extents;
      }
    }

  }
}
