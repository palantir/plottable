///<reference path="../reference.ts" />

module Plottable {

  export module ScaleDomainTransformers {

    /**
     * Returns a translated domain of the input scale with a translation of the input translateAmount
     * in range space
     *
     * @param {Scale.AbstractQuantitative<D>} scale The input scale whose domain is being translated
     * @param {number} translateAmount The amount to translate
     * @returns {D[]} The translated domain
     */
    export function translate<D>(scale: Scale.AbstractQuantitative<D>, translateAmount: number) {
      var translateTransform = (rangeValue: number) => scale.invert(rangeValue + translateAmount);
      return scale.range().map(translateTransform);
    }

    /**
     * Returns a magnified domain of the input scale with a magnification of the input magnifyAmount
     * in range space with the center point as the input centerValue, also in range space
     *
     * @param {Scale.AbstractQuantitative<D> scale The input scale whose domain is being magnified
     * @param {number} magnifyAmount The amount to magnify
     * @returns {D[]} The magnified domain
     */
    export function magnify<D>(scale: Scale.AbstractQuantitative<D>, magnifyAmount: number) {
      var centerNumber = (scale.range()[0] + scale.range()[1]) / 2;
      var magnifyTransform = (rangeValue: number) => scale.invert(centerNumber - (centerNumber - rangeValue) * magnifyAmount);
      return scale.range().map(magnifyTransform);
    }

  }
}
