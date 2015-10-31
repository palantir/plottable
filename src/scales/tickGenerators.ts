module Plottable.Scales.TickGenerators {
  // HACKHACK: Generic types in type definition fails compilation
  // https://github.com/Microsoft/TypeScript/issues/1616
  /**
   * Generates an array of tick values for the specified scale.
   *
   * @param {QuantitativeScale} scale
   * @returns {D[]}
   */
  export interface TickGenerator<D> {
    (scale: Plottable.QuantitativeScale<D>): D[];
  }
  /**
   * Creates a TickGenerator using the specified interval.
   *
   * Generates ticks at multiples of the interval while also including the domain boundaries.
   *
   * @param {number} interval
   * @returns {TickGenerator}
   */
  export function intervalTickGenerator(interval: number): TickGenerator<number> {
    if (interval <= 0) {
        throw new Error("interval must be positive number");
    }

    return function(s: QuantitativeScale<number>) {
      let domain = s.domain();
      let low = Math.min(domain[0], domain[1]);
      let high = Math.max(domain[0], domain[1]);
      let firstTick = Math.ceil(low / interval) * interval;
      let numTicks = Math.floor((high - firstTick) / interval) + 1;

      let lowTicks = low % interval === 0 ? [] : [low];
      let middleTicks = Utils.Math.range(0, numTicks).map(t => firstTick + t * interval);
      let highTicks = high % interval === 0 ? [] : [high];

      return lowTicks.concat(middleTicks).concat(highTicks);
    };
  }

  /**
   * Creates a TickGenerator returns only integer tick values.
   *
   * @returns {TickGenerator}
   */
  export function integerTickGenerator(): TickGenerator<number> {
    return function(s: QuantitativeScale<number>) {
      let defaultTicks = s.defaultTicks();
      return defaultTicks.filter((tick, i) => (tick % 1 === 0) || (i === 0) || (i === defaultTicks.length - 1));
    };
  }
}
