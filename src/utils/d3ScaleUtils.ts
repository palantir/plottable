///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export module D3Scale {
    export function niceDomain<D>(scale: D3.Scale.QuantitativeScale, domain: D[], count?: number) {
      return scale.copy().domain(domain).nice(count).domain();
    }
  }
}
}
