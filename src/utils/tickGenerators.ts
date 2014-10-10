///<reference path="../reference.ts" />

module Plottable {
export module TickGenerators {

  /**
   * Creates a tick generator using specified interval.
   *
   * Generates ticks at multiples of the interval while also including the domain boundaries.
   *
   * @param {number} interval The interval between two ticks (not including the end ticks).
   *
   * @returns {TickGenerator} A tick generator using specified interval.
   */
  export function intervalTickGenerator(interval: number) : Scale.TickGenerator<number> {
    return function(s: Scale.AbstractQuantitative<any>) {
      var domain = s.domain();
      var generatedTicks: number[] = [];
      var firstTick = Math.ceil(domain[0] / interval) * interval;
      var lastTick = Math.floor(domain[1] / interval) * interval;
      if(firstTick !== domain[0]) {
        generatedTicks.push(domain[0]);
      }

      for(var tick = firstTick; tick <= lastTick; tick += interval) {
        generatedTicks.push(tick);
      }

      if(lastTick !== domain[1]) {
        generatedTicks.push(domain[1]);
      }
      return generatedTicks;
    };
  }
}
}
