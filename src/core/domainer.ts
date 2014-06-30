///<reference path="../reference.ts" />

module Plottable {

  export class Domainer {
    private doNice = false;
    private niceCount: number;
    private padProportion = 0.0;
    private paddingExceptions: D3.Set = d3.set([]);
    private combineExtents: (extents: any[][]) => any[];
    // This must be a map rather than a set so we can get the original values
    // back out, rather than their stringified versions.
    private includedValues: D3.Map = d3.map([]);
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
    constructor(combineExtents: (extents: any[][]) => any[] = Domainer.defaultCombineExtents) {
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
      domain = this.combineExtents(extents);
      domain = this.includeDomain(domain);
      domain = this.padDomain(domain);
      domain = this.niceDomain(scale, domain);
      return domain;
    }

    /**
     * Sets the Domainer to pad by a given ratio.
     *
     * @param {number} [padProportion] Proportionally how much bigger the 
     *         new domain should be (0.05 = 5% larger).
     * @return {Domainer} The calling Domainer.
     */
    public pad(padProportion = 0.05): Domainer {
      this.padProportion = padProportion;
      return this;
    }

    /**
     * Adds a value that will not be padded if either end of the domain.
     * For example, after paddingException(0), a domainer will pad
     * [0, 100] to [0, 102.5].
     *
     * @param {any} exception The value that will not be padded.
     * @param {boolean} add Defaults to true. If true, add the exception,
     *                  if false, removes the exception.
     * @return {Domainer} The calling Domainer.
     */
    public paddingException(exception: any, add = true): Domainer {
      if (add) {
        this.paddingExceptions.add(exception);
      } else {
        this.paddingExceptions.remove(exception);
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

    /**
     * Ensure that the domain produced includes value.
     *
     * For example, after include(0), the domain [3, 5] will become [0, 5],
     * and the domain [-9, -8] will become [-9, 0].
     *
     * @param {any} value The value that will be included.
     * @param {boolean} include Defaults to true. If true, this value will
     *                  always be included, if false, this value will not
     *                  necessarily be included.
     * @return {Domainer} The calling Domainer.
     */
    public include(value: any, include = true): Domainer {
      if (include) {
        this.includedValues.set(value, value);
      } else {
        this.includedValues.remove(value);
      }
      return this;
    }

    private static defaultCombineExtents(extents: any[][]): any[] {
      if (extents.length === 0) {
        return [0, 1];
      } else {
        return [d3.min(extents, (e) => e[0]), d3.max(extents, (e) => e[1])];
      }
    }

    private padDomain(domain: any[]): any[] {
      if (domain[0] === domain[1] && this.padProportion > 0.0) {
        var d = domain[0].valueOf(); // valueOf accounts for dates properly
        if (domain[0] instanceof Date) {
          return [d - Domainer.ONE_DAY, d + Domainer.ONE_DAY];
        } else {
          return [d - Domainer.PADDING_FOR_IDENTICAL_DOMAIN,
                  d + Domainer.PADDING_FOR_IDENTICAL_DOMAIN];
        }
      }
      var extent = domain[1] - domain[0];
      var newDomain = [domain[0].valueOf() - this.padProportion/2 * extent,
                       domain[1].valueOf() + this.padProportion/2 * extent];
      if (this.paddingExceptions.has(domain[0])) {
        newDomain[0] = domain[0];
      }
      if (this.paddingExceptions.has(domain[1])) {
        newDomain[1] = domain[1];
      }
      return newDomain;
    }

    private niceDomain(scale: Abstract.QuantitiveScale, domain: any[]): any[] {
      if (this.doNice) {
        return scale._niceDomain(domain, this.niceCount);
      } else {
        return domain;
      }
    }

    private includeDomain(domain: any[]): any[] {
      return this.includedValues.values().reduce(
        (domain, value) => [Math.min(domain[0], value), Math.max(domain[1], value)],
        domain
      );
    }
  }
}
