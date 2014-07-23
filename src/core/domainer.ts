///<reference path="../reference.ts" />

module Plottable {

  export class Domainer {
    private doNice = false;
    private niceCount: number;
    private padProportion = 0.0;
    private paddingExceptions: D3.Map = d3.map();
    private unregisteredPaddingExceptions: D3.Set = d3.set();
    private includedValues: D3.Map = d3.map();
    // includedValues needs to be a map, even unregistered, to support getting un-stringified values back out
    private unregisteredIncludedValues: D3.Map = d3.map();
    private combineExtents: (extents: any[][]) => any[];
    private static PADDING_FOR_IDENTICAL_DOMAIN = 1;
    private static ONE_DAY = 1000 * 60 * 60 * 24;

    /**
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
      this.combineExtents = combineExtents;
    }

    /**
     * @param {any[][]} extents The list of extents to be reduced to a single
     *        extent.
     * @param {Abstract.QuantitiveScale} scale
     *        Since nice() must do different things depending on Linear, Log,
     *        or Time scale, the scale must be passed in for nice() to work.
     * @return {any[]} The domain, as a merging of all exents, as a [min, max]
     *                 pair.
     */
    public computeDomain(extents: any[][], scale: Abstract.QuantitiveScale): any[] {
      var domain: any[];
      if (this.combineExtents != null) {
        domain = this.combineExtents(extents);
      } else if (extents.length === 0) {
        domain = scale._defaultExtent();
      } else {
        domain = [d3.min(extents, (e) => e[0]), d3.max(extents, (e) => e[1])];
      }
      domain = this.includeDomain(domain);
      domain = this.padDomain(scale, domain);
      domain = this.niceDomain(scale, domain);
      return domain;
    }

    /**
     * Sets the Domainer to pad by a given ratio.
     *
     * @param {number} [padProportion] Proportionally how much bigger the
     *         new domain should be (0.05 = 5% larger).
     *
     *         A domainer will pad equal visual amounts on each side.
     *         On a linear scale, this means both sides are padded the same
     *         amount: [10, 20] will be padded to [5, 25].
     *         On a log scale, the top will be padded more than the bottom, so
     *         [10, 100] will be padded to [1, 1000].
     *
     * @return {Domainer} The calling Domainer.
     */
    public pad(padProportion = 0.05): Domainer {
      this.padProportion = padProportion;
      return this;
    }

    /**
     * Add a padding exception, a value that will not be padded at either end of the domain.
     *
     * Eg, if a padding exception is added at x=0, then [0, 100] will pad to [0, 105] instead of [-2.5, 102.5].
     * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
     * If a key is not provided, it will be added with set semantics (Can be removed by value)
     *
     * @param {any} exception The padding exception to add.
     * @param string [key] The key to register the exception under.
     * @return Domainer The calling domainer
     */
    public addPaddingException(exception: any, key?: string): Domainer {
      if (key != null) {
        this.paddingExceptions.set(key, exception);
      } else {
        this.unregisteredPaddingExceptions.add(exception);
      }
      return this;
    }


    /**
     * Remove a padding exception, allowing the domain to pad out that value again.
     *
     * If a string is provided, it is assumed to be a key and the exception associated with that key is removed.
     * If a non-string is provdied, it is assumed to be an unkeyed exception and that exception is removed.
     *
     * @param {any} keyOrException The key for the value to remove, or the value to remove
     * @return Domainer The calling domainer
     */
    public removePaddingException(keyOrException: any): Domainer {
      if (typeof(keyOrException) === "string") {
        this.paddingExceptions.remove(keyOrException);
      } else {
        this.unregisteredPaddingExceptions.remove(keyOrException);
      }
      return this;
    }

    /**
     * Add an included value, a value that must be included inside the domain.
     *
     * Eg, if a value exception is added at x=0, then [50, 100] will expand to [0, 100] rather than [50, 100].
     * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
     * If a key is not provided, it will be added with set semantics (Can be removed by value)
     *
     * @param {any} value The included value to add.
     * @param string [key] The key to register the value under.
     * @return Domainer The calling domainer
     */
    public addIncludedValue(value: any, key?: string): Domainer {
      if (key != null) {
        this.includedValues.set(key, value);
      } else {
        this.unregisteredIncludedValues.set(value, value);
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
     * @return Domainer The calling domainer
     */
    public removeIncludedValue(valueOrKey: any) {
      if (typeof(valueOrKey) === "string") {
        this.includedValues.remove(valueOrKey);
      } else {
        this.unregisteredIncludedValues.remove(valueOrKey);
      }
      return this;
    }

    /**
     * Extends the scale's domain so it starts and ends with "nice" values.
     *
     * @param {number} [count] The number of ticks that should fit inside the new domain.
     * @return {Domainer} The calling Domainer.
     */
    public nice(count?: number): Domainer {
      this.doNice = true;
      this.niceCount = count;
      return this;
    }

    private static defaultCombineExtents(extents: any[][]): any[] {
      if (extents.length === 0) {
        return [0, 1];
      } else {
        return [d3.min(extents, (e) => e[0]), d3.max(extents, (e) => e[1])];
      }
    }

    private padDomain(scale: Abstract.QuantitiveScale, domain: any[]): any[] {
      var min = domain[0];
      var max = domain[1];
      if (min === max && this.padProportion > 0.0) {
        var d = min.valueOf(); // valueOf accounts for dates properly
        if (min instanceof Date) {
          return [d - Domainer.ONE_DAY, d + Domainer.ONE_DAY];
        } else {
          return [d - Domainer.PADDING_FOR_IDENTICAL_DOMAIN,
                  d + Domainer.PADDING_FOR_IDENTICAL_DOMAIN];
        }
      }
      var p = this.padProportion / 2;
      // This scaling is done to account for log scales and other non-linear
      // scales. A log scale should be padded more on the max than on the min.
      var newMin = scale.invert(scale.scale(min) -
                                        (scale.scale(max) - scale.scale(min)) * p);
      var newMax = scale.invert(scale.scale(max) +
                                        (scale.scale(max) - scale.scale(min)) * p);
      var exceptionValues = this.paddingExceptions.values().concat(this.unregisteredPaddingExceptions.values());
      var exceptionSet = d3.set(exceptionValues);
      if (exceptionSet.has(min)) {
        newMin = min;
      }
      if (exceptionSet.has(max)) {
        newMax = max;
      }
      return [newMin, newMax];
    }

    private niceDomain(scale: Abstract.QuantitiveScale, domain: any[]): any[] {
      if (this.doNice) {
        return scale._niceDomain(domain, this.niceCount);
      } else {
        return domain;
      }
    }

    private includeDomain(domain: any[]): any[] {
      var includedValues = this.includedValues.values().concat(this.unregisteredIncludedValues.values());
      return includedValues.reduce(
        (domain, value) => [Math.min(domain[0], value), Math.max(domain[1], value)],
        domain
      );
    }
  }
}
