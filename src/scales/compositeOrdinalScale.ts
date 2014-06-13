///<reference path="../reference.ts" />

module Plottable {
export module Scale {

  export class CompositeOrdinal extends Ordinal {

    private _subScales: Ordinal[] = [];

    constructor() {
      super();
      // (bdwyer) - this may not be necessary depending on how the new domainers work
      this._autoDomainAutomatically = false;
    }

    public addSubscale(scale: Ordinal): CompositeOrdinal {
      this._subScales.push(scale);
      return this;
    }

    public rangeBand(): number {
      // (bdwyer) This is necessary to override because vertical bars does not allow us
      // to override width. Once that issue is fixed, we can remove this
      return this.smallestRangeBand();
    }

    public smallestRangeBand(): number {
      if (this._subScales.length > 0) {
        return this._subScales[this._subScales.length - 1].rangeBand();
      } else {
        return super.rangeBand();
      }
    }

    // This is the magic that hierarchically updates the range bands
    public range(): any[];
    public range(values: number[]): CompositeOrdinal;
    public range(values?: number[]): any {
      // Store result of super call so we can return it
      var val: any = super.range(values);

      // Hierarchically apply range to children
      if (!(values === undefined)) {
        // (bdwyer) this can be change back to this.rangeBand() when we fix the above rangeBand issue
        var parentBand = super.rangeBand();
        this._subScales.forEach((subScale) => {
          subScale.range([0, parentBand]);
          parentBand = subScale.rangeBand();
        });
      }
      return val;
    }

    // Here we composite the scaling from our _subscales using variable arguments
    // So, usage is like .project('x', (d) -> xScale.scale(d.primary, d.secondary, d.tertiary))
    public scale(...args: any[]) {
      var result = super.scale(args[0]);
      this._subScales.forEach((subScale, i) => {
        if (!(args[i + 1] === undefined)){
          result += subScale.scale(args[i + 1]);
        }
      });
      return result;
    }

    // (bdwyer) - to be updated once we have custom domainers? This makes
    // assumptions about the layout of data and how it is mapped to the sub
    // scales. Deserves some more thought depending on how the domainers are
    // going to work.
    public updateDomains(data: any[], ...keys: any[]): CompositeOrdinal {
      this._subScales.forEach((subScale, i) => {
        if (keys[i + 1] === undefined) {
          return;
        }
        // (bdwyer) - THIS USES LODASH. Re-implmementing this functionality may be anoying.
        // var subDomain = _(data).map(keys[i + 1]).sortBy().uniq().value();
        var subDomain = [0, 1];
        subScale.domain(subDomain);
      });

      // MORE LODASH.
      //var mainDomain = _(data).map(keys[0]).sortBy().uniq().value()
      var mainDomain = [0, 1];
      this.domain(mainDomain);

      return this;
    }
  }

}
}
