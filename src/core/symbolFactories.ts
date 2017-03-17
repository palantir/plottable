/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as d3Shape from "d3-shape";

/**
 * A SymbolFactory is a function that takes in a symbolSize which is the edge length of the render area
 * and returns a string representing the 'd' attribute of the resultant 'path' element
 */
export type SymbolFactory = (symbolSize: number) => d3Shape.Symbol<any, any>;

export function circle(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolCircle).size(Math.PI * Math.pow(symbolSize / 2, 2));
}

export function square(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolSquare).size(Math.pow(symbolSize, 2));
}

export function cross(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolCross).size((5 / 9) * Math.pow(symbolSize, 2));
}

export function cross1() {
  return d3Shape.symbolCross;
}

export function diamond(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolDiamond).size(Math.tan(Math.PI / 6) * Math.pow(symbolSize, 2) / 2);
}

export function triangle(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolTriangle).size(Math.sqrt(3) * Math.pow(symbolSize / 2, 2));
}

// copied from https://github.com/d3/d3-shape/blob/e2e57722004acba754ed9edff020282682450c5c/src/symbol/star.js#L3
const ka = 0.89081309152928522810;
export function star(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolStar).size(ka * Math.pow(symbolSize / 2, 2));
}

// copied from https://github.com/d3/d3-shape/blob/c35b2303eb4836aba3171642f01c2653e4228b9c/src/symbol/wye.js#L2
const a = ((1 / Math.sqrt(12)) / 2 + 1) * 3;
export function wye(): SymbolFactory {
  return (symbolSize: number) => d3.symbol().type(d3.symbolWye).size(a * Math.pow(symbolSize / 2.4, 2));
}
