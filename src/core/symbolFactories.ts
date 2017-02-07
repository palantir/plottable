/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

/**
 * A SymbolFactory is a function that takes in a symbolSize which is the edge length of the render area
 * and returns a string representing the 'd' attribute of the resultant 'path' element
 */
export type SymbolFactory = (symbolSize: number) => string;

export function circle(): SymbolFactory {
  return (symbolSize: number) => d3.svg.symbol().type("circle").size(Math.PI * Math.pow(symbolSize / 2, 2))(null);
}

export function square(): SymbolFactory {
  return (symbolSize: number) => d3.svg.symbol().type("square").size(Math.pow(symbolSize, 2))(null);
}

export function cross(): SymbolFactory {
  return (symbolSize: number) => d3.svg.symbol().type("cross").size((5 / 9) * Math.pow(symbolSize, 2))(null);
}

export function diamond(): SymbolFactory {
  return (symbolSize: number) => d3.svg.symbol().type("diamond").size(Math.tan(Math.PI / 6) * Math.pow(symbolSize, 2) / 2)(null);
}

export function triangleUp(): SymbolFactory {
  return (symbolSize: number) => d3.svg.symbol().type("triangle-up").size(Math.sqrt(3) * Math.pow(symbolSize / 2, 2))(null);
}

export function triangleDown(): SymbolFactory {
  return (symbolSize: number) => d3.svg.symbol().type("triangle-down").size(Math.sqrt(3) * Math.pow(symbolSize / 2, 2))(null);
}
