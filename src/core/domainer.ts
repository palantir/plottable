///<reference path="../reference.ts" />

module Plottable {

  export class Domainer {
    private doNice = false;
    private niceCount: number;
    private padProportion = 0.0;
    private padBeyondZero = true;
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
    constructor(combineExtents: (extents: any[][]) => any[] = Domainer.defaultCombineExtents) {
      this.combineExtents = combineExtents;
    }

    /**
     * @param {any[][]} extents The list of extents to be reduced to a single
     *        extent.
     * @param {Abstract.QuantitiveScale} scale
     *        Since nice() must do different things depending on Linear, Log,
     *        or Time scale, the scale must be passed in for nice() to work.
     */
    public computeDomain(extents: any[][], scale: Abstract.QuantitiveScale): any[] {
      if (extents.length === 0) {
        return [0, 1];
      } else {
        return this.niceDomain(scale, this.padDomain(this.combineExtents(extents)));
      }
    }

    /**
     * Pads out the domain of the scale by a specified ratio.
     *
     * @param {number} [padProportion] Proportionally how much bigger the 
     *         new domain should be (0.05 = 5% larger).
     */
    public pad(padProportion = 0.05): Domainer {
      this.padProportion = padProportion;
      this.padBeyondZero = true;
      return this;
    }

    public padUnlessZero(padProportion = 0.05): Domainer {
      this.padProportion = padProportion;
      this.padBeyondZero = false;
      return this;
    }

    /**
     * Extends the scale's domain so it starts and ends with "nice" values.
     *
     * @param {number} [count] The number of ticks that should fit inside the new domain.
     */
    public nice(count?: number): Domainer {
      this.doNice = true;
      this.niceCount = count;
      return this;
    }

    private static defaultCombineExtents(extents: any[][]): any[] {
      return [d3.min(extents, (e) => e[0]), d3.max(extents, (e) => e[1])];
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
      if (!this.padBeyondZero) {
        if (domain[0] === 0) {
          newDomain[0] = 0;
        }
        if (domain[1] === 0) {
          newDomain[1] = 0;
        }
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
  }
}
