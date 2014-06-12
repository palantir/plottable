///<reference path="../reference.ts" />

// is this the right module location? Probably not,
// but I'll worry about that later
module Plottable {
  export class Domainer {
    private doNice = false;
    private niceCount: number;
    private padProportion = 0.0;
    private scale: Abstract.QuantitiveScale;

    constructor(scale: Abstract.QuantitiveScale) {
      this.scale = scale;
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

    public computeDomain(extents: any[][]): any[] {
      return extents[0];
    }
  }
}
