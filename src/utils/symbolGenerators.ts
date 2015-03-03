///<reference path="../reference.ts" />

module Plottable {

  export type SymbolGenerator = (datum: any, index: number) => string;

  export module SymbolGenerators {

    export function d3Symbol(symbolType: string | ((datum: any, index: number) => string)) {
      return d3.svg.symbol().type(symbolType).size(Math.pow(100, 2));
    }

  }
}
