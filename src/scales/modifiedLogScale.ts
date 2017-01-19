namespace Plottable.Scales {
  export class ModifiedLog extends QuantitativeScale<number> {
    private _base: number;
    private _d3Scale: d3.scale.Linear<number, number>;
    private _pivot: number;
    private _untransformedDomain: number[];

    /**
     * A ModifiedLog Scale acts as a regular log scale for large numbers.
     * As it approaches 0, it gradually becomes linear.
     * Consequently, a ModifiedLog Scale can process 0 and negative numbers.
     *
     * For x >= base, scale(x) = log(x).
     *
     * For 0 < x < base, scale(x) will become more and more
     * linear as it approaches 0.
     *
     * At x == 0, scale(x) == 0.
     *
     * For negative values, scale(-x) = -scale(x).
     *
     * The range and domain for the scale should also be set, using the
     * range() and domain() accessors, respectively.
     *
     * For `range`, provide a two-element array giving the minimum and
     * maximum of values produced when scaling.
     *
     * For `domain` provide a two-element array giving the minimum and
     * maximum of the values that will be scaled.
     *
     * @constructor
     * @param {number} [base=10]
     *        The base of the log. Must be > 1.
     *
     */
    constructor(base = 10) {
      super();
      this._d3Scale = d3.scale.linear();
      this._base = base;
      this._pivot = this._base;
      this._setDomain(this._defaultExtent());
      if (base <= 1) {
        throw new Error("ModifiedLogScale: The base must be > 1");
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
    private _adjustedLog(x: number): number {
      let negationFactor = x < 0 ? -1 : 1;
      x *= negationFactor;

      if (x < this._pivot) {
        x += (this._pivot - x) / this._pivot;
      }

      x = Math.log(x) / Math.log(this._base);

      x *= negationFactor;
      return x;
    }

    private _invertedAdjustedLog(x: number): number {
      let negationFactor = x < 0 ? -1 : 1;
      x *= negationFactor;

      x = Math.pow(this._base, x);

      if (x < this._pivot) {
        x = (this._pivot * (x - 1)) / (this._pivot - 1);
      }

      x *= negationFactor;
      return x;
    }

    public scale(x: number): number {
      return this._d3Scale(this._adjustedLog(x));
    }

    public invert(x: number): number {
      return this._invertedAdjustedLog(this._d3Scale.invert(x));
    }

    public scaleTransformation(value: number) {
      return this.scale(value);
    }

    public invertedTransformation(value: number) {
      return this.invert(value);
    }

    public getTransformationDomain() {
      return this.domain() as [number, number];
    }

    protected _getDomain() {
      return this._untransformedDomain;
    }

    protected _setDomain(values: number[]) {
      this._untransformedDomain = values;
      let transformedDomain = [this._adjustedLog(values[0]), this._adjustedLog(values[1])];
      super._setDomain(transformedDomain);
    }

    protected _backingScaleDomain(): number[]
    protected _backingScaleDomain(values: number[]): this
    protected _backingScaleDomain(values?: number[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        this._d3Scale.domain(values);
        return this;
      }
    }

    public ticks(): number[] {
      // Say your domain is [-100, 100] and your pivot is 10.
      // then we're going to draw negative log ticks from -100 to -10,
      // linear ticks from -10 to 10, and positive log ticks from 10 to 100.
      let middle = (x: number, y: number, z: number) => [x, y, z].sort((a, b) => a - b)[1];
      let min = Utils.Math.min(this._untransformedDomain, 0);
      let max = Utils.Math.max(this._untransformedDomain, 0);
      let negativeLower = min;
      let negativeUpper = middle(min, max, -this._pivot);
      let positiveLower = middle(min, max, this._pivot);
      let positiveUpper = max;

      let negativeLogTicks = this._logTicks(-negativeUpper, -negativeLower).map((x) => -x).reverse();
      let positiveLogTicks = this._logTicks(positiveLower, positiveUpper);

      let linearMin = Math.max(min, -this._pivot);
      let linearMax = Math.min(max, this._pivot);
      let linearTicks = d3.scale.linear().domain([linearMin, linearMax]).ticks(this._howManyTicks(linearMin, linearMax));
      let ticks = negativeLogTicks.concat(linearTicks).concat(positiveLogTicks);

      // If you only have 1 tick, you can't tell how big the scale is.
      if (ticks.length <= 1) {
        ticks = d3.scale.linear().domain([min, max]).ticks(Scales.ModifiedLog._DEFAULT_NUM_TICKS);
      }
      return ticks;
    }

    /**
     * Return an appropriate number of ticks from lower to upper.
     *
     * This will first try to fit as many powers of this.base as it can from
     * lower to upper.
     *
     * If it still has ticks after that, it will generate ticks in "clusters",
     * e.g. [20, 30, ... 90, 100] would be a cluster, [200, 300, ... 900, 1000]
     * would be another cluster.
     *
     * This function will generate clusters as large as it can while not
     * drastically exceeding its number of ticks.
     */
    private _logTicks(lower: number, upper: number): number[] {
      let nTicks = this._howManyTicks(lower, upper);
      if (nTicks === 0) {
        return [];
      }
      let startLogged = Math.floor(Math.log(lower) / Math.log(this._base));
      let endLogged = Math.ceil(Math.log(upper) / Math.log(this._base));
      let bases = d3.range(endLogged, startLogged, -Math.ceil((endLogged - startLogged) / nTicks));
      let multiples = d3.range(this._base, 1, -(this._base - 1)).map(Math.floor);
      let uniqMultiples = Utils.Array.uniq(multiples);
      let clusters = bases.map((b) => uniqMultiples.map((x) => Math.pow(this._base, b - 1) * x));
      let flattened = Utils.Array.flatten(clusters);
      let filtered = flattened.filter((x) => lower <= x && x <= upper);
      let sorted = filtered.sort((x, y) => x - y);
      return sorted;
    }

    /**
     * How many ticks does the range [lower, upper] deserve?
     *
     * e.g. if your domain was [10, 1000] and I asked _howManyTicks(10, 100),
     * I would get 1/2 of the ticks. The range 10, 100 takes up 1/2 of the
     * distance when plotted.
     */
    private _howManyTicks(lower: number, upper: number): number {
      let adjustedMin = this._adjustedLog(Utils.Math.min(this._untransformedDomain, 0));
      let adjustedMax = this._adjustedLog(Utils.Math.max(this._untransformedDomain, 0));
      let adjustedLower = this._adjustedLog(lower);
      let adjustedUpper = this._adjustedLog(upper);
      let proportion = (adjustedUpper - adjustedLower) / (adjustedMax - adjustedMin);
      let ticks = Math.ceil(proportion * Scales.ModifiedLog._DEFAULT_NUM_TICKS);
      return ticks;
    }

    protected _niceDomain(domain: number[], count?: number): number[] {
      return domain;
    }

    protected _defaultExtent(): number[] {
      return [0, this._base];
    }

    protected _expandSingleValueDomain(singleValueDomain: number[]): number[] {
      if (singleValueDomain[0] === singleValueDomain[1]) {
        let singleValue = singleValueDomain[0];
        if (singleValue > 0) {
          return [singleValue / this._base, singleValue * this._base];
        } else if (singleValue === 0) {
          return [-this._base, this._base];
        } else {
          return [singleValue * this._base, singleValue / this._base];
        }
      }
      return singleValueDomain;
    }

    protected _getRange() {
      return this._d3Scale.range();
    }

    protected _setRange(values: number[]) {
      this._d3Scale.range(values);
    }

    public defaultTicks(): number[] {
      return this._d3Scale.ticks(Scales.ModifiedLog._DEFAULT_NUM_TICKS);
    }
  }
}
