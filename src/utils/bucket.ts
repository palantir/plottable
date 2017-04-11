/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

/**
 * This class keeps track of bucketing state while collapsing dense line
 * geometry in a line and area plots.
 */
export class Bucket {
  private bucketValue: number;
  private entryIndex: number;
  private exitIndex: number;
  private minValue: number;
  private maxValue: number;
  private minIndex: number;
  private maxIndex: number;

  constructor(
    index: number,
    xValue: number,
    yValue: number,
  ) {
    this.entryIndex = index;
    this.exitIndex = index;
    this.minIndex = index;
    this.maxIndex = index;

    this.bucketValue = xValue;
    this.minValue = yValue;
    this.maxValue = yValue;
  }

  public isInBucket(value: number) {
    return value == this.bucketValue;
  }

  public addToBucket(value: number, index: number) {
    if (value < this.minValue) {
      this.minValue = value;
      this.minIndex = index;
    }

    if (value > this.maxValue) {
      this.maxValue = value;
      this.maxIndex = index;
    }

    this.exitIndex = index;
  }

  public getUniqueIndices(): number[] {
    const idxs = [this.entryIndex, this.maxIndex, this.minIndex, this.exitIndex];
    return idxs.filter((idx, i) => i == 0 || idx != idxs[i - 1]);
  }
}
