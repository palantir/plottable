///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  interface StackedDatum {
    key: any;
    value: number;
    offset?: number;
  }

  export class Stacked<X, Y> extends Abstract.XYPlot<X, Y> {
    private stackedExtent = [0, 0];
    public _isVertical: boolean;

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      // HACKHACK Caused since onDataSource is called before projectors are set up.  Should be fixed by #803
      if (this._datasetKeysInOrder && this._projectors["x"]  && this._projectors["y"]) {
        this.updateStackOffsets();
      }
    }

    private updateStackOffsets() {
      var dataMapArray = this.generateDefaultMapArray();
      var domainKeys = this.getDomainKeys();

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

      this.setDatasetStackOffsets(this.stack(positiveDataMapArray), this.stack(negativeDataMapArray));
      this.updateStackExtents();
    }

    private updateStackExtents() {
      var datasets = this._getDatasetsInOrder();
      var valueAccessor = this.valueAccessor();
      var maxStackExtent = _Util.Methods.max(datasets, (dataset: Dataset) => {
        return _Util.Methods.max(dataset.data(), (datum: any) => {
          return valueAccessor(datum) + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
        });
      });

      var minStackExtent = _Util.Methods.min(datasets, (dataset: Dataset) => {
        return _Util.Methods.min(dataset.data(), (datum: any) => {
          return valueAccessor(datum) + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
        });
      });

      this.stackedExtent = [Math.min(minStackExtent, 0), Math.max(0, maxStackExtent)];
    }

    /**
     * Feeds the data through d3's stack layout function which will calculate
     * the stack offsets and use the the function declared in .out to set the offsets on the data.
     */
    private stack(dataArray: D3.Map<StackedDatum>[]): D3.Map<StackedDatum>[] {
      var outFunction = (d: StackedDatum, y0: number, y: number) => {
        d.offset = y0;
      };

      d3.layout.stack()
               .x((d) => d.key)
               .y((d) => d.value)
               .values((d) => this.getDomainKeys().map((domainKey) => d.get(domainKey)))
               .out(outFunction)(dataArray);

      return dataArray;
    }

    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    private setDatasetStackOffsets(positiveDataMapArray: D3.Map<StackedDatum>[], negativeDataMapArray: D3.Map<StackedDatum>[]) {
      var keyAccessor = this.keyAccessor();
      var valueAccessor = this.valueAccessor();

      this._getDatasetsInOrder().forEach((dataset, datasetIndex) => {
        var positiveDataMap = positiveDataMapArray[datasetIndex];
        var negativeDataMap = negativeDataMapArray[datasetIndex];

        dataset.data().forEach((datum: any, datumIndex: number) => {
          var positiveOffset = positiveDataMap.get(keyAccessor(datum)).offset;
          var negativeOffset = negativeDataMap.get(keyAccessor(datum)).offset;

          datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = valueAccessor(datum) > 0 ? positiveOffset : negativeOffset;
        });
      });
    }

    private getDomainKeys(): string[] {
      var keyAccessor = this.keyAccessor();
      var domainKeys = d3.set();
      var datasets = this._getDatasetsInOrder();

      datasets.forEach((dataset) => {
        dataset.data().forEach((datum) => {
          domainKeys.add(keyAccessor(datum));
        });
      });

      return domainKeys.values();
    }

    private generateDefaultMapArray(): D3.Map<StackedDatum>[] {
      var keyAccessor = this.keyAccessor();
      var valueAccessor = this.valueAccessor();
      var datasets = this._getDatasetsInOrder();
      var domainKeys = this.getDomainKeys();

      var dataMapArray = datasets.map(() => {
        return _Util.Methods.populateMap(domainKeys, (domainKey) => {
          return {key: domainKey, value: 0};
        });
      });

      datasets.forEach((dataset, datasetIndex) => {
        dataset.data().forEach((datum) => {
          var key = keyAccessor(datum);
          var value = valueAccessor(datum);
          dataMapArray[datasetIndex].set(key, {key: key, value: value});
        });
      });

      return dataMapArray;
    }

    public _updateScaleExtents() {
      super._updateScaleExtents();
      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      if (!primaryScale) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }

    private keyAccessor(): IAppliedAccessor {
       return this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
    }

    private valueAccessor(): IAppliedAccessor {
       return this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor;
    }
  }
}
}
