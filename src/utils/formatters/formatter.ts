///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Formatter {
    public _onlyShowUnchanged = true;
    public _formatFunction: (d: any) => string;
    public _precision: number;

    constructor(precision: number) {
      if (precision < 0 || 20 < precision) {
        throw new RangeError("Formatter precision must be between 0 and 20");
      }
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
      if (this._onlyShowUnchanged && this._valueChanged(d, formattedValue)) {
        return "";
      }
      return formattedValue;
    }

    public _valueChanged(d: any, formattedValue: string) {
      return d !== parseFloat(formattedValue);
    }

    /**
     * Gets the current precision of the Formatter.
     * The meaning depends on the implementation.
     *
     * @returns {number} The current precision.
     */
    public precision(): number;
    /**
     * Sets the precision of the Formatter.
     * The meaning depends on the implementation.
     *
     * @param {number} [value] The new precision.
     * @returns {Formatter} The calling Formatter.
     */
    public precision(value: number): Formatter;
    public precision(value?: number): any {
      if (value === undefined) {
        return this._precision;
      }
      this._precision = value;
      return this;
    }

    /**
     * Checks if this formatter will show only unchanged values.
     *
     * @returns {boolean}
     */
    public showOnlyUnchangedValues(): boolean;
    /**
     * Sets whether this formatter will show only unchanged values.
     * If true, inputs whose value is changed by the formatter will be formatted
     * to an empty string.
     *
     * @param {boolean} showUnchanged Whether or not to show only unchanged values.
     * @returns {Formatter} The calling Formatter.
     */
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
