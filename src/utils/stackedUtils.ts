///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    export module Stacked {

      export type StackedDatum = {
        value: number;
        offset?: number;
      };

      var nativeMath: Math = (<any>window).Math;

      export function computeStackOffsets(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>) {
        var getKey = (datum: any, index: number, dataset: Dataset) => {
          return String(keyAccessor(datum, index, dataset));
        };

        var positiveOffsets = d3.map<number>();
        var negativeOffsets = d3.map<number>();
        var datasetToKeyToStackedDatum = new Utils.Map<Dataset, Utils.Map<string, StackedDatum>>();

        datasets.forEach((dataset) => {
          var keyToStackedDatum = new Utils.Map<string, StackedDatum>();
          dataset.data().forEach((datum, index) => {
            var key = getKey(datum, index, dataset);
            var value = +valueAccessor(datum, index, dataset);
            var offset: number;
            var offsetMap = (value >= 0) ? positiveOffsets : negativeOffsets;
            if (offsetMap.has(key)) {
              offset = offsetMap.get(key);
              offsetMap.set(key, offset + value);
            } else {
              offset = 0;
              offsetMap.set(key, value);
            }
            keyToStackedDatum.set(key, {
              value: value,
              offset: offset
            });
          });
          datasetToKeyToStackedDatum.set(dataset, keyToStackedDatum);
        });
        return datasetToKeyToStackedDatum;
      }

      export function computeStackExtent(
          stackOffsets: Utils.Map<Dataset, Utils.Map<string, StackedDatum>>,
          keyAccessor: Accessor<any>,
          filter: Accessor<boolean>) {

        var getKey = (datum: any, index: number, dataset: Dataset) => {
          return String(keyAccessor(datum, index, dataset));
        };

        var extents: number[] = [];
        stackOffsets.forEach((stackedDatumMap: Utils.Map<string, StackedDatum>, dataset: Dataset) => {
          dataset.data().forEach((datum, index) => {
            if (filter != null && !filter(datum, index, dataset)) {
              return;
            }
            var stackedDatum = stackedDatumMap.get(getKey(datum, index, dataset));
            extents.push(stackedDatum.value + stackedDatum.offset);
          })
        });
        var maxStackExtent = Utils.Math.max(extents, 0);
        var minStackExtent = Utils.Math.min(extents, 0);

        return [nativeMath.min(minStackExtent, 0), nativeMath.max(0, maxStackExtent)];
      }

      /**
       * Given an array of datasets and the accessor function for the key, computes the
       * set reunion (no duplicates) of the domain of each dataset.
       */
      export function domainKeys(datasets: Dataset[], keyAccessor: Accessor<any>) {
        var domainKeys = d3.set();
        datasets.forEach((dataset) => {
          dataset.data().forEach((datum, index) => {
            domainKeys.add(keyAccessor(datum, index, dataset));
          });
        });

        return domainKeys.values();
      }

    }
  }
}
