///<reference path="../../reference.ts" />

module Plottable {

  export module Plots {
    export type StackedDatum = {
      key: any;
      value: number;
      offset?: number;
    }
  }

  export class StackedPlotUtils {

    /**
     * Calculates an extent across all datasets. The extent is a <number> interval that
     * accounts for the fact that stacked bits have to be added together when calculating the extent
     *
     * @return {[number]} The extent that spans all the stacked data
     */
    public static computeStackExtents(
        datasets: Dataset[],
        keyAccessor: Accessor<any>,
        valueAccessor: Accessor<any>,
        stackOffsets: Utils.Map<Dataset, D3.Map<number>>,
        filter: Accessor<boolean>) {

      var maxStackExtent = Utils.Methods.max<Dataset, number>(datasets, (dataset: Dataset) => {
        var data = dataset.data();
        if (filter != null) {
          data = data.filter((d, i) => filter(d, i, dataset));
        }
        return Utils.Methods.max<any, number>(data, (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset) +
            stackOffsets.get(dataset).get(String(keyAccessor(datum, i, dataset)));
        }, 0);
      }, 0);

      var minStackExtent = Utils.Methods.min<Dataset, number>(datasets, (dataset: Dataset) => {
        var data = dataset.data();
        if (filter != null) {
          data = data.filter((d, i) => filter(d, i, dataset));
        }
        return Utils.Methods.min<any, number>(data, (datum: any, i: number) => {
          return +valueAccessor(datum, i, dataset) +
            stackOffsets.get(dataset).get(String(keyAccessor(datum, i, dataset)));
        }, 0);
      }, 0);

      return [Math.min(minStackExtent, 0), Math.max(0, maxStackExtent)];
    }

    /**
     *
     * Calculates the offset of each piece data, in each dataset, relative to the baseline,
     * for drawing purposes.
     *
     * @return {Utils.Map<Dataset, D3.Map<number>>} A map from each dataset to the offset of each datapoint
     */
    public static computeStackOffsets(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<any>) {
      var domainKeys = StackedPlotUtils.getDomainKeys(datasets, keyAccessor);

      var dataMapArray = StackedPlotUtils._generateDefaultMapArray(datasets, keyAccessor, valueAccessor, domainKeys);

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

      var stackOffsets = StackedPlotUtils._generateStackOffsets(
        datasets,
        StackedPlotUtils._stack(positiveDataMapArray, domainKeys),
        StackedPlotUtils._stack(negativeDataMapArray, domainKeys),
        keyAccessor,
        valueAccessor);

      return stackOffsets;
    }

    public static checkSameDomainForStacks(datasets: Dataset[], keyAccessor: Accessor<any>) {
      var keySets = datasets.map((dataset) => {
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset).toString())).values();
      });
      var domainKeys = StackedPlotUtils.getDomainKeys(datasets, keyAccessor);

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        Utils.Methods.warn("the domains across the datasets are not the same. Plot may produce unintended behavior.");
      }
    }

    /**
     * Given an array of datasets and the accessor function for the key, computes the
     * set reunion (no duplicates) of the domain of each dataset.
     */
    public static getDomainKeys(datasets: Dataset[], keyAccessor: Accessor<any>) {
      var domainKeys = d3.set();
      datasets.forEach((dataset) => {
        dataset.data().forEach((datum, index) => {
          domainKeys.add(keyAccessor(datum, index, dataset));
        });
      });

      return domainKeys.values();
    }

    /**
     * Feeds the data through d3's stack layout function which will calculate
     * the stack offsets and use the the function declared in .out to set the offsets on the data.
     */
    private static _stack(dataArray: D3.Map<Plots.StackedDatum>[], domainKeys: string[]) {
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

    private static _generateDefaultMapArray(
        datasets: Dataset[],
        keyAccessor: Accessor<any>,
        valueAccessor: Accessor<any>,
        domainKeys: string[]) {

      var dataMapArray = datasets.map(() => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: 0 };
        });
      });

      datasets.forEach((dataset, datasetIndex) => {
        dataset.data().forEach((datum, index) => {
          var key = String(keyAccessor(datum, index, dataset));
          var value = valueAccessor(datum, index, dataset);
          dataMapArray[datasetIndex].set(key, { key: key, value: value });
        });
      });

      return dataMapArray;
    }

    /**
     * After the stack offsets have been determined on each separate dataset, the offsets need
     * to be determined correctly on the overall datasets
     */
    private static _generateStackOffsets(
        datasets: Dataset[],
        positiveDataMapArray: D3.Map<Plots.StackedDatum>[],
        negativeDataMapArray: D3.Map<Plots.StackedDatum>[],
        keyAccessor: Accessor<any>,
        valueAccessor: Accessor<any>) {

      var stackOffsets = new Utils.Map<Dataset, D3.Map<number>>();
      datasets.forEach((dataset, index) => {
        var datasetOffsets = d3.map();
        var positiveDataMap = positiveDataMapArray[index];
        var negativeDataMap = negativeDataMapArray[index];
        var isAllNegativeValues = dataset.data().every((datum, i) => valueAccessor(datum, i, dataset) <= 0);

        dataset.data().forEach((datum: any, datumIndex: number) => {
          var key = String(keyAccessor(datum, datumIndex, dataset));
          var positiveOffset = positiveDataMap.get(key).offset;
          var negativeOffset = negativeDataMap.get(key).offset;

          var value = valueAccessor(datum, datumIndex, dataset);
          var offset: number;
          if (!+value) {
            offset = isAllNegativeValues ? negativeOffset : positiveOffset;
          } else {
            offset = value > 0 ? positiveOffset : negativeOffset;
          }
          datasetOffsets.set(key, offset);
        });

        stackOffsets.set(dataset, datasetOffsets);
      });
      return stackOffsets;
    }
  }
}
