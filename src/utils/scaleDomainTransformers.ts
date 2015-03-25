///<reference path="../reference.ts" />

module Plottable {

  export module ScaleDomainTransformers {

    export function translate(scale: Scale.AbstractQuantitative, delta: number) {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue - delta);
      return scale.range().map(translateTransform);
    }

  }
}
