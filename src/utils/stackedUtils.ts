///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    export type StackedDatum = {
      key: any;
      value: number;
      offset?: number;
    };

    var nativeMath: Math = (<any>window).Math;

    export class Stacked {

      /**
       * Calculates the offset of each piece of data, in each dataset, relative to the baseline,
       * for drawing purposes.
       *
       * @return {Utils.Map<Dataset, d3.Map<number>>} A map from each dataset to the offset of each datapoint
       */
      public static computeStackOffsets(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>) {
        var domainKeys = Stacked.domainKeys(datasets, keyAccessor);

        var dataMapArray = Stacked._generateDefaultMapArray(datasets, keyAccessor, valueAccessor, domainKeys);

        var positiveDataMapArray: d3.Map<StackedDatum>[] = dataMapArray.map((dataMap) => {
          return Stacked._populateMap(domainKeys, (domainKey) => {
            return { key: domainKey, value: nativeMath.max(0, dataMap.get(domainKey).value) || 0 };
          });
        });

        var negativeDataMapArray: d3.Map<StackedDatum>[] = dataMapArray.map((dataMap) => {
          return Stacked._populateMap(domainKeys, (domainKey) => {
            return { key: domainKey, value: nativeMath.min(dataMap.get(domainKey).value, 0) || 0 };
          });
        });

        var posStack = Stacked._stack(positiveDataMapArray, domainKeys);
        var negStack = Stacked._stack(negativeDataMapArray, domainKeys);

        var stackOffsets = Stacked._generateStackOffsets(datasets, posStack, negStack);

        return stackOffsets;
      }

      /**
       * Calculates an extent across all datasets. The extent is a <number> interval that
       * accounts for the fact that stacked bits have to be added together when calculating the extent
       *
       * @return {[number]} The extent that spans all the stacked data
       */
      public static computeStackExtent(
          datasets: Dataset[],
          keyAccessor: Accessor<any>,
          valueAccessor: Accessor<number>,
          stackOffsets: Utils.Map<Dataset, d3.Map<StackedDatum>>,
          filter: (value: number) => boolean) {

        var positiveExtents = datasets.map((dataset: Dataset) => {
          var data = dataset.data();
          if (filter != null) {
            console.log(filter);

            data = data.filter((d, i) => {
              return filter(keyAccessor(d, i, dataset))
            });
          }
          return Utils.Math.max<any, number>(data, (datum: any, i: number) => {
            return +valueAccessor(datum, i, dataset) +
              stackOffsets.get(dataset).get(String(keyAccessor(datum, i, dataset))).offset;
          }, 0);
        });
        var maxStackExtent = Utils.Math.max(positiveExtents, 0);

        var negativeExtents = datasets.map((dataset: Dataset) => {
          var data = dataset.data();
          if (filter != null) {
            data = data.filter((d, i) => {
              return filter(keyAccessor(d, i, dataset))
            });
          }
          return Utils.Math.min<any, number>(data, (datum: any, i: number) => {
            return +valueAccessor(datum, i, dataset) +
              stackOffsets.get(dataset).get(String(keyAccessor(datum, i, dataset))).offset;
          }, 0);
        });
        var minStackExtent = Utils.Math.min(negativeExtents, 0);

        return [nativeMath.min(minStackExtent, 0), nativeMath.max(0, maxStackExtent)];
      }

      /**
       * Given an array of datasets and the accessor function for the key, computes the
       * set reunion (no duplicates) of the domain of each dataset.
       */
      public static domainKeys(datasets: Dataset[], keyAccessor: Accessor<any>) {
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
      private static _stack(dataArray: d3.Map<StackedDatum>[], domainKeys: string[]) {
        var outFunction = (d: StackedDatum, y0: number, y: number) => {
          d.offset = y0;
        };

        d3.layout.stack<d3.Map<StackedDatum>, StackedDatum>()
          .x((d) => d.key)
          .y((d) => +d.value)
          .values((d) => domainKeys.map((domainKey) => d.get(domainKey)))
          .out(outFunction)(dataArray);

        return dataArray;
      }

      private static _generateDefaultMapArray(
          datasets: Dataset[],
          keyAccessor: Accessor<any>,
          valueAccessor: Accessor<number>,
          domainKeys: string[]) {

        var dataMapArray = datasets.map(() => {
          return Stacked._populateMap(domainKeys, (domainKey) => {
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
          positiveDataStack: d3.Map<StackedDatum>[],
          negativeDataStack: d3.Map<StackedDatum>[]) {

        var stackOffsets = new Utils.Map<Dataset, d3.Map<StackedDatum>>();
        datasets.forEach((dataset, index) => {
          var datasetOffsets = d3.map<StackedDatum>();
          var positiveDataMap = positiveDataStack[index];
          var negativeDataMap = negativeDataStack[index];

          positiveDataMap.forEach((key: string, positiveStackedDatum: StackedDatum) => {
            var negativeStackedDatum = negativeDataMap.get(key);

            if (positiveStackedDatum.value !== 0) {
              datasetOffsets.set(key, positiveStackedDatum);
            } else if (negativeStackedDatum.value !== 0) {
              datasetOffsets.set(key, negativeStackedDatum);
            } else { // illegal value / undefined / null / etc
              positiveStackedDatum.value = 0; //TODO: remove
              datasetOffsets.set(key, positiveStackedDatum);
            }
          });
          stackOffsets.set(dataset, datasetOffsets);
        });
        return stackOffsets;
      }

      /**
       * Populates a map from an array of keys and a transformation function.
       *
       * @param {string[]} keys The array of keys.
       * @param {(string, number) => T} transform A transformation function to apply to the keys.
       * @return {d3.Map<T>} A map mapping keys to their transformed values.
       */
      private static _populateMap<T>(keys: string[], transform: (key: string, index: number) => T) {
        var map = d3.map<T>();
        keys.forEach((key: string, i: number) => {
          map.set(key, transform(key, i));
        });
        return map;
      }

    }
  }
}
