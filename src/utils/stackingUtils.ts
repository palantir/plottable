module Plottable {
export module Utils {
  export module Stacking {

    export type StackedDatum = {
      value: number;
      offset: number;
    };

    export type StackingResult = Utils.Map<Dataset, Utils.Map<string, StackedDatum>>;

    let nativeMath: Math = (<any>window).Math;

    /**
     * Computes the StackingResult (value and offset) for each data point in each Dataset.
     *
     * @param {Dataset[]} datasets The Datasets to be stacked on top of each other in the order of stacking
     * @param {Accessor<any>} keyAccessor Accessor for the key of the data
     * @param {Accessor<number>} valueAccessor Accessor for the value of the data
     * @return {StackingResult} value and offset for each datapoint in each Dataset
     */
    export function stack(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>): StackingResult {
      let positiveOffsets = d3.map<number>();
      let negativeOffsets = d3.map<number>();
      let datasetToKeyToStackedDatum = new Utils.Map<Dataset, Utils.Map<string, StackedDatum>>();

      datasets.forEach((dataset) => {
        let keyToStackedDatum = new Utils.Map<string, StackedDatum>();
        dataset.data().forEach((datum, index) => {
          let key = normalizeKey(keyAccessor(datum, index, dataset));
          let value = +valueAccessor(datum, index, dataset);
          let offset: number;
          let offsetMap = (value >= 0) ? positiveOffsets : negativeOffsets;
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

    /**
     * Computes the total extent over all data points in all Datasets, taking stacking into consideration.
     *
     * @param {StackingResult} stackingResult The value and offset information for each datapoint in each dataset
     * @oaram {Accessor<any>} keyAccessor Accessor for the key of the data existent in the stackingResult
     * @param {Accessor<boolean>} filter A filter for data to be considered when computing the total extent
     * @return {[number, number]} The total extent
     */
    export function stackedExtent(stackingResult: StackingResult, keyAccessor: Accessor<any>, filter: Accessor<boolean>) {
      let extents: number[] = [];
      stackingResult.forEach((stackedDatumMap: Utils.Map<string, StackedDatum>, dataset: Dataset) => {
        dataset.data().forEach((datum, index) => {
          if (filter != null && !filter(datum, index, dataset)) {
            return;
          }
          let stackedDatum = stackedDatumMap.get(normalizeKey(keyAccessor(datum, index, dataset)));
          extents.push(stackedDatum.value + stackedDatum.offset);
        });
      });
      let maxStackExtent = Utils.Math.max(extents, 0);
      let minStackExtent = Utils.Math.min(extents, 0);

      return [nativeMath.min(minStackExtent, 0), nativeMath.max(0, maxStackExtent)];
    }

    /**
     * Normalizes a key used for stacking
     *
     * @param {any} key The key to be normalized
     * @return {string} The stringified key
     */
    export function normalizeKey(key: any) {
      return String(key);
    }

  }
}
}
