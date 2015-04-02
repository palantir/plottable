///<reference path="../reference.ts" />

module Plottable {

  /**
   * A SymbolFactory is a function that takes in a radius for the size of the symbol
   * and returns a string representing the 'd' attribute of the resultant 'path' element
   */
  export type SymbolFactory = (symbolRadius: number) => string;

  export module SymbolFactories {

    export type StringAccessor = (datum: any, index: number) => string;

    export function circle(): SymbolFactory {
      return (symbolRadius: number) => d3.svg.symbol().type("circle").size(Math.PI * Math.pow(symbolRadius, 2))();
    }

    export function square(): SymbolFactory {
      return (symbolRadius: number) => d3.svg.symbol().type("square").size(4 * Math.pow(symbolRadius, 2))();
    }

    export function cross(): SymbolFactory {
      return (symbolRadius: number) => d3.svg.symbol().type("cross").size((20 / 9) * Math.pow(symbolRadius, 2))();
    }

    export function diamond(): SymbolFactory {
      return (symbolRadius: number) => d3.svg.symbol().type("diamond").size(2 * Math.tan(Math.PI / 6) * Math.pow(symbolRadius, 2))();
    }

    export function triangleUp(): SymbolFactory {
      return (symbolRadius: number) => d3.svg.symbol().type("triangle-up").size(Math.sqrt(3) * Math.pow(symbolRadius, 2))();
    }

    export function triangleDown(): SymbolFactory {
      return (symbolRadius: number) => d3.svg.symbol().type("triangle-down").size(Math.sqrt(3) * Math.pow(symbolRadius, 2))();
    }

  }
}
