///<reference path="../reference.ts" />

module Plottable {
  export module Scale {
    export module TickGenerators {
      export interface TickGenerator<D> {
        (scale: Plottable.Scale.AbstractQuantitative<D>): D[]
      }
      /**
       * Creates a tick generator using the specified interval.
       *
       * Generates ticks at multiples of the interval while also including the domain boundaries.
       *
       * @param {number} interval The interval between two ticks (not including the end ticks).
       *
       * @returns {TickGenerator} A tick generator using the specified interval.
       */
      export function intervalTickGenerator(interval: number) : TickGenerator<number> {
        if(interval <= 0) {
           throw new Error("interval must be positive number");
        }

        return function(s: Scale.AbstractQuantitative<number>) {
          var domain = s.domain();
          var low = Math.min(domain[0], domain[1]);
          var high = Math.max(domain[0], domain[1]);
          var firstTick = Math.ceil(low / interval) * interval;
          var numTicks = Math.floor((high - firstTick) / interval) + 1;

          var lowTicks = low % interval === 0 ? [] : [low];
          var middleTicks = _Util.Methods.range(0, numTicks).map(t => firstTick + t * interval);
          var highTicks = high % interval === 0 ? [] : [high];

          return lowTicks.concat(middleTicks).concat(highTicks);
        };
      }
    }
}
}
