//<reference path="../reference.ts" />

module Plottable {
export module Scale {

  export class CompositeOrdinal extends Ordinal {

    private _subScales: Ordinal[] = [];

    constructor() {
      super();
    }

    public addSubscale(scale: Ordinal): CompositeOrdinal {
      this._subScales.push(scale);
      return this;
    }

    public smallestRangeBand(): number {
      if (this._subScales.length > 0) {
        return this._subScales[this._subScales.length - 1].rangeBand();
      } else {
        return super.rangeBand();
      }
    }

    public rangeBandLevel(n: number): number {
      return n === 0 ? super.rangeBand() : this._subScales[n - 1].rangeBand();
    }

    public innerPaddingLevel(n: number): number {
      return this.stepLevel(n) - this.rangeBandLevel(n);
    }

    public stepLevel(n: number): number {
      var d = this.domain();
      for (var i = 0; i <= n - 1; i++) {
        d = this.product(d, this._subScales[i].domain());
      }
      if (d.length < 2) {return 0;}
      return Math.abs(this.scale(d[1]) - this.scale(d[0]));
    }

    public fullBandStartAndWidth(v: any) {
      var n = v.length - 1;
      var start = (this.scale(v) - this.innerPaddingLevel(n) / 2);
      var width = this.rangeBandLevel(n) + this.innerPaddingLevel(n);
      return [start, width];
    }

    // This is the magic that hierarchically updates the range bands
    public range(): any[];
    public range(values: number[]): CompositeOrdinal;
    public range(values?: number[]): any {
      // Store result of super call so we can return it
      var val: any = super.range(values);

      // Hierarchically apply range to children
      if (!(values === undefined)) {
        var parentBand = this.rangeBand();
        this._subScales.forEach((subScale) => {
          subScale.range([0, parentBand]);
          parentBand = subScale.rangeBand();
        });
      }
      return val;
    }

    // Here we composite the scaling from our _subscales using variable arguments
    // So, usage is like .project('x', (d) -> xScale.scale(d.primary, d.secondary, d.tertiary))
    public scale(args: any[]) {
      var result = super.scale(args[0]);
      this._subScales.forEach((subScale, i) => {
        if (!(args[i + 1] === undefined)){
          result += subScale.scale(args[i + 1]);
        }
      });
      return result;
    }

    public product(d1: any[][], d2: any[]): any[][] {
      return d1.slice().map((d: any[]) => d2.slice().map((datum: any) => {
        var ret = d.slice();
        ret.push(datum);
        return ret;
      })).reduce((a: any[], b: any[]) => a.concat(b), []);
    }

    public getLevels(): number{
      return this._subScales.length + 1;
    }

    public domainLevel(n: number): any[] {
      return n === 0 ? this.domain() : this._subScales[n - 1].domain();
    }

    // (bdwyer) - to be updated once we have custom domainers? This makes
    // assumptions about the layout of data and how it is mapped to the sub
    // scales. Deserves some more thought depending on how the domainers are
    // going to work.
    public updateDomains(ds: DataSource, accessors: any[]): CompositeOrdinal {
      var funs = accessors.map((a: any) => Util.Methods.applyAccessor(a, ds));
      this.domain(Util.Methods.uniq(ds.data().slice().map(funs[0])).map((d: string) => [d]));
      this._subScales.forEach((subScale, i) => {
        if (funs[i + 1] === undefined) {
          return;
        }
        // (bdwyer) - THIS USES LODASH. Re-implmementing this functionality may be anoying.
        // var subDomain = _(data).map(keys[i + 1]).sortBy().uniq().value();
        subScale.domain(Util.Methods.uniq(ds.data().slice().map(funs[i + 1])));
      });

      // MORE LODASH.
      //var mainDomain = _(data).map(keys[0]).sortBy().uniq().value()

      return this;
    }
  }
}
}
