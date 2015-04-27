///<reference path="../../reference.ts" />

module Plottable {

  export module Plots {
    export interface StackedPlotMetadata extends PlotMetadata {
      offsets: D3.Map<number>;
    }

    export type StackedDatum = {
      key: any;
      value: number;
      offset?: number;
    }
  }

  export class Stacked<X, Y> extends XYPlot<X, Y> {
    private _stackedExtent = [0, 0];
    protected _isVertical: boolean;

    public getPlotMetadataForDataset(key: string): Plots.StackedPlotMetadata {
      var metadata = <Plots.StackedPlotMetadata> super.getPlotMetadataForDataset(key);
      metadata.offsets = d3.map();
      return metadata;
    }

    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (this.projections["x"] && this.projections["y"] && (attrToSet === "x" || attrToSet === "y")) {
        this.updateStackOffsets();
      }
      return this;
    }

    public onDatasetUpdate() {
      if (this._projectorsReady()) {
        this.updateStackOffsets();
      }
      super.onDatasetUpdate();
    }

    public updateStackOffsets() {
      var dataMapArray = this.generateDefaultMapArray();
      var domainKeys = this.getDomainKeys();

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

      this.setDatasetStackOffsets(this.stack(positiveDataMapArray), this.stack(negativeDataMapArray));
      this.updateStackExtents();
    }

    public updateStackExtents() {
      var datasets = this.datasets();
      var valueAccessor = this._valueAccessor();
      var keyAccessor = this.keyAccessor();
      var maxStackExtent = Utils.Methods.max<string, number>(this.datasetKeysInOrder, (k: string) => {
        var dataset = this.datasetKeys.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this.datasetKeys.get(k).plotMetadata;
        return Utils.Methods.max<any, number>(dataset.data(), (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset.metadata(), plotMetadata) +
            plotMetadata.offsets.get(keyAccessor(datum, i, dataset.metadata(), plotMetadata));
        }, 0);
      }, 0);

      var minStackExtent = Utils.Methods.min<string, number>(this.datasetKeysInOrder, (k: string) => {
        var dataset = this.datasetKeys.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this.datasetKeys.get(k).plotMetadata;
        return Utils.Methods.min<any, number>(dataset.data(), (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset.metadata(), plotMetadata) +
            plotMetadata.offsets.get(keyAccessor(datum, i, dataset.metadata(), plotMetadata));
        }, 0);
      }, 0);

      this._stackedExtent = [Math.min(minStackExtent, 0), Math.max(0, maxStackExtent)];
    }

    /**
     * Feeds the data through d3's stack layout function which will calculate
     * the stack offsets and use the the function declared in .out to set the offsets on the data.
     */
    public stack(dataArray: D3.Map<Plots.StackedDatum>[]): D3.Map<Plots.StackedDatum>[] {
      var outFunction = (d: Plots.StackedDatum, y0: number, y: number) => {
        d.offset = y0;
      };

      d3.layout.stack()
               .x((d) => d.key)
               .y((d) => +d.value)
               .values((d) => this.getDomainKeys().map((domainKey) => d.get(domainKey)))
               .out(outFunction)(dataArray);

      return dataArray;
    }

    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    public setDatasetStackOffsets(positiveDataMapArray: D3.Map<Plots.StackedDatum>[], negativeDataMapArray: D3.Map<Plots.StackedDatum>[]) {
      var keyAccessor = this.keyAccessor();
      var valueAccessor = this._valueAccessor();

      this.datasetKeysInOrder.forEach((k, index) => {
        var dataset = this.datasetKeys.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this.datasetKeys.get(k).plotMetadata;
        var positiveDataMap = positiveDataMapArray[index];
        var negativeDataMap = negativeDataMapArray[index];
        var isAllNegativeValues = dataset.data().every((datum, i) => valueAccessor(datum, i, dataset.metadata(), plotMetadata) <= 0);

        dataset.data().forEach((datum: any, datumIndex: number) => {
          var key = keyAccessor(datum, datumIndex, dataset.metadata(), plotMetadata);
          var positiveOffset = positiveDataMap.get(key).offset;
          var negativeOffset = negativeDataMap.get(key).offset;

          var value = valueAccessor(datum, datumIndex, dataset.metadata(), plotMetadata);
          var offset: number;
          if (!+value) {
            offset = isAllNegativeValues ? negativeOffset : positiveOffset;
          } else {
            offset = value > 0 ? positiveOffset : negativeOffset;
          }
          plotMetadata.offsets.set(key, offset);
        });
      });
    }

    public getDomainKeys(): string[] {
      var keyAccessor = this.keyAccessor();
      var domainKeys = d3.set();

      this.datasetKeysInOrder.forEach((k) => {
        var dataset = this.datasetKeys.get(k).dataset;
        var plotMetadata = this.datasetKeys.get(k).plotMetadata;
        dataset.data().forEach((datum, index) => {
          domainKeys.add(keyAccessor(datum, index, dataset.metadata(), plotMetadata));
        });
      });

      return domainKeys.values();
    }

    public generateDefaultMapArray(): D3.Map<Plots.StackedDatum>[] {
      var keyAccessor = this.keyAccessor();
      var valueAccessor = this._valueAccessor();
      var domainKeys = this.getDomainKeys();

      var dataMapArray = this.datasetKeysInOrder.map(() => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return {key: domainKey, value: 0};
        });
      });

      this.datasetKeysInOrder.forEach((k, datasetIndex) => {
        var dataset = this.datasetKeys.get(k).dataset;
        var plotMetadata = this.datasetKeys.get(k).plotMetadata;
        dataset.data().forEach((datum, index) => {
          var key = keyAccessor(datum, index, dataset.metadata(), plotMetadata);
          var value = valueAccessor(datum, index, dataset.metadata(), plotMetadata);
          dataMapArray[datasetIndex].set(key, {key: key, value: value});
        });
      });

      return dataMapArray;
    }

    public updateScaleExtents() {
      super.updateScaleExtents();
      var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
      if (!primaryScale) {
        return;
      }
      if (this._isAnchored && this._stackedExtent.length > 0) {
        primaryScale.updateExtent(this.getID().toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this._stackedExtent);
      } else {
        primaryScale._removeExtent(this.getID().toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }

    public normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      var aAccessor = this.projections[fromX ? "x" : "y"].accessor;
      var bAccessor = this.projections[fromX ? "y" : "x"].accessor;
      var aStackedAccessor = (d: any, i: number, u: any, m: Plots.StackedPlotMetadata) => {
        var value = aAccessor(d, i, u, m);
        if (this._isVertical ? !fromX : fromX) {
          value += m.offsets.get(bAccessor(d, i, u, m));
        }
        return value;
      };

      var bStackedAccessor = (d: any, i: number, u: any, m: Plots.StackedPlotMetadata) => {
        var value = bAccessor(d, i, u, m);
        if (this._isVertical ? fromX : !fromX) {
          value += m.offsets.get(aAccessor(d, i, u, m));
        }
        return value;
      };

      return Utils.Methods.flatten(this.datasetKeysInOrder.map((key: string) => {
        var dataset = this.datasetKeys.get(key).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>this.datasetKeys.get(key).plotMetadata;
        return dataset.data().map((d, i) => {
          return {
            a: aStackedAccessor(d, i, dataset.metadata(), plotMetadata),
            b: bStackedAccessor(d, i, dataset.metadata(), plotMetadata)
          };
        });
      }));
    }

    public keyAccessor(): _Accessor {
       return this._isVertical ? this.projections["x"].accessor : this.projections["y"].accessor;
    }

    public _valueAccessor(): _Accessor {
       return this._isVertical ? this.projections["y"].accessor : this.projections["x"].accessor;
    }
  }
}
