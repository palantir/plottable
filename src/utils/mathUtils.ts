/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Bounds, Point } from "../core/interfaces";
import { getHtmlElementAncestors } from "./domUtils";

const nativeMath: Math = (<any>window).Math;

/**
 * Represents the affine transformation of the computed css transform property.
 *
 * The array `m = [a b c d tx ty]` represents the homogenous affine transform
 * matrix:
 *
 *     A = | a c tx |
 *         | b d ty |
 *         | 0 0 1  |
 *
 *     A = | m[0] m[2] m[4] |
 *         | m[1] m[3] m[5] |
 *         | 0    0    1    |
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
 */
export type ICssTransformMatrix = [number, number, number, number, number, number];

const _IDENTITY_TRANSFORM: ICssTransformMatrix = [1, 0, 0, 1, 0, 0];

/**
 * Checks if x is between a and b.
 *
 * @param {number} x The value to test if in range
 * @param {number} a The beginning of the (inclusive) range
 * @param {number} b The ending of the (inclusive) range
 * @return {boolean} Whether x is in [a, b]
 */
export function inRange(x: number, a: number, b: number) {
  return (nativeMath.min(a, b) <= x && x <= nativeMath.max(a, b));
}

/**
 * Clamps x to the range [min, max].
 *
 * @param {number} x The value to be clamped.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @return {number} A clamped value in the range [min, max].
 */
export function clamp(x: number, min: number, max: number) {
  return nativeMath.min(nativeMath.max(min, x), max);
}

/**
 * Applies the accessor, if provided, to each element of `array` and returns the maximum value.
 * If no maximum value can be computed, returns defaultValue.
 */
export function max<C>(array: C[], defaultValue: C): C;
export function max<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
export function max(array: any[], firstArg: any, secondArg?: any): any {
  const accessor = typeof(firstArg) === "function" ? firstArg : null;
  const defaultValue = accessor == null ? firstArg : secondArg;
  const maxValue = accessor == null ? d3.max(array) : d3.max(array, accessor);
  return maxValue !== undefined ? maxValue : defaultValue;
}

/**
 * Applies the accessor, if provided, to each element of `array` and returns the minimum value.
 * If no minimum value can be computed, returns defaultValue.
 */
export function min<C>(array: C[], defaultValue: C): C;
export function min<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
export function min(array: any[], firstArg: any, secondArg?: any): any {
  const accessor = typeof(firstArg) === "function" ? firstArg : null;
  const defaultValue = accessor == null ? firstArg : secondArg;
  const minValue = accessor == null ? d3.min(array) : d3.min(array, accessor);
  return minValue !== undefined ? minValue : defaultValue;
}

/**
 * Returns true **only** if x is NaN
 */
export function isNaN(n: any) {
  return n !== n;
}

/**
 * Returns true if the argument is a number, which is not NaN
 * Numbers represented as strings do not pass this function
 */
export function isValidNumber(n: any) {
  return typeof n === "number" && n - n < 1;
}

/**
 * Generates an array of consecutive, strictly increasing numbers
 * in the range [start, stop) separeted by step
 */
export function range(start: number, stop: number, step = 1): number[] {
  if (step === 0) {
    throw new Error("step cannot be 0");
  }
  const length = nativeMath.max(nativeMath.ceil((stop - start) / step), 0);
  const range: number[] = [];

  for (let i = 0; i < length; ++i) {
    range[i] = start + step * i;
  }

  return range;
}

/**
 * Returns the square of the distance between two points
 *
 * @param {Point} p1
 * @param {Point} p2
 * @return {number} dist(p1, p2)^2
 */
export function distanceSquared(p1: Point, p2: Point) {
  return nativeMath.pow(p2.y - p1.y, 2) + nativeMath.pow(p2.x - p1.x, 2);
}

export function degreesToRadians(degree: number) {
  return degree / 360 * nativeMath.PI * 2;
}

/**
 * Returns if the point is within the bounds. Points along
 * the bounds are considered "within" as well.
 * @param {Point} p Point in considerations.
 * @param {Bounds} bounds Bounds within which to check for inclusion.
 */
export function within(p: Point, bounds: Bounds) {
  return bounds.topLeft.x <= p.x
    && bounds.bottomRight.x >= p.x
    && bounds.topLeft.y <= p.y
    && bounds.bottomRight.y >= p.y;
}

/**
 * Returns a `ICssTransformMatrix` representing the cumulative transformation of
 * the element and all its parents. This transform converts from top-level
 * clientX/clientY coordinates (such as document mouse events) to internal
 * component offsetX/offsetY coordinates.
 *
 * Use `applyTransform` to convert from client coordinates to element
 * coordinates, accounting for all CSS transforms applied to that element.
 *
 * Note that this handles css `transform` but does not handle css
 * `transform-origin` values other than default ("50% 50%").
 */
export function getCumulativeTransform(element: Element): ICssTransformMatrix {
  const elems = getHtmlElementAncestors(element);
  elems.reverse();

  let transform = _IDENTITY_TRANSFORM;
  for (const elem of elems) {
    // translate coordinates to client origin
    const offsetX = elem.scrollLeft - elem.offsetLeft - elem.clientLeft;
    const offsetY = elem.scrollTop - elem.offsetTop - elem.clientTop;
    transform = premultiplyTranslate([offsetX, offsetY], transform);

    // apply css transform if present
    const elementTransform = getElementTransform(elem);
    if (elementTransform != null) {
      const midX = elem.clientWidth/2;
      const midY = elem.clientHeight/2;
      transform = premultiplyTranslate([-midX, -midY], transform);
      transform = multiplyMatrix(invertMatrix(elementTransform), transform);
      transform = premultiplyTranslate([midX, midY], transform);
    }
  }
  return transform;
}

/**
 * Returns the `ICssTransformMatrix` of an element, if defined in its computed
 * style. Returns `null` if there is no transform on the element.
 */
export function getElementTransform(elem: Element): ICssTransformMatrix | null {
  const style = window.getComputedStyle(elem, null);
  const transform = style.getPropertyValue("-webkit-transform") ||
    style.getPropertyValue("-moz-transform") ||
    style.getPropertyValue("-ms-transform") ||
    style.getPropertyValue("-o-transform") ||
    style.getPropertyValue("transform");
  return parseTransform(transform);
}

/**
 * Straightforward matrix multiplication of homogenized css transform matrices.
 */
export function multiplyMatrix(a: ICssTransformMatrix, b: ICssTransformMatrix): ICssTransformMatrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/**
 * Prepends translation to transformation matrix.
 *
 * Equivalent to `multiplyMatrix([1, 0, 0, 1, ...v], b)`
 */
export function premultiplyTranslate(v: [number, number], b: ICssTransformMatrix): ICssTransformMatrix {
  return [
    b[0], b[1], b[2], b[3],
    b[4] + v[0],
    b[5] + v[1],
  ];
}

/**
 * Analytical inverse of a `ICssTransformMatrix` analogous to a non-singular
 * homogenous 3x3 matrix.
 *
 * http://mathworld.wolfram.com/MatrixInverse.html
 * https://stackoverflow.com/questions/2624422/efficient-4x4-matrix-inverse-affine-transform
 */
export function invertMatrix(a: ICssTransformMatrix): ICssTransformMatrix {
  const inverseDeterminant = 1 / (a[0] * a[3] - a[1] * a[2]);
  return [
    inverseDeterminant * a[3],
    inverseDeterminant * -a[1],
    inverseDeterminant * -a[2],
    inverseDeterminant * a[0],
    inverseDeterminant * (-a[3] * a[4] + a[2] * a[5]),
    inverseDeterminant * (a[1] * a[4] + -a[0] * a[5]),
  ];
}

/**
 * Applies the `ICssTransformMatrix` to the `Point`.
 *
 * Returns a new `Point`.
 */
export function applyTransform(a: ICssTransformMatrix, p: Point): Point {
  return {
    x: a[0] * p.x + a[2] * p.y + a[4],
    y: a[1] * p.x + a[3] * p.y + a[5],
  };
}

const _MATRIX_REGEX = /^matrix\(([^)]+)\)$/;
const _SPLIT_REGEX = /[, ]+/;

/**
 * Attempts to parse a string such as `"matrix(1, 0, 1, 1, 100, 0)"` into an
 * array such as `[1, 0, 1, 1, 100, 0]`.
 *
 * If unable to do so, `null` is returned.
 */
function parseTransform(transform: string): ICssTransformMatrix | null {
  if (transform == null || transform === "none") {
    return null;
  }

  const matrixStrings = transform.match(_MATRIX_REGEX);
  if (matrixStrings == null || matrixStrings.length < 2) {
    return null;
  }

  const matrix = matrixStrings[1].split(_SPLIT_REGEX).map((v) => parseFloat(v));
  if (matrix.length != 6){
    return null;
  }

  return matrix as ICssTransformMatrix;
}
