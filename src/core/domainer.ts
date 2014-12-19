///<reference path="../reference.ts" />

module Plottable {

  export class Domainer {
    private _doNice = false;
    private _niceCount: number;
    private _padProportion = 0.0;
    private _paddingExceptions: D3.Map<any> = d3.map();
    private _unregisteredPaddingExceptions: D3.Set<any> = d3.set();
    private _includedValues: D3.Map<any> = d3.map();
    // _includedValues needs to be a map, even unregistered, to support getting un-stringified values back out
    private _unregisteredIncludedValues: D3.Map<any> = d3.map();
    private _combineExtents: (extents: any[][]) => any[];
    private static _PADDING_FOR_IDENTICAL_DOMAIN = 1;
    private static _ONE_DAY = 1000 * 60 * 60 * 24;

    /**
     * Constructs a new Domainer.
     *
     * @constructor
     * @param {(extents: any[][]) => any[]} combineExtents
     *        If present, this function will be used by the Domainer to merge
     *        all the extents that are present on a scale.
     *
     *        A plot may draw multiple things relative to a scale, e.g.
     *        different stocks over time. The plot computes their extents,
     *        which are a [min, max] pair. combineExtents is responsible for
     *        merging them all into one [min, max] pair. It defaults to taking
     *        the min of the first elements and the max of the second arguments.
     */
    constructor(combineExtents?: (extents: any[][]) => any[]) {
      this._combineExtents = combineExtents;
    }

    /**
     * @param {any[][]} extents The list of extents to be reduced to a single
     *        extent.
     * @param {QuantitativeScale} scale
     *        Since nice() must do different things depending on Linear, Log,
     *        or Time scale, the scale must be passed in for nice() to work.
     * @returns {any[]} The domain, as a merging of all exents, as a [min, max]
     *                 pair.
     */
    public computeDomain(extents: any[][], scale: Scale.AbstractQuantitative<any>): any[] {
      var domain: any[];
      if (this._combineExtents != null) {
        domain = this._combineExtents(extents);
      } else if (extents.length === 0) {
        domain = scale._defaultExtent();
      } else {
        domain = [_Util.Methods.min(extents, (e) => e[0], 0), _Util.Methods.max(extents, (e) => e[1], 0)];
      }
      domain = this._includeDomain(domain);
      domain = this._padDomain(scale, domain);
      domain = this._niceDomain(scale, domain);
      return domain;
    }

    /**
     * Sets the Domainer to pad by a given ratio.
     *
     * @param {number} padProportion Proportionally how much bigger the
     *         new domain should be (0.05 = 5% larger).
     *
     *         A domainer will pad equal visual amounts on each side.
     *         On a linear scale, this means both sides are padded the same
     *         amount: [10, 20] will be padded to [5, 25].
     *         On a log scale, the top will be padded more than the bottom, so
     *         [10, 100] will be padded to [1, 1000].
     *
     * @returns {Domainer} The calling Domainer.
     */
    public pad(padProportion = 0.05): Domainer {
      this._padProportion = padProportion;
      return this;
    }

    /**
     * Adds a padding exception, a value that will not be padded at either end of the domain.
     *
     * Eg, if a padding exception is added at x=0, then [0, 100] will pad to [0, 105] instead of [-2.5, 102.5].
     * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
     * If a key is not provided, it will be added with set semantics (Can be removed by value)
     *
     * @param {any} exception The padding exception to add.
     * @param {string} key The key to register the exception under.
     * @returns {Domainer} The calling domainer
     */
    public addPaddingException(exception: any, key?: string): Domainer {
      if (key != null) {
        this._paddingExceptions.set(key, exception);
      } else {
        this._unregisteredPaddingExceptions.add(exception);
      }
      return this;
    }


    /**
     * Removes a padding exception, allowing the domain to pad out that value again.
     *
     * If a string is provided, it is assumed to be a key and the exception associated with that key is removed.
     * If a non-string is provdied, it is assumed to be an unkeyed exception and that exception is removed.
     *
     * @param {any} keyOrException The key for the value to remove, or the value to remove
     * @return {Domainer} The calling domainer
     */
    public removePaddingException(keyOrException: any): Domainer {
      if (typeof(keyOrException) === "string") {
        this._paddingExceptions.remove(keyOrException);
      } else {
        this._unregisteredPaddingExceptions.remove(keyOrException);
      }
      return this;
    }

    /**
     * Adds an included value, a value that must be included inside the domain.
     *
     * Eg, if a value exception is added at x=0, then [50, 100] will expand to [0, 100] rather than [50, 100].
     * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
     * If a key is not provided, it will be added with set semantics (Can be removed by value)
     *
     * @param {any} value The included value to add.
     * @param {string} key The key to register the value under.
     * @returns {Domainer} The calling domainer
     */
    public addIncludedValue(value: any, key?: string): Domainer {
      if (key != null) {
        this._includedValues.set(key, value);
      } else {
        this._unregisteredIncludedValues.set(value, value);
      }
      return this;
    }

    /**
     * Remove an included value, allowing the domain to not include that value gain again.
     *
     * If a string is provided, it is assumed to be a key and the value associated with that key is removed.
     * If a non-string is provdied, it is assumed to be an unkeyed value and that value is removed.
     *
     * @param {any} keyOrException The key for the value to remove, or the value to remove
     * @return {Domainer} The calling domainer
     */
    public removeIncludedValue(valueOrKey: any) {
      if (typeof(valueOrKey) === "string") {
        this._includedValues.remove(valueOrKey);
      } else {
        this._unregisteredIncludedValues.remove(valueOrKey);
      }
      return this;
    }

    /**
     * Extends the scale's domain so it starts and ends with "nice" values.
     *
     * @param {number} count The number of ticks that should fit inside the new domain.
     * @return {Domainer} The calling Domainer.
     */
    public nice(count?: number): Domainer {
      this._doNice = true;
      this._niceCount = count;
      return this;
    }

    private _padDomain(scale: Scale.AbstractQuantitative<any>, domain: any[]): any[] {
      var min = domain[0];
      var max = domain[1];
      if (min === max && this._padProportion > 0.0) {
        var d = min.valueOf(); // valueOf accounts for dates properly
        if (min instanceof Date) {
          return [d - Domainer._ONE_DAY, d + Domainer._ONE_DAY];
        } else {
          return [d - Domainer._PADDING_FOR_IDENTICAL_DOMAIN,
                  d + Domainer._PADDING_FOR_IDENTICAL_DOMAIN];
        }
      }

      if (scale.domain()[0] === scale.domain()[1]) {
        return domain;
      }
      var p = this._padProportion / 2;
      // This scaling is done to account for log scales and other non-linear
      // scales. A log scale should be padded more on the max than on the min.
      var newMin = scale.invert(scale.scale(min) -
                                        (scale.scale(max) - scale.scale(min)) * p);
      var newMax = scale.invert(scale.scale(max) +
                                        (scale.scale(max) - scale.scale(min)) * p);
      var exceptionValues = this._paddingExceptions.values().concat(this._unregisteredPaddingExceptions.values());
      var exceptionSet = d3.set(exceptionValues);
      if (exceptionSet.has(min)) {
        newMin = min;
      }
      if (exceptionSet.has(max)) {
        newMax = max;
      }
      return [newMin, newMax];
    }

    private _niceDomain(scale: Scale.AbstractQuantitative<any>, domain: any[]): any[] {
      if (this._doNice) {
        return scale._niceDomain(domain, this._niceCount);
      } else {
        return domain;
      }
    }

    private _includeDomain(domain: any[]): any[] {
      var includedValues = this._includedValues.values().concat(this._unregisteredIncludedValues.values());
      return includedValues.reduce(
        (domain, value) => [Math.min(domain[0], value), Math.max(domain[1], value)],
        domain
      );
    }
  }
}
