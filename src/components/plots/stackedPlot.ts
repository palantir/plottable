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
      var domainKeys = this._getDomainKeys();
      var datasetKeys = this._datasetKeysInOrder;
      var keyToPlotDatasetKey = this._key2PlotDatasetKey;

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

      this._setDatasetStackOffsets(
        StackedPlotUtils.stack(positiveDataMapArray, domainKeys),
        StackedPlotUtils.stack(negativeDataMapArray, domainKeys)
        );
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

    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    public _setDatasetStackOffsets(
        positiveDataMapArray: D3.Map<Plots.StackedDatum>[],
        negativeDataMapArray: D3.Map<Plots.StackedDatum>[]) {

      var stackOffsets = Stacked.prototype.generateStackOffsets.call(this, positiveDataMapArray, negativeDataMapArray);

      for (var datasetKey in stackOffsets) {
        var plotMetadata = <Plots.StackedPlotMetadata> this._key2PlotDatasetKey.get(datasetKey).plotMetadata;
        plotMetadata.offsets = stackOffsets[datasetKey];
      }
    }


    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    public generateStackOffsets(
        positiveDataMapArray: D3.Map<Plots.StackedDatum>[],
        negativeDataMapArray: D3.Map<Plots.StackedDatum>[]) {
      var orientation = this._isVertical ? "vertical" : "horizontal";
      var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
      var valueAccessor = StackedPlotUtils.valueAccessor(this, orientation);

      var stackOffsets: {[key:string]:D3.Map<number>} = {};

      this._datasetKeysInOrder.forEach((k, index) => {
        stackOffsets[k] = d3.map();
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this._key2PlotDatasetKey.get(k).plotMetadata;
        var positiveDataMap = positiveDataMapArray[index];
        var negativeDataMap = negativeDataMapArray[index];
        var isAllNegativeValues = dataset.data().every((datum, i) => valueAccessor(datum, i, dataset, plotMetadata) <= 0);

        dataset.data().forEach((datum: any, datumIndex: number) => {
          var key = String(keyAccessor(datum, datumIndex, dataset, plotMetadata));
          var positiveOffset = positiveDataMap.get(key).offset;
          var negativeOffset = negativeDataMap.get(key).offset;

          var value = valueAccessor(datum, datumIndex, dataset, plotMetadata);
          var offset: number;
          if (!+value) {
            offset = isAllNegativeValues ? negativeOffset : positiveOffset;
          } else {
            offset = value > 0 ? positiveOffset : negativeOffset;
          }
          stackOffsets[k].set(key, offset);
        });
      });
      return stackOffsets;
    }

    public _getDomainKeys(): string[] {
      var orientation = this._isVertical ? "vertical" : "horizontal";
      var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
      var domainKeys = d3.set();

      this._datasetKeysInOrder.forEach((k) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        dataset.data().forEach((datum, index) => {
          domainKeys.add(keyAccessor(datum, index, dataset, plotMetadata));
        });
      });

      return domainKeys.values();
    }

    protected _updateExtentsForProperty(property: string) {
      super._updateExtentsForProperty(property);
      if ((property === "x" || property === "y") && this._projectorsReady()) {
        this._updateStackExtents();
      }
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
