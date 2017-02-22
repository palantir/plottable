/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as TickGenerators from "./tickGenerators";

export {
  TickGenerators,
};

export * from "./categoryScale";
export * from "./colorScale";
export * from "./interpolatedColorScale";
export * from "./linearScale";
export * from "./modifiedLogScale";
export * from "./timeScale";

// ---------------------------------------------------------

import { Category } from "./categoryScale";
import { Color } from "./colorScale";
import { InterpolatedColor } from "./interpolatedColorScale";
import { QuantitativeScale } from "./quantitativeScale";
import { Scale } from "./scale";
import { Time } from "./timeScale";

/**
 * A function that supplies domain values to be included into a Scale.
 *
 * @param {Scale} scale
 * @returns {D[]} An array of values that should be included in the Scale.
 */
export interface IncludedValuesProvider<D> {
  (scale: Scale<D, any>): D[];
}

/**
 * A function that supplies padding exception values for the Scale.
 * If one end of the domain is set to an excepted value as a result of autoDomain()-ing,
 * that end of the domain will not be padded.
 *
 * @param {QuantitativeScale} scale
 * @returns {D[]} An array of values that should not be padded.
 */
export interface PaddingExceptionsProvider<D> {
  (scale: QuantitativeScale<D>): D[];
}

/**
 * This interface abstracts the necessary API for implementing pan/zoom on
 * various types of scales.
 *
 * Due to some limitations of d3, for example category scales can't invert
 * screen space coordinates, we nevertheless allow the scale types to support
 * pan/zoom if they implement this interface. See `Category`'s
 * `_d3TransformationScale` for more info.
 */
export interface TransformableScale {
  /**
   * Apply the magnification with the floating point `magnifyAmount` centered
   * at the `centerValue` coordinate.
   *
   * @param {number} [magnifyAmount] The floating point zoom amount. `1.0` is
   * no zoom change.
   * @param {number} [centerValue] The coordinate of the mouse in screen
   * space.
   */
  zoom(magnifyAmount: number, centerValue: number): void;

  /**
   * Translates the scale by a number of pixels.
   *
   * @param {number} [translateAmount] The translation amount in screen space
   */
  pan(translateAmount: number): void;

  /**
   * Returns value in *screen space* for the given domain value.
   */
  scaleTransformation(value: number): number;

  /**
   * Returns the current transformed domain of the scale. This must be a
   * numerical range in the same coordinate space used for
   * `scaleTransformation`.
   */
  getTransformationDomain(): [number, number];

  /**
   * Returns value in *Transformation Space* for the provided *screen space*.
   */
  invertedTransformation(value: number): number;
}

/**
 * Type guarded function to check if the scale implements the
 * `TransformableScale` interface. Unfortunately, there is no way to do
 * runtime interface typechecking, so we have to explicitly list all classes
 * that implement the interface.
 */
export function isTransformable(scale: any): scale is TransformableScale {
  return (scale instanceof QuantitativeScale ||
  scale instanceof Category);
}

/*
 * Whether scale should be comparable intuitively.
 */
export function isNotComparable(scale1: any, scale2: any): boolean {
  const nonComparableScales = [Category, Color, InterpolatedColor];
  const selfComparableScales = [Time];

  const hasNonComparableScale = nonComparableScales.some(scale => {
    return (scale1 instanceof scale || scale2 instanceof scale);
  });

  const hasOnlyOneSelfComparableScale = selfComparableScales.some(scale => {
    const onlyFirstComparable = (scale1 instanceof scale && !(scale2 instanceof scale));
    const onlySecondComparable = (!(scale1 instanceof scale) && scale2 instanceof scale);
    return onlyFirstComparable || onlySecondComparable;
  });

  return hasNonComparableScale || hasOnlyOneSelfComparableScale;
}
