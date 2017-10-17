/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import {TransformableScale} from "../scales/scale";

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
 * Modify zoomAmount and centerPoint such that a panzoom will stay inside
 * the bounds defined by minDomainValue and maxDomainValue.
 */
function constrainZoomValues(
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

  minDomainValue = minDomainValue == null ? -Infinity : minDomainValue;
  maxDomainValue = maxDomainValue == null ? Infinity : maxDomainValue;
  const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();

  const maxRange = scale.scaleTransformation(maxDomainValue);
  const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
  const newMaxRange = zoomOut(currentMaxRange, zoomAmount, centerPoint);

  const minRange = scale.scaleTransformation(minDomainValue);
  const currentMinRange = scale.scaleTransformation(scaleDomainMin);
  const newMinRange = zoomOut(currentMinRange, zoomAmount, centerPoint);

  const minMaxLength = Math.abs(maxRange - minRange);
  const newRangeLength = Math.abs(newMaxRange - newMinRange);

  if (newRangeLength > minMaxLength) {
    // The new zoom simply won't fit. Instead just set the zoom amount to a full zoom out.
    const wantedZoomAmount = (maxRange - minRange) / (currentMaxRange - currentMinRange);
    if (wantedZoomAmount !== 1) {
      // only solve for centerPoint if wantedZoomAmount isn't 1 to prevent NaN.
      const wantedCenterPoint = getZoomOutCenter(currentMaxRange, wantedZoomAmount, maxRange);
      return {
        centerPoint: wantedCenterPoint,
        zoomAmount: wantedZoomAmount,
      };
    } else {
      // the centerPoint doesn't matter at all here but we must include it
      return {
        centerPoint,
        zoomAmount: wantedZoomAmount,
      };
    }
  } else {
    // the zoom does fit, but one end is outside. In this case just nudge the edge in
    if (newMaxRange > maxRange != reversed) {
      // prevent out of bounds on max edge.
      return {
        centerPoint: getZoomOutCenter(currentMaxRange, zoomAmount, maxRange),
        zoomAmount,
      };
    } else if (newMinRange < minRange != reversed) {
      // prevent out of bounds on min edge.
      return {
        centerPoint: getZoomOutCenter(currentMinRange, zoomAmount, minRange),
        zoomAmount,
      };
    } else {
      return { centerPoint, zoomAmount };
    }
  }
}

/**
 * Returns a new translation value that respects domain min/max value
 * constraints.
 */
export function constrainedTranslation(
  scale: TransformableScale<any, number>,
  translation: number,
  minDomainValue: number,
  maxDomainValue: number,
) {
  const [ scaleDomainMin, scaleDomainMax ] = scale.getTransformationDomain();
  const reversed = isRangeReversed(scale);

  if (translation > 0 !== reversed) {
    const bound = maxDomainValue;
    if (bound != null) {
      const currentMaxRange = scale.scaleTransformation(scaleDomainMax);
      const maxRange = scale.scaleTransformation(bound);
      translation = (reversed ? Math.max : Math.min)(currentMaxRange + translation, maxRange) - currentMaxRange;
    }
  } else {
    const bound = minDomainValue;
    if (bound != null) {
      const currentMinRange = scale.scaleTransformation(scaleDomainMin);
      const minRange = scale.scaleTransformation(bound);
      translation = (reversed ? Math.min : Math.max)(currentMinRange + translation, minRange) - currentMinRange;
    }
  }

  return translation;
}

/**
 * Returns true iff the scale.range[1] < scale.range[0].
 */
function isRangeReversed(scale: TransformableScale<any, number>): boolean {
  const range = scale.range();
  return range[1] < range[0];
}
