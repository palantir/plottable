///<reference path="reference.ts" />

module Plottable {
  export class Scale implements IBroadcaster {
    public _internalScale: D3.Scale.Scale;
    private broadcasterCallbacks: IBroadcasterCallback[] = [];

    /**
     * Creates a new Scale.
     * @constructor
     * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
     */
    constructor(scale: D3.Scale.Scale) {
      this._internalScale = scale;
    }

    /**
     * Returns the range value corresponding to a given domain value.
     *
     * @param value {any} A domain value to be scaled.
     * @returns {any} The range value corresponding to the supplied domain value.
     */
    public scale(value: any) {
      return this._internalScale(value);
    }

    /**
     * Retrieves the current domain, or sets the Scale's domain to the specified values.
     * @param {any[]} [values] The new value for the domain.
     * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
     */
    public domain(): any[];
    public domain(values: any[]): Scale;
    public domain(values?: any[]): any {
      if (values == null) {
        return this._internalScale.domain();
      } else {
        this._internalScale.domain(values);
        this.broadcasterCallbacks.forEach((b) => b(this));
        return this;
      }
    }

    /**
     * Retrieves the current range, or sets the Scale's range to the specified values.
     * @param {any[]} [values] The new value for the range.
     * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
     */
    public range(): any[];
    public range(values: any[]): Scale;
    public range(values?: any[]): any {
      if (values == null) {
        return this._internalScale.range();
      } else {
        this._internalScale.range(values);
        return this;
      }
    }

    /**
     * Creates a copy of the Scale with the same domain and range but without any registered listeners.
     * @returns {Scale} A copy of the calling Scale.
     */
    public copy(): Scale {
      return new Scale(this._internalScale.copy());
    }

    /**
     * Registers a callback to be called when the scale's domain is changed.
     * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
     * @returns {Scale} The Calling Scale.
     */
    public registerListener(callback: IBroadcasterCallback) {
      this.broadcasterCallbacks.push(callback);
      return this;
    }
  }

  export class QuantitiveScale extends Scale {
    public _internalScale: D3.Scale.QuantitiveScale;

    /**
     * Creates a new QuantitiveScale.
     * @constructor
     * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
     */
    constructor(scale: D3.Scale.QuantitiveScale) {
      super(scale);
    }

    /**
     * Retrieves the domain value corresponding to a supplied range value.
     * @param {number} value: A value from the Scale's range.
     * @returns {number} The domain value corresponding to the supplied range value.
     */
    public invert(value: number) {
      return this._internalScale.invert(value);
    }

    /**
     * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
     * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
     */
    public copy(): QuantitiveScale {
      return new QuantitiveScale(this._internalScale.copy());
    }

    /**
     * Expands the QuantitiveScale's domain to cover the new region.
     * @param {number} newDomain The additional domain to be covered by the QuantitiveScale.
     * @returns {QuantitiveScale} The scale.
     */
    public widenDomain(newDomain: number[]) {
      var currentDomain = this.domain();
      var wideDomain = [Math.min(newDomain[0], currentDomain[0]), Math.max(newDomain[1], currentDomain[1])];
      this.domain(wideDomain);
      return this;
    }

    /**
     * Sets or gets the QuantitiveScale's output interpolator
     *
     * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
     * @returns {D3.Transition.Interpolate|QuantitiveScale} The current output interpolator, or the calling QuantitiveScale.
     */
    public interpolate(): D3.Transition.Interpolate;
    public interpolate(factory: D3.Transition.Interpolate): QuantitiveScale;
    public interpolate(factory?: D3.Transition.Interpolate): any {
      if (factory == null) {
        return this._internalScale.interpolate();
      }
      this._internalScale.interpolate(factory);
      return this;
    }

    /**
     * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this._internalScale.rangeRound(values);
      return this;
    }

    /**
     * Gets or sets the clamp status of the QuantitiveScale (whether to cut off values outside the ouput range).
     *
     * @param {boolean} [clamp] Whether or not to clamp the QuantitiveScale.
     * @returns {boolean|QuantitiveScale} The current clamp status, or the calling QuantitiveScale.
     */
    public clamp(): boolean;
    public clamp(clamp: boolean): QuantitiveScale;
    public clamp(clamp?: boolean): any {
      if (clamp == null) {
        return this._internalScale.clamp();
      }
      this._internalScale.clamp(clamp);
      return this;
    }

    /**
     * Extends the scale's domain so it starts and ends with "nice" values.
     *
     * @param {number} [count] The number of ticks that should fit inside the new domain.
     */
    public nice(count?: number) {
      this._internalScale.nice(count);
      this.domain(this._internalScale.domain()); // nice() can change the domain, so update all listeners
      return this;
    }

    /**
     * Generates tick values.
     * @param {number} [count] The number of ticks to generate.
     * @returns {any[]} The generated ticks.
     */
    public ticks(count?: number) {
      return this._internalScale.ticks(count);
    }

    /**
     * Gets a tick formatting function for displaying tick values.
     *
     * @param {number} count The number of ticks to be displayed
     * @param {string} [format] A format specifier string.
     * @returns {(n: number) => string} A formatting function.
     */
    public tickFormat(count: number, format?: string): (n: number) => string {
      return this._internalScale.tickFormat(count, format);
    }
  }

  export class LinearScale extends QuantitiveScale {

    /**
     * Creates a new LinearScale.
     * @constructor
     * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the LinearScale. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LinearScale);
    constructor(scale?: any) {
      super(scale == null ? d3.scale.linear() : scale);
      this.domain([Infinity, -Infinity]);
    }

    /**
     * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
     * @returns {LinearScale} A copy of the calling LinearScale.
     */
    public copy(): LinearScale {
      return new LinearScale(this._internalScale.copy());
    }
  }

  export class ColorScale extends Scale {
    /**
     * Creates a ColorScale.
     * @constructor
     * @param {string} [scaleType] the type of color scale to create (Category10/Category20/Category20b/Category20c)
     */
    constructor(scaleType?: string) {
      var scale: D3.Scale.Scale;
      switch (scaleType) {
        case "Category10":
        case "category10":
        case "10":
          scale = d3.scale.category10();
          break;
        case "Category20":
        case "category20":
        case "20":
          scale = d3.scale.category20();
          break;
        case "Category20b":
        case "category20b":
        case "20b":
          scale = d3.scale.category20b();
          break;
        case "Category20c":
        case "category20c":
        case "20c":
          scale = d3.scale.category20c();
          break;
        case null:
        case undefined:
          scale = d3.scale.ordinal();
        default:
          throw new Error("Unsupported ColorScale type");
      }
      super(scale);
    }
  }
}
