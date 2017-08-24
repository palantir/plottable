/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { IEntityBounds, Range, SimpleSelection } from "../core/interfaces";
import { ICssTransformMatrix } from "./mathUtils";

const nativeMath: Math = (<any>window).Math;

/**
 * Returns whether the child is in fact a child of the parent
 */
export function contains(parent: Element, child: Element): boolean {
  let maybeParent = child;
  while (maybeParent != null && maybeParent !== parent) {
    maybeParent = maybeParent.parentNode as Element;
  }

  return maybeParent === parent;
}

/**
 * Gets the bounding box of an element.
 * @param {d3.Selection} element
 * @returns {SVGRed} The bounding box.
 */
export function elementBBox(element: SimpleSelection<any>) {
  let bbox: SVGRect;
  // HACKHACK: Firefox won't correctly measure nodes with style "display: none" or their descendents (FF Bug 612118).
  try {
    bbox = (<any> element.node()).getBBox();
  } catch (err) {
    bbox = { x: 0, y: 0, width: 0, height: 0 };
  }
  return bbox;
}

export function entityBounds(element: Element): IEntityBounds {
  if (element instanceof SVGElement) {
    return elementBBox(d3.select(element));
  } else if (element instanceof HTMLElement) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  } else {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/**
 * Screen refresh rate which is assumed to be 60fps
 */
export let SCREEN_REFRESH_RATE_MILLISECONDS = 1000 / 60;

/**
 * Polyfill for `window.requestAnimationFrame`.
 * If the function exists, then we use the function directly.
 * Otherwise, we set a timeout on `SCREEN_REFRESH_RATE_MILLISECONDS` and then perform the function.
 *
 * @param {() => void} callback The callback to call in the next animation frame
 */
export function requestAnimationFramePolyfill(callback: () => void) {
  if (window.requestAnimationFrame != null) {
    window.requestAnimationFrame(callback);
  } else {
    setTimeout(callback, SCREEN_REFRESH_RATE_MILLISECONDS);
  }
}

/**
 * Calculates the width of the element.
 * The width includes the padding and the border on the element's left and right sides.
 *
 * @param {Element} element The element to query
 * @returns {number} The width of the element.
 */
export function elementWidth(elementOrSelection: Element | d3.Selection<Element, any, any, any>) {
  const element = elementOrSelection instanceof d3.selection
    ? (elementOrSelection as d3.Selection<HTMLElement, any, any, any>).node()
    : (elementOrSelection as Element);
  const style = window.getComputedStyle(element);
  return _parseStyleValue(style, "width")
    + _parseStyleValue(style, "padding-left")
    + _parseStyleValue(style, "padding-right")
    + _parseStyleValue(style, "border-left-width")
    + _parseStyleValue(style, "border-right-width");
}

/**
 * Calculates the height of the element.
 * The height includes the padding the and the border on the element's top and bottom sides.
 *
 * @param {Element} element The element to query
 * @returns {number} The height of the element
 */
export function elementHeight(elementOrSelection: Element | d3.Selection<Element, any, any, any>) {
  const element = elementOrSelection instanceof d3.selection
    ? (elementOrSelection as d3.Selection<HTMLElement, any, any, any>).node()
    : (elementOrSelection as Element);
  const style = window.getComputedStyle(element);
  return _parseStyleValue(style, "height")
    + _parseStyleValue(style, "padding-top")
    + _parseStyleValue(style, "padding-bottom")
    + _parseStyleValue(style, "border-top-width")
    + _parseStyleValue(style, "border-bottom-width");
}

// taken from the BNF at https://www.w3.org/TR/SVG/coords.html
const WSP = "\\s";
const NUMBER = "(?:[-+]?[0-9]*\\.?[0-9]+)";
const COMMA_WSP = `(?:(?:${WSP}+,?${WSP}*)|(?:,${WSP}*))`;
const TRANSLATE_REGEX = new RegExp(`translate${WSP}*\\(${WSP}*(${NUMBER})(?:${COMMA_WSP}(${NUMBER}))?${WSP}*\\)`);
const ROTATE_REGEX = new RegExp(`rotate${WSP}*\\(${WSP}*(${NUMBER})${WSP}*\\)`);
const SCALE_REGEX = new RegExp(`scale${WSP}*\\(${WSP}*(${NUMBER})(?:${COMMA_WSP}(${NUMBER}))?${WSP}*\\)`);

/**
 * Accepts selections whose .transform contain a "translate(a, b)" and extracts the a and b
 */
export function getTranslateValues(el: SimpleSelection<any>): [number, number] {
  const match = TRANSLATE_REGEX.exec(el.attr("transform"));
  if (match != null) {
    const [, translateX, translateY = 0] = match;
    return [+translateX, +translateY];
  } else {
    return [0, 0];
  }
}
/**
 * Accepts selections whose .transform contain a "rotate(angle)" and returns the angle
 */
export function getRotate(el: SimpleSelection<any>): number {
  const match = ROTATE_REGEX.exec(el.attr("transform"));
  if (match != null) {
    const [, rotation] = match;
    return +rotation;
  } else {
    return 0;
  }
}

export function getScaleValues(el: SimpleSelection<any>): [number, number] {
  const match = SCALE_REGEX.exec(el.attr("transform"));
  if (match != null) {
    const [, scaleX, scaleY] = match;
    return [+scaleX, scaleY == null ? +scaleX : +scaleY];
  } else {
    return [0, 0];
  }
}

/**
 * Checks if the first ClientRect overlaps the second.
 *
 * @param {ClientRect} clientRectA The first ClientRect
 * @param {ClientRect} clientRectB The second ClientRect
 * @returns {boolean} If the ClientRects overlap each other.
 */
export function clientRectsOverlap(clientRectA: ClientRect, clientRectB: ClientRect) {
  if (nativeMath.floor(clientRectA.right) <= nativeMath.ceil(clientRectB.left)) {
    return false;
  }
  if (nativeMath.ceil(clientRectA.left) >= nativeMath.floor(clientRectB.right)) {
    return false;
  }
  if (nativeMath.floor(clientRectA.bottom) <= nativeMath.ceil(clientRectB.top)) {
    return false;
  }
  if (nativeMath.ceil(clientRectA.top) >= nativeMath.floor(clientRectB.bottom)) {
    return false;
  }
  return true;
}

/**
 * Return a new ClientRect that is the old ClientRect expanded by amount in all directions.
 * @param rect
 * @param amount
 */
export function expandRect(rect: ClientRect, amount: number) {
  return {
    left: rect.left - amount,
    top: rect.top - amount,
    right: rect.right + amount,
    bottom: rect.bottom + amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  };
}

/**
 * Returns true if and only if innerClientRect is inside outerClientRect.
 *
 * @param {ClientRect} innerClientRect The first ClientRect
 * @param {ClientRect} outerClientRect The second ClientRect
 * @returns {boolean} If and only if the innerClientRect is inside outerClientRect.
 */
export function clientRectInside(innerClientRect: ClientRect, outerClientRect: ClientRect) {
  return (
    nativeMath.floor(outerClientRect.left) <= nativeMath.ceil(innerClientRect.left) &&
    nativeMath.floor(outerClientRect.top) <= nativeMath.ceil(innerClientRect.top) &&
    nativeMath.floor(innerClientRect.right) <= nativeMath.ceil(outerClientRect.right) &&
    nativeMath.floor(innerClientRect.bottom) <= nativeMath.ceil(outerClientRect.bottom)
  );
}

/**
 * Returns true if the supplied coordinates or Ranges intersect or are contained by bbox.
 *
 * @param {number | Range} xValOrRange The x coordinate or Range to test
 * @param {number | Range} yValOrRange The y coordinate or Range to test
 * @param {SVGRect} bbox The bbox
 * @param {number} tolerance Amount by which to expand bbox, in each dimension, before
 * testing intersection
 *
 * @returns {boolean} True if the supplied coordinates or Ranges intersect or are
 * contained by bbox, false otherwise.
 */
export function intersectsBBox(xValOrRange: number | Range,
                               yValOrRange: number | Range,
                               bbox: SVGRect,
                               tolerance = 0.5) {
  const xRange = _parseRange(xValOrRange);
  const yRange = _parseRange(yValOrRange);

  // SVGRects are positioned with sub-pixel accuracy (the default unit
  // for the x, y, height & width attributes), but user selections (e.g. via
  // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
  // seems appropriate.
  return bbox.x + bbox.width >= xRange.min - tolerance &&
    bbox.x <= xRange.max + tolerance &&
    bbox.y + bbox.height >= yRange.min - tolerance &&
    bbox.y <= yRange.max + tolerance;
}

/**
 * Create a Range from a number or an object with "min" and "max" defined.
 *
 * @param {any} input The object to parse
 *
 * @returns {Range} The generated Range
 */
function _parseRange(input: number | Range): Range {
  if (typeof (input) === "number") {
    const value = <number>input;
    return { min: value, max: value };
  }

  const range = <Range>input;
  if (range instanceof Object && "min" in range && "max" in range) {
    return range;
  }

  throw new Error("input '" + input + "' can't be parsed as an Range");
}

function _parseStyleValue(style: CSSStyleDeclaration, property: string): number {
  const value = style.getPropertyValue(property);
  const parsedValue = parseFloat(value);
  return parsedValue || 0;
}

/**
 * Returns an array containing all ancestor `HTMLElement`s, starting at the
 * provided element and usually ending with the `<body>` element.
 */
export function getHtmlElementAncestors(elem: Element): HTMLElement[] {
  const elems: HTMLElement[] = [];
  while (elem && elem instanceof HTMLElement) {
    elems.push(elem);
    elem = elem.offsetParent;
  }
  return elems;
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
  return parseTransformMatrix(transform);
}

const _MATRIX_REGEX = /^matrix\(([^)]+)\)$/;
const _SPLIT_REGEX = /[, ]+/;

/**
 * Attempts to parse a string such as `"matrix(1, 0, 1, 1, 100, 0)"` into an
 * array such as `[1, 0, 1, 1, 100, 0]`.
 *
 * If unable to do so, `null` is returned.
 */
function parseTransformMatrix(transform: string): ICssTransformMatrix | null {
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
