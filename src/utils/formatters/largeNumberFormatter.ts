///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class LargeNumber extends Abstract.Formatter {
      /**
       * Creates a formatter for large values that displays [precision] significant figures.
       *
       * @constructor
       * @param {number} [precision] The number of significant figures to display.
       */
      constructor(precision = 3) {
        super(precision);
        this.showOnlyUnchangedValues(false);
      }

    /**
     * Gets the current number of significant figures shown by the Formatter.
     *
     * @returns {number} The current precision.
     */
    public precision(): number;
    /**
     * Sets the number of significant figures to be shown by the Formatter.
     *
     * @param {number} [value] The new precision.
     * @returns {Formatter} The calling LargeNumber Formatter.
     */
    public precision(value: number): LargeNumber;
    public precision(value?: number): any {
        var returnValue = super.precision(value);
        this._formatFunction = d3.format("." + this._precision + "s");
        return returnValue;
      }
    }
  }
}
