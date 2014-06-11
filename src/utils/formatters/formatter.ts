///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Formatter {
    public _onlyShowUnchanged = true;
    public _formatFunction: (d: any) => string;
    public _precision: number;

    constructor(precision: number) {
      this._precision = precision;
    }

    /**
     * Format an input value.
     *
     * @param {any} d The value to be formatted.
     * @returns {string} The formatted value.
     */
    public format(d: any): string {
      var formattedValue = this._formatFunction(d);
      if (this._onlyShowUnchanged && d !== parseFloat(formattedValue)) {
        return "";
      }
      return formattedValue;
    }

    /**
     * Gets or sets the precision of the Formatter. The meaning depends on the implementation.
     *
     * @param {number} [value] The new precision.
     * @returns {Formatter} The current precision, or the calling Formatter.
     */
    public precision(): number;
    public precision(value: number): Formatter;
    public precision(value?: number): any {
      if (value === undefined) {
        return this._precision;
      }
      this._precision = value;
      return this;
    }

    /**
     * Checks if this formatter should show only unchanged values, or sets
     * whether or not to show only unchanged values.
     *
     * @param {boolean} showUnchanged Whether or not to show only unchanged values.
     * @returns {Formatter} The calling Formatter.
     */
    public showOnlyUnchangedValues(): boolean;
    public showOnlyUnchangedValues(showUnchanged: boolean): Formatter;
    public showOnlyUnchangedValues(showUnchanged?: boolean): any {
      if (showUnchanged === undefined) {
        return this._onlyShowUnchanged;
      }
      this._onlyShowUnchanged = showUnchanged;
      return this;
    }
  }
}
}
