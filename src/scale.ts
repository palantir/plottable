///<reference path="reference.ts" />

class Scale implements IBroadcaster {
  public scale: D3.Scale.Scale;
  private broadcasterCallbacks: IBroadcasterCallback[] = [];

  /**
   * Creates a new Scale.
   * @constructor
   * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
   */
  constructor(scale: D3.Scale.Scale) {
    this.scale = scale;
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
      return this.scale.domain();
    } else {
      this.scale.domain(values);
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
      return this.scale.range();
    } else {
      this.scale.range(values);
      return this;
    }
  }

  /**
   * Creates a copy of the Scale with the same domain and range but without any registered listeners.
   * @returns {Scale} A copy of the calling Scale.
   */
  public copy(): Scale {
    return new Scale(this.scale.copy());
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

class QuantitiveScale extends Scale {
  public scale: D3.Scale.QuantitiveScale;

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
    return this.scale.invert(value);
  }

  /**
   * Generates tick values.
   * @param {number} count The number of ticks to generate.
   * @returns {any[]} The generated ticks.
   */
  public ticks(count: number) {
    return this.scale.ticks(count);
  }

  /**
   * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
   * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
   */
  public copy(): QuantitiveScale {
    return new QuantitiveScale(this.scale.copy());
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
}

class LinearScale extends QuantitiveScale {

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
    return new LinearScale(this.scale.copy());
  }
}

class ColorScale extends Scale {
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
