/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";
import { IAccessor } from "../core/interfaces";

import type { MemoizedFunction } from "lodash";
import memoize from "lodash-es/memoize";
import * as Utils from "./";
import { makeEnum } from "./makeEnum";

export type GenericStackedDatum<D> = {
  value: number;
  offset: number;
  axisValue: D;

  originalDatum: any;
  originalIndex: number;
  originalDataset: Dataset;
};

export type StackExtent<D> = {
  extent: number;
  axisValue: D;
  stackedDatum: GenericStackedDatum<D>;
};

export type StackedDatum = GenericStackedDatum<string>;
/**
 * Option type for stacking direction. By default, stacked bar and area charts
 * put the first data series at the bottom of the axis ("bottomup"), but this
 * can be reversed with the "topdown" option, which produces a stacking order
 * that matches the order of series in the legend.
 */
export const IStackingOrder = makeEnum(["topdown", "bottomup"]);
export type IStackingOrder = keyof typeof IStackingOrder;

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
  keyAccessor: IAccessor<any>,
  valueAccessor: IAccessor<number>,
  stackingOrder: IStackingOrder = "bottomup",
): StackingResult {
  const positiveOffsets = d3.map<number>();
  const negativeOffsets = d3.map<number>();
  const datasetToKeyToStackedDatum = new Utils.Map<Dataset, Utils.Map<string, StackedDatum>>();

  if (stackingOrder === "topdown") {
    datasets = datasets.slice();
    datasets.reverse();
  }

  for (const dataset of datasets) {
    const keyToStackedDatum = new Utils.Map<string, StackedDatum>();
    const data = dataset.data();
    const dataLen = data.length;
    for (let index = 0; index < dataLen; index++) {
      const datum = data[index];
      const accessedKey = keyAccessor(datum, index, dataset);
      const key = normalizeKey(accessedKey);
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
        axisValue: accessedKey,
        originalDatum: datum,
        originalDataset: dataset,
        originalIndex: index,
      });
    }
    datasetToKeyToStackedDatum.set(dataset, keyToStackedDatum);
  }
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
    stack.forEach((datum: GenericStackedDatum<D>, key) => {
      // correctly handle negative bar stacks
      const offsetValue = datum.offset + datum.value;
      const maximalValue = Utils.Math.max([offsetValue, datum.offset], datum.offset);
      const minimalValue = Utils.Math.min([offsetValue, datum.offset], datum.offset);

      const { axisValue } = datum;

      if (!maximumExtents.has(key)) {
        maximumExtents.set(key, { extent: maximalValue, axisValue, stackedDatum: datum });
      } else if (maximumExtents.get(key).extent < maximalValue) {
        maximumExtents.set(key, { extent: maximalValue, axisValue, stackedDatum: datum });
      }

      if (!minimumExtents.has(key)) {
        minimumExtents.set(key, { extent: minimalValue, axisValue, stackedDatum: datum });
      } else if (minimumExtents.get(key).extent > (minimalValue)) {
        minimumExtents.set(key, { extent: minimalValue, axisValue, stackedDatum: datum });
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
export function stackedExtent(stackingResult: StackingResult, keyAccessor: IAccessor<any>, filter: IAccessor<boolean>) {
  const extents: number[] = [];
  stackingResult.forEach((stackedDatumMap: Utils.Map<string, StackedDatum>, dataset: Dataset) => {
    const data = dataset.data();
    const dataLen = data.length;
    for (let index = 0; index < dataLen; index++) {
      const datum = data[index];
      if (filter != null && !filter(datum, index, dataset)) {
        continue;
      }
      const stackedDatum = stackedDatumMap.get(normalizeKey(keyAccessor(datum, index, dataset)));
      extents.push(stackedDatum.value + stackedDatum.offset);
    }
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
export const normalizeKey = memoize((key: any) => {
  return String(key);
}) as ((key: any) => string) & MemoizedFunction;
