/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

declare module "d3-interpolate/src/transform/parse" {
  export function parseSvg(s: string): {
    translateX: number;
    translateY: number;
    rotate: number;
    skewX: number;
    scaleX: number;
    scaleY: number;
  };
}

