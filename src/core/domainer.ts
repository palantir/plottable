///<reference path="../reference.ts" />

// is this the right module location? Probably not,
// but I'll worry about that later
module Plottable {
  export class Domainer {
    private doNice = false;
    private niceCount: number;
    private padProportion = 0.0;
    private scale: Abstract.QuantitiveScale;
    private static PADDING_FOR_IDENTICAL_DOMAIN = 1;

    constructor(scale: Abstract.QuantitiveScale) {
      this.scale = scale;
    }

    public computeDomain(extents: any[][]): any[] {
      return this.padDomain(this.combineExtents(extents));
    }

    public pad(padProportion = 0.05) {
      this.padProportion = padProportion;
      return this;
    }

    public nice(count?: number) {
      this.doNice = true;
      this.niceCount = count;
      return this;
    }

    private combineExtents(extents: any[][]): any[] {
      return [d3.min(extents, (e) => e[0]), d3.max(extents, (e) => e[1])];
    }

    private padDomain(domain: any[]): any[] {
      if (domain[0] === domain[1]) {
        var d = domain[0].valueOf(); // valueOf accounts for dates properly
        return [d - Domainer.PADDING_FOR_IDENTICAL_DOMAIN,
                d + Domainer.PADDING_FOR_IDENTICAL_DOMAIN];
      }
      var extent = domain[1] - domain[0];
      var newDomain = [domain[0].valueOf() - this.padProportion/2 * extent,
                       domain[1].valueOf() + this.padProportion/2 * extent];
      if (domain[0] === 0) {
        newDomain[0] = 0;
      }
      if (domain[1] === 0) {
        newDomain[1] = 0;
      }
      return newDomain;
    }

    private niceDomain(domain: any[]): any[] {
      if (this.doNice) {
        return this.scale.niceDomain(domain, this.niceCount);
      } else {
        return domain;
      }
    }
  }
}
