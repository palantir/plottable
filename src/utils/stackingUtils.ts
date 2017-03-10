/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";
import { Accessor } from "../core/interfaces";

import * as Utils from "./";

export type GenericStackedDatum<D> = {
  value: number;
  offset: number;
  axisValue: D;
}

export type StackExtent<D> = { extent: number, axisValue: D }

export type StackedDatum = GenericStackedDatum<string>;
/**
 * Option type for stacking direction. By default, stacked bar and area charts
 * put the first data series at the bottom of the axis ("bottomup"), but this
 * can be reversed with the "topdown" option, which produces a stacking order
 * that matches the order of series in the legend.
 */
export type IStackingOrder = "topdown" | "bottomup";

// HACKHACK More accurate stacking result definition. Remove typeless stacking result
// and replace with typed stacking result in 3.0.
//
// Maps compare Date keys using referential equality. So, for safety, we only want primitives
// as keys
export type GenericStackingResult<D> = Utils.Map<Dataset, Utils.Map<string | number, GenericStackedDatum<D>>>;
/**
 * Map of Dataset to stacks.
 * @deprecated
 */
export type StackingResult = GenericStackingResult<string>;

const nativeMath: Math = (<any>window).Math;

/**
 * Computes the StackingResult (value and offset) for each data point in each Dataset.
 *
 * @param {Dataset[]} datasets The Datasets to be stacked on top of each other in the order of stacking
 * @param {Accessor<any>} keyAccessor Accessor for the key of the data
 * @param {Accessor<number>} valueAccessor Accessor for the value of the data
 * @param {IStackingOrder} stackingOrder The order of stacking (default "bottomup")
 * @return {StackingResult} value and offset for each datapoint in each Dataset
 */
export function stack(
  datasets: Dataset[],
  keyAccessor: Accessor<any>,
  valueAccessor: Accessor<number>,
  stackingOrder: IStackingOrder = "bottomup",
): StackingResult {
  const positiveOffsets = d3.map<number>();
  const negativeOffsets = d3.map<number>();
  const datasetToKeyToStackedDatum = new Utils.Map<Dataset, Utils.Map<string, StackedDatum>>();

  if (stackingOrder === "topdown") {
    datasets = datasets.slice();
    datasets.reverse();
  }

  datasets.forEach((dataset) => {
    const keyToStackedDatum = new Utils.Map<string, StackedDatum>();
    dataset.data().forEach((datum, index) => {
      const key = normalizeKey(keyAccessor(datum, index, dataset));
      const value = +valueAccessor(datum, index, dataset);
      let offset: number;
      const offsetMap = (value >= 0) ? positiveOffsets : negativeOffsets;
      if (offsetMap.has(key)) {
        offset = offsetMap.get(key);
        offsetMap.set(key, offset + value);
      } else {
        offset = 0;
        offsetMap.set(key, value);
      }
      keyToStackedDatum.set(key, {
        offset: offset,
        value: value,
        axisValue: keyAccessor(datum, index, dataset),
      });
    });
    datasetToKeyToStackedDatum.set(dataset, keyToStackedDatum);
  });
  return datasetToKeyToStackedDatum;
}

/**
 * Computes the maximum and minimum extents of each stack individually.
 *
 * @param {GenericStackingResult} stackingResult The value and offset information for each datapoint in each dataset
 * @return { { maximumExtents: Utils.Map<D, number>, minimumExtents: Utils.Map<D, number> } } The maximum and minimum extents
 * of each individual stack.
 */
export function stackedExtents<D>(stackingResult: GenericStackingResult<D>): {
  maximumExtents: Utils.Map<string | number, StackExtent<D>>,
  minimumExtents: Utils.Map<string | number, StackExtent<D>>,
} {
  const maximumExtents = new Utils.Map<string | number, StackExtent<D>>();
  const minimumExtents = new Utils.Map<string | number, StackExtent<D>>();

  stackingResult.forEach((stack) => {
    stack.forEach((datum, key) => {
      // correctly handle negative bar stacks
      const maximalValue = Utils.Math.max([datum.offset + datum.value, datum.offset], datum.offset);
      const minimalValue = Utils.Math.min([datum.offset + datum.value, datum.offset], datum.offset);

      if (!maximumExtents.has(key)) {
        maximumExtents.set(key, { extent: maximalValue, axisValue: datum.axisValue });
      } else if (maximumExtents.get(key).extent < maximalValue) {
        maximumExtents.set(key, { extent: maximalValue, axisValue: datum.axisValue });
      }

      if (!minimumExtents.has(key)) {
        minimumExtents.set(key, { extent: minimalValue, axisValue: datum.axisValue });
      } else if (minimumExtents.get(key).extent > (minimalValue)) {
        minimumExtents.set(key, { extent: minimalValue, axisValue: datum.axisValue });
      }
    });
  });

  return { maximumExtents, minimumExtents };
}

/**
 * Computes the total extent over all data points in all Datasets, taking stacking into consideration.
 *
 * @param {StackingResult} stackingResult The value and offset information for each datapoint in each dataset
 * @param {Accessor<any>} keyAccessor Accessor for the key of the data existent in the stackingResult
 * @param {Accessor<boolean>} filter A filter for data to be considered when computing the total extent
 * @return {[number, number]} The total extent
 */
export function stackedExtent(stackingResult: StackingResult, keyAccessor: Accessor<any>, filter: Accessor<boolean>) {
  const extents: number[] = [];
  stackingResult.forEach((stackedDatumMap: Utils.Map<string, StackedDatum>, dataset: Dataset) => {
    dataset.data().forEach((datum, index) => {
      if (filter != null && !filter(datum, index, dataset)) {
        return;
      }
      const stackedDatum = stackedDatumMap.get(normalizeKey(keyAccessor(datum, index, dataset)));
      extents.push(stackedDatum.value + stackedDatum.offset);
    });
  });
  const maxStackExtent = Utils.Math.max(extents, 0);
  const minStackExtent = Utils.Math.min(extents, 0);

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
