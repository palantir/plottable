///<reference path="../reference.ts" />

module Plottable {

  export module SymbolGenerators {

    export function d3Symbol(symbolType: string | ((datum: any, index: number) => string)) {
      return (radius: number) => d3.svg.symbol().type(symbolType).size(Math.pow(radius, 2));
    }

  }
}
