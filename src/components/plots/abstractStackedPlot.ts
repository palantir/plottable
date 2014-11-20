///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export interface StackedPlotMetadata extends PlotMetadata {
    offsets: (datasetKey: string) => number;
  }

  export interface StackedDatum {
    key: any;
    value: number;
  }

  export class AbstractStacked<X, Y> extends AbstractXYPlot<X, Y> {
    private stackedExtent = [0, 0];
    public _isVertical: boolean;

    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (this._projections["x"] && this._projections["y"] && (attrToSet === "x" || attrToSet === "y")) {
        this._updateStackOffsets();
      }
      return this;
    }

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      // HACKHACK Caused since onDataSource is called before projectors are set up.  Should be fixed by #803
      if (this._datasetKeysInOrder && this._projections["x"]  && this._projections["y"]) {
        this._updateStackOffsets();
      }
    }

    public _updateStackOffsets() {
      var dataMapArray = this._generateDefaultMapArray();
      var domainKeys = this._getDomainKeys();

      var positiveDataMapArray: D3.Map<StackedDatum>[] = dataMapArray.map((dataMap) => {
        return _Util.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: Math.max(0, dataMap.get(domainKey).value) };
        });
      });

      var negativeDataMapArray: D3.Map<StackedDatum>[] = dataMapArray.map((dataMap) => {
        return _Util.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: Math.min(dataMap.get(domainKey).value, 0) };
        });
      });

      this._setDatasetStackOffsets(this._stack(positiveDataMapArray), this._stack(negativeDataMapArray));
      this._updateStackExtents();
    }

    public _updateStackExtents() {
      var datasets = this.datasets();
      var valueAccessor = this._valueAccessor();
      var maxStackExtent = _Util.Methods.max<string, number>(this._datasetKeysInOrder, (k: string) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        return _Util.Methods.max<any, number>(dataset.data(), (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset.metadata(), plotMetadata) + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
        }, 0);
      }, 0);

      var minStackExtent = _Util.Methods.min<string, number>(this._datasetKeysInOrder, (k: string) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        return _Util.Methods.min<any, number>(dataset.data(), (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset.metadata(), plotMetadata) + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
        }, 0);
      }, 0);

      this.stackedExtent = [Math.min(minStackExtent, 0), Math.max(0, maxStackExtent)];
    }

    /**
     * Feeds the data through d3's stack layout function which will calculate
     * the stack offsets and use the the function declared in .out to set the offsets on the data.
     */
    public _stack(dataArray: D3.Map<StackedDatum>[]): D3.Map<StackedDatum>[] {
      var outFunction = (d: StackedDatum, y0: number, y: number) => {
        d.offset = y0;
      };

      d3.layout.stack()
               .x((d) => d.key)
               .y((d) => +d.value)
               .values((d) => this._getDomainKeys().map((domainKey) => d.get(domainKey)))
               .out(outFunction)(dataArray);

      return dataArray;
    }

    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    public _setDatasetStackOffsets(positiveDataMapArray: D3.Map<StackedDatum>[], negativeDataMapArray: D3.Map<StackedDatum>[]) {
      var keyAccessor = this._keyAccessor();
      var valueAccessor = this._valueAccessor();

      this._datasetKeysInOrder.forEach((k, index) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        var positiveDataMap = positiveDataMapArray[index];
        var negativeDataMap = negativeDataMapArray[index];
        var isAllNegativeValues = dataset.data().every((datum, i) => valueAccessor(datum, i, dataset.metadata(), plotMetadata) <= 0);

        dataset.data().forEach((datum: any, datumIndex: number) => {
          var positiveOffset = positiveDataMap.get(keyAccessor(datum, datumIndex, dataset.metadata(), plotMetadata)).offset;
          var negativeOffset = negativeDataMap.get(keyAccessor(datum, datumIndex, dataset.metadata(), plotMetadata)).offset;

          var value = valueAccessor(datum, datumIndex, dataset.metadata(), plotMetadata);
          if (value === 0) {
            datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = isAllNegativeValues ? negativeOffset : positiveOffset;
          } else {
            datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = value > 0 ? positiveOffset : negativeOffset;
          }
        });
      });
    }

    public _getDomainKeys(): string[] {
      var keyAccessor = this._keyAccessor();
      var domainKeys = d3.set();
      var datasets = this.datasets();

      this._datasetKeysInOrder.forEach((k) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        dataset.data().forEach((datum, index) => {
          domainKeys.add(keyAccessor(datum, index, dataset.metadata(), plotMetadata));
        });
      });

      return domainKeys.values();
    }

    public _generateDefaultMapArray(): D3.Map<D3.Map<StackedDatum>> {
      var keyAccessor = this._keyAccessor();
      var valueAccessor = this._valueAccessor();
      var datasets = this.datasets();
      var domainKeys = this._getDomainKeys();

      var dataMap = _Util.Methods.populateMap(this._datasetKeysInOrder, (k) => {
        return _Util.Methods.populateMap(domainKeys, (domainKey) => {
          return {key: domainKey, value: 0};
        });
      });

      this._datasetKeysInOrder.forEach((k) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        dataset.data().forEach((datum, index) => {
          var key = keyAccessor(datum, index, dataset.metadata(), plotMetadata);
          var value = valueAccessor(datum, index, dataset.metadata(), plotMetadata);
          dataMap[k].set(key, {key: key, value: value});
        });
      });

      return dataMapArray;
    }

    public _updateScaleExtents() {
      super._updateScaleExtents();
      var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
      if (!primaryScale) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }

    public _keyAccessor(): _Accessor {
       return this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;
    }

    public _valueAccessor(): _Accessor {
       return this._isVertical ? this._projections["y"].accessor : this._projections["x"].accessor;
    }
  }
}
}
