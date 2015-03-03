///<reference path="../reference.ts" />

module Plottable {

  export type SymbolGenerator = (d: any) => string;

  export module SymbolGenerators {

    export function d3Symbol(symbolType: string) {
      return (radius: number) => d3.svg.symbol().type(symbolType).size(Math.pow(radius, 2));
    }

  }
}
