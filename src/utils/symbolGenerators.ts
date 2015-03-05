///<reference path="../reference.ts" />

module Plottable {

  /**
   * A SymbolGenerator is a function that takes in a datum and the index of the datum to
   * produce an svg path string analogous to the datum/index pair.
   *
   * Note that SymbolGenerators used in Plottable will be assumed to work within a 100x100 square
   * to be scaled appropriately for use within Plottable
   */
  export type SymbolGenerator = (datum: any, index: number) => string;

  export module SymbolGenerators {

    /**
     * The generic circle symbol.
     *
     * @returns {SymbolGenerator} the symbol generator for a circle
     */
    export function circle() {
      return d3.svg.symbol().type("circle").size(Math.pow(50, 2) * Math.PI);
    }

    /**
     * A wrapper for D3's symbol generator as documented here:
     * https://github.com/mbostock/d3/wiki/SVG-Shapes#symbol
     *
     * Note that since D3 symbols compute the path strings by knowing how much area it can take up instead of
     * knowing its dimensions, the total area expected may be off by some constant factor.
     *
     * @param {string | ((datum: any, index: number) => string)} symbolType Accessor for the d3 symbol type
     * @returns {SymbolGenerator} the symbol generator for a D3 symbol
     */
    export function d3Symbol(symbolType: string | ((datum: any, index: number) => string)) {
      return d3.svg.symbol().type(symbolType).size(Math.pow(50, 2));
    }

  }
}
