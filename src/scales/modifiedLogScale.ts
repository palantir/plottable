///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class ModifiedLog extends Abstract.QuantitiveScale {
    private base: number;
    private pivot: number;
    private untransformedDomain: number[];

    private static TICKS_PER_CLUSTER = 10;

    /**
     * Creates a new Scale.ModifiedLog.
     *
     * A ModifiedLog scale acts as a regular log scale for large numbers.
     * As it approaches 0, it gradually becomes linear. This means that the
     * scale won't freak out if you give it 0 or a negative number, where an
     * ordinary Log scale would.
     *
     * However, it does mean that scale will be effectively linear as values
     * approach 0. If you want very small values on a log scale, you should use
     * an ordinary Scale.Log instead.
     *
     * @constructor
     * @param {number} [pivot]
     *        For pivot <= x, scale(x) = log(x).
     *
     *        For 0 < x < pivot, scale(x) will become more and more
     *        linear as it approaches 0.
     *
     *        At x == 0, scale(x) == 0.
     *
     *        For negative values, scale(-x) = -scale(x).
     *
     *        Defaults to 10, and must be > 1.
     *
     * @param {number} [base]
     *        The base of the log. Defaults to 10, and must be > 0.
     */
    constructor(pivot = 10, base = 10) {
      super(d3.scale.linear());
      this.base = base;
      this.pivot = pivot;
      this.untransformedDomain = this._defaultExtent();
      this._lastRequestedTickCount = 40;
      if (pivot <= 1) {
        throw new Error("ModifiedLogScale: The pivot must be > 1");
      }
      if (base <= 0) {
        throw new Error("ModifiedLogScale: The base must be > 0");
      }
    }

    /**
     * Returns an adjusted log10 value for graphing purposes.  The first
     * adjustment is that negative values are changed to positive during
     * the calculations, and then the answer is negated at the end.  The
     * second is that, for values less than 10, an increasingly large
     * (0 to 1) scaling factor is added such that at 0 the value is
     * adjusted to 1, resulting in a returned result of 0.
     */
    private adjustedLog(x: number): number {
      var negationFactor = x < 0 ? -1 : 1;
      x *= negationFactor;

      if (x < this.pivot) {
        x += (this.pivot - x) / this.pivot;
      }

      x = Math.log(x) / Math.log(this.base);

      x *= negationFactor;
      return x;
    }

    private invertedAdjustedLog(x: number): number {
      var negationFactor = x < 0 ? -1 : 1;
      x *= negationFactor;

      x = Math.pow(this.base, x);

      if (x < this.pivot) {
        x = (this.pivot * (x - 1)) / (this.pivot - 1);
      }

      x *= negationFactor;
      return x;
    }

    public scale(x: number): number {
      return this._d3Scale(this.adjustedLog(x));
    }

    public invert(x: number): number {
      return this.invertedAdjustedLog(this._d3Scale.invert(x));
    }

    public _getDomain() {
      return this.untransformedDomain;
    }

    public _setDomain(values: number[]) {
      this.untransformedDomain = values;
      var transformedDomain = [this.adjustedLog(values[0]), this.adjustedLog(values[1])];
      this._d3Scale.domain(transformedDomain);
      this.broadcaster.broadcast();
      return this;
    }

    public ticks(count?: number) {
      if (count != null) {
        super.ticks(count);
      }

      // Say your domain is [-100, 100] and your pivot is 10.
      // then we're going to draw negative log ticks from -100 to -10,
      // linear ticks from -10 to 10, and positive log ticks from 10 to 100.
      var middle = (x: number, y: number, z: number) => Math.max(x, Math.min(y, z));
      var negativeLower = this.untransformedDomain[0];
      var negativeUpper = middle(this.untransformedDomain[0], this.untransformedDomain[1], -this.pivot);
      var positiveLower = middle(this.untransformedDomain[0], this.untransformedDomain[1], this.pivot);
      var positiveUpper = this.untransformedDomain[1];

      var negativeTickCount = this.howManyTicks(negativeLower, negativeUpper);
      var positiveTickCount = this.howManyTicks(positiveLower, positiveUpper);
      var linearTickCount = this.howManyTicks(negativeUpper, positiveLower);

      var negativeLogTicks = this.logTicks(negativeTickCount, -negativeUpper, -negativeLower)
                                 .map((x) => -x);
      var positiveLogTicks = this.logTicks(positiveTickCount, positiveLower, positiveUpper);
      var linearTicks = d3.scale.linear()
                          .domain([negativeUpper, positiveLower])
                          .ticks(linearTickCount);

      return negativeLogTicks.concat(positiveLogTicks).concat(linearTicks);
    }

    /**
     * Return approximately count ticks from lower to upper.
     *
     * This will generate ticks in "clusters", e.g. [10, 20, 30, ... 90] would
     * be a cluster, [100, 200, 300, ... 900] would be another cluster.
     *
     * Each cluster will have ModifiedLog.TICKS_PER_CLUSTER ticks.
     *
     * This function will generate as many clusters as it can while not
     * drastically exceeding count.
     */
    private logTicks(count: number, lower: number, upper: number): number[] {
      if (count === 0) {
        return [];
      }

      var startLogged = Math.log(lower) / Math.log(this.base);
      var endLogged = Math.log(upper) / Math.log(this.base);
      var clusters = count / ModifiedLog.TICKS_PER_CLUSTER;
      var skip = Math.max(1, Math.floor((endLogged - startLogged) / clusters));
      var logged = d3.range(1, this.base, this.base / ModifiedLog.TICKS_PER_CLUSTER)
                     .map((x) => Math.log(x) / Math.log(this.base));

      var bases = d3.range(Math.floor(startLogged), Math.ceil(endLogged), skip);
      var scaled = bases.map((b) => logged.map((x) => b + x * skip));
      var flattened = Util.Methods.flatten(scaled);
      var powed = flattened.map((x) => Math.pow(this.base, x));
      var rounded = powed.map((x) => Number(x.toPrecision(2)));
      var unique = Util.Methods.uniqNumbers(rounded);
      var filtered = unique.filter((x) => lower <= x && x <= upper);
      return filtered;
    }

    /**
     * How many ticks does the range [lower, upper] deserve?
     *
     * e.g. if your domain was [10, 1000] and I asked howManyTicks(10, 100),
     * I would get 1/2 of the ticks. The range 10, 100 takes up 1/2 of the
     * distance when plotted.
     */
    private howManyTicks(lower: number, upper: number): number {
      var min = this.adjustedLog(this.untransformedDomain[0]);
      var max = this.adjustedLog(this.untransformedDomain[1]);
      var adjustedLower = this.adjustedLog(lower);
      var adjustedUpper = this.adjustedLog(upper);
      var proportion = (adjustedUpper - adjustedLower) / (max - min);
      var ticks = Math.ceil(proportion * this._lastRequestedTickCount);
      return ticks;
    }


    public copy(): ModifiedLog {
      return new ModifiedLog(this.pivot, this.base);
    }

    public _niceDomain(domain: any[], count?: number): any[] {
      return domain;
    }

  }
}
}
