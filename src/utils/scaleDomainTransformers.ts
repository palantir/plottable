///<reference path="../reference.ts" />

module Plottable {

  export module ScaleDomainTransformers {

    export function translate<D>(scale: Scale.AbstractQuantitative<D>, delta: number) {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue - delta);
      return scale.range().map(translateTransform);
    }

    export function magnify<D>(scale: Scale.AbstractQuantitative<D>, magnifyAmount: number, centerValue: number) {
      var magnifyTransform = (rangeValue: number) => scale.invert(centerValue - (centerValue - rangeValue) * magnifyAmount);
      return scale.range().map(magnifyTransform);
    }

  }
}
