/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

/**
 * Preserve full-precision SVG paths with d3-shape 3.2+, which rounds by default.
 * Earlier versions have no digits() method and already use full precision.
 */
export function withFullPrecision<T extends { digits?: (digits: number | null) => unknown }>(generator: T): T {
  if (typeof generator.digits === "function") {
    generator.digits(null);
  }
  return generator;
}
