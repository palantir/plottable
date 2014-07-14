///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class ModifiedLog extends Abstract.QuantitiveScale {
    private base: number;
    private pivot: number;
    private untransformedDomain: number[];

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
        this._lastRequestedTickCount = count;
      }
      if (this.untransformedDomain[0] > 0 || this.untransformedDomain[1] < 0) {
        return d3.scale.log().domain(this.untransformedDomain).ticks(this._lastRequestedTickCount);
      } else {
        var negativeLogTicks = d3.scale.log()
                            .domain([this.untransformedDomain[0], -this.pivot])
                            .ticks(this._lastRequestedTickCount);
        var positiveLogTicks = d3.scale.log()
                            .domain([this.pivot, this.untransformedDomain[1]])
                            .ticks(this._lastRequestedTickCount);
        var linearTicks = d3.scale.linear()
                            .domain([Math.max(this.untransformedDomain[0], -this.pivot),
                                     Math.min(this.untransformedDomain[1], this.pivot)])
                            .ticks(this._lastRequestedTickCount);

        return negativeLogTicks.concat(positiveLogTicks).concat(linearTicks);
      }
    }

    public copy(): ModifiedLog {
      return new ModifiedLog(this.pivot, this.base);
    }

  }
}
}
