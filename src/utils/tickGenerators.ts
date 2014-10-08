///<reference path="../reference.ts" />

module Plottable {
export module TickGenerators {

  /**
   * Creates a tick generator using specific interval.
   *
   * @param {number} [interval] The interval between two ticks.
   *
   * @returns {TickGenerator} A tick generator using specific interval.
   */
  export function intervalTickGenerator(interval: number) {
    return function(s: Abstract.QuantitativeScale<any>) {
      var dom = s.domain();
      var generatedTicks: number[] = [];
      var startIndex = Math.ceil(dom[0] / interval);
      for(var index = startIndex; index * interval <= dom[1]; index++) {
    	generatedTicks[index - startIndex] = index * interval;
	  }
	  return generatedTicks;
    };
  }
}
}
