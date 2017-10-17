/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import {TransformableScale} from "../scales/scale";

/**
 * Returns true iff the scale.range[1] < scale.range[0].
 */
export function isRangeReversed(scale: TransformableScale<any, number>): boolean {
  const range = scale.range();
  return range[1] < range[0];
}

/**
 * Return `value` if its distance to `center` was scaled by `zoom`.
 *
 * e.g. zoomOut(100, 2, 50) -> 150
 * e.g. zoomOut(0, 2, 50) -> -50
 * e.g. zoomOut(100, 0.5, 50) -> 75
 * e.g. zoomOut(0, 0.5, 50) -> 25
 */
export function zoomOut(value: number, zoom: number, center: number) {
  return center - (center - value) * zoom;
}

/**
 * This is the zoomOut method algebra-ed to solve for the `center` value
 * given the other three. The "target" is the return value of zoomOut.
 */
function getZoomOutCenter(value: number, zoom: number, target: number) {
  return (value * zoom - target) / (zoom - 1);
}

/**
 * Return possibly different zoomAmount and centerPoint values such that applying the zoom
 * to the scale respects the given min/max extents and values.
 */
export function constrainedZoom(
  scale: TransformableScale<any, number>,
  zoomAmount: number,
  centerPoint: number,
  minDomainExtent: number,
  maxDomainExtent: number,
  minDomainValue: number,
  maxDomainValue: number,
  ) {
  zoomAmount = constrainZoomExtents(scale, zoomAmount, minDomainExtent, maxDomainExtent);
  return constrainZoomValues(scale, zoomAmount, centerPoint, minDomainValue, maxDomainValue);
}

function constrainZoomExtents(
  scale: TransformableScale<any, number>,
  zoomAmount: number,
  minDomainExtent: number,
  maxDomainExtent: number,
) {
  const extentIncreasing = zoomAmount > 1;

  const boundingDomainExtent = extentIncreasing ? maxDomainExtent : minDomainExtent;
  if (boundingDomainExtent == null) {
    return zoomAmount;
  }

  const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();
  const domainExtent = Math.abs(scaleDomainMax - scaleDomainMin);
  const compareF = extentIncreasing ? Math.min : Math.max;
  return compareF(zoomAmount, boundingDomainExtent / domainExtent);
}

/**
 * We want to avoid scale.zoom(zoomAmount, centerPoint) returning a domain that's
 * "out of bounds", defined as:
 *
 * 1. Math.min(domain[0], domain[1]) < minDomainValue, or
 * 2. Math.max(domain[0], domain[1]) > maxDomainValue
 *
 * There's four cases to cover and what to do in each case:
 *
 * 1. Not out of bounds. Don't change zoomAmount or centerPoint.
 * 2. Out of bounds only on lower end. Don't change zoomAmount, just shift the centerPoint such that the domain min
 *    lines up with the min bounds. Be careful - you might hit case 4 after this.
 * 3. Out of bounds only on upper end. Do some as step 2.
 * 4. Out of bounds on both ends. Set the centerPoint to the center of the bounds, and zoomAmount such that the
 *    domain will perfectly line up at the bounds.
 */
export function constrainZoomValues(
  scale: TransformableScale<any, number>,
  zoomAmount: number,
  centerPoint: number,
  minDomainValue: number,
  maxDomainValue: number,
  ) {
  // when zooming in, we don't have to worry about overflowing domain
  if (zoomAmount <= 1) {
    return { centerPoint, zoomAmount };
  }

  const reversed = isRangeReversed(scale);
  // if no constraints set, we're done
  if (minDomainValue == null && maxDomainValue == null) {
    return { centerPoint, zoomAmount };
  }

  const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();

  if (maxDomainValue != null) {
    // compute max range point if zoom applied
    const maxRange = scale.scaleTransformation(maxDomainValue);
    const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
    const testMaxRange = zoomOut(currentMaxRange, zoomAmount, centerPoint);

    // move the center point to prevent max overflow, if necessary
    if (testMaxRange > maxRange != reversed) {
      centerPoint = getZoomOutCenter(currentMaxRange, zoomAmount, maxRange);
    }
  }

  if (minDomainValue != null) {
    // compute min range point if zoom applied
    const minRange = scale.scaleTransformation(minDomainValue);
    const currentMinRange = scale.scaleTransformation(scaleDomainMin);
    const testMinRange = zoomOut(currentMinRange, zoomAmount, centerPoint);

    // move the center point to prevent min overflow, if necessary
    if (testMinRange < minRange != reversed) {
      centerPoint = getZoomOutCenter(currentMinRange, zoomAmount, minRange);
    }
  }

  // add fallback to prevent overflowing both min and max
  if (minDomainValue != null && maxDomainValue != null) {
    const maxRange = scale.scaleTransformation(maxDomainValue);
    const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
    const testMaxRange = zoomOut(currentMaxRange, zoomAmount, centerPoint);

    const minRange = scale.scaleTransformation(minDomainValue);
    const currentMinRange = scale.scaleTransformation(scaleDomainMin);
    const testMinRange = zoomOut(currentMinRange, zoomAmount, centerPoint);

    // If we overflow both, use some algebra to solve for centerPoint and
    // zoomAmount that will make the domain match the min/max exactly.
    // Algebra brought to you by Wolfram Alpha.
    if (testMaxRange > maxRange != reversed && testMinRange < minRange != reversed) {
      const denominator = (currentMaxRange - currentMinRange + minRange - maxRange);
      if (denominator === 0) {
        // In this case the domains already match, so just return no-op values.
        centerPoint = (currentMaxRange + currentMinRange) / 2;
        zoomAmount = 1;
      } else {
        centerPoint = (currentMaxRange * minRange - currentMinRange * maxRange) / denominator;
        zoomAmount = (maxRange - minRange) / (currentMaxRange - currentMinRange);
      }
    }
  }

  return { centerPoint, zoomAmount };
}
