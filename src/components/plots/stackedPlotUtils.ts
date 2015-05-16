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

  export class StackedPlotUtils {

    public static updateStackExtents(
      keyAccessor: Accessor<any>,
      valueAccessor: Accessor<any>,
      datasetKeys: string[],
      keyToPlotDatasetKey: D3.Map<Plots.PlotDatasetKey>,
      filter: Accessor<boolean>) {

      var maxStackExtent = Utils.Methods.max<string, number>(datasetKeys, (k: string) => {
        var dataset = keyToPlotDatasetKey.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>keyToPlotDatasetKey.get(k).plotMetadata;
        var data = dataset.data();
        if (filter != null) {
          data = data.filter((d, i) => filter(d, i, dataset, plotMetadata));
        }
        return Utils.Methods.max<any, number>(data, (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset, plotMetadata) +
            plotMetadata.offsets.get(String(keyAccessor(datum, i, dataset, plotMetadata)));
        }, 0);
      }, 0);

      var minStackExtent = Utils.Methods.min<string, number>(datasetKeys, (k: string) => {
        var dataset = keyToPlotDatasetKey.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>keyToPlotDatasetKey.get(k).plotMetadata;
        var data = dataset.data();
        if (filter != null) {
          data = data.filter((d, i) => filter(d, i, dataset, plotMetadata));
        }
        return Utils.Methods.min<any, number>(data, (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset, plotMetadata) +
            plotMetadata.offsets.get(String(keyAccessor(datum, i, dataset, plotMetadata)));
        }, 0);
      }, 0);

      return [Math.min(minStackExtent, 0), Math.max(0, maxStackExtent)];
    }

    public static stackedPlotMetadata(metadata: Plots.PlotMetadata) {
      var stackedMetadata = <Plots.StackedPlotMetadata> metadata;
      stackedMetadata.offsets = d3.map();
      return stackedMetadata;
    }

    /**
     * Feeds the data through d3's stack layout function which will calculate
     * the stack offsets and use the the function declared in .out to set the offsets on the data.
     */
    public static stack(dataArray: D3.Map<Plots.StackedDatum>[], domainKeys: string[]) {
      var outFunction = (d: Plots.StackedDatum, y0: number, y: number) => {
        d.offset = y0;
      };

      d3.layout.stack()
        .x((d) => d.key)
        .y((d) => +d.value)
        .values((d) => domainKeys.map((domainKey) => d.get(domainKey)))
        .out(outFunction)(dataArray);

      return dataArray;
    }

    public static generateDefaultMapArray(
        keyAccessor: Accessor<any>,
        valueAccessor: Accessor<any>,
        domainKeys: string[],
        datasetKeys: string[],
        keyToPlotDatasetKey: D3.Map<Plots.PlotDatasetKey>) {

      var dataMapArray = datasetKeys.map(() => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: 0 };
        });
      });

      datasetKeys.forEach((key, datasetIndex) => {
        var dataset = keyToPlotDatasetKey.get(key).dataset;
        var plotMetadata = keyToPlotDatasetKey.get(key).plotMetadata;
        dataset.data().forEach((datum, index) => {
          var key = String(keyAccessor(datum, index, dataset, plotMetadata));
          var value = valueAccessor(datum, index, dataset, plotMetadata);
          dataMapArray[datasetIndex].set(key, { key: key, value: value });
        });
      });

      return dataMapArray;
    }

    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    public static generateStackOffsets(
      positiveDataMapArray: D3.Map<Plots.StackedDatum>[],
      negativeDataMapArray: D3.Map<Plots.StackedDatum>[],
      keyAccessor: Accessor<any>,
      valueAccessor: Accessor<any>,
      datasetKeys: string[],
      keyToPlotDatasetKey: D3.Map<Plots.PlotDatasetKey>) {

      var stackOffsets: { [key: string]: D3.Map<number> } = {};

      datasetKeys.forEach((k, index) => {
        stackOffsets[k] = d3.map();
        var dataset = keyToPlotDatasetKey.get(k).dataset;
        var plotMetadata = <Plots.StackedPlotMetadata>keyToPlotDatasetKey.get(k).plotMetadata;
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

    public static getDomainKeys(
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

    public static keyAccessor(plot: XYPlot<any, any>, orientation: string) {
      return orientation === "vertical" ? plot.x().accessor : plot.y().accessor;
    }

    public static valueAccessor(plot: XYPlot<any, any>, orientation: string) {
      return orientation === "vertical" ? plot.y().accessor : plot.x().accessor;
    }

  }
}
