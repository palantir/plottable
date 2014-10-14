///<reference path="../reference.ts" />

module Plottable {
export module TickGenerators {
  /**
   * Creates a tick generator using the specified interval.
   *
   * Generates ticks at multiples of the interval while also including the domain boundaries.
   *
   * @param {number} interval The interval between two ticks (not including the end ticks).
   *
   * @returns {TickGenerator} A tick generator using the specified interval.
   */
  export function intervalTickGenerator(interval: number) : Scale.TickGenerator<number> {
    if(interval <= 0) {
       throw new Error("interval must be positive number");
    }

    return function(s: Scale.AbstractQuantitative<any>) {
      var domain = s.domain();
      var firstTick: number;
      var generatedTicks: number[] = [];
      if(domain[0] <= domain[1]) {
        firstTick = Math.ceil(domain[0] / interval) * interval;
      } else {
        firstTick = Math.floor(domain[0] / interval) * interval;
        interval = -interval;
      }
      var numTicks = Math.max(Math.floor((domain[1] - firstTick) / interval) + 1, 0);

      if(domain[0] % interval !== 0) {
        generatedTicks.push(domain[0]);
      }
      _Util.Methods.range(0, numTicks).forEach(t => generatedTicks.push(firstTick + t * interval));
      if(domain[1] % interval !== 0) {
        generatedTicks.push(domain[1]);
      }

      return generatedTicks;
    };
  }
}
}
