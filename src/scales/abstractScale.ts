///<reference path="../reference.ts" />

module Plottable {
  export class Scale<D, R> extends Core.PlottableObject {
    public broadcaster: Core.Broadcaster<Scale<D, R>>;
    public typeCoercer: (d: any) => any = (d: any) => d;

    protected d3Scale: D3.Scale.Scale;

    private autoDomainAutomatically = true;
    private domainModificationInProgress: boolean = false;
    private rendererExtents: {[rendererAttrID: string]: D[]} = {};
    /**
     * Constructs a new Scale.
     *
     * A Scale is a wrapper around a D3.Scale.Scale. A Scale is really just a
     * function. Scales have a domain (input), a range (output), and a function
     * from domain to range.
     *
     * @constructor
     * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
     */
    constructor(scale: D3.Scale.Scale) {
      super();
      this.broadcaster = new Core.Broadcaster(this);
      this.d3Scale = scale;
    }

    /**
     * Modifies the domain on the scale so that it includes the extent of all
     * perspectives it depends on. This will normally happen automatically, but
     * if you set domain explicitly with `plot.domain(x)`, you will need to
     * call this function if you want the domain to neccessarily include all
     * the data.
     *
     * Extent: The [min, max] pair for a Scale.QuantitativeScale, all covered
     * strings for a Scale.Category.
     *
     * Perspective: A combination of a Dataset and an Accessor that
     * represents a view in to the data.
     *
     * @returns {Scale} The calling Scale.
     */
    public autoDomain() {
      this.autoDomainAutomatically = true;
      this.setDomain(this.getExtent());
      return this;
    }

    public autoDomainIfAutomaticMode() {
      if (this.autoDomainAutomatically) {
        this.autoDomain();
      }
    }

    /**
     * Constructs a copy of the Scale with the same domain and range but without
     * any registered listeners.
     *
     * @returns {Scale} A copy of the calling Scale.
     */
    public copy(): Scale<D, R> {
      return new Scale<D, R>(this.d3Scale.copy());
    }

    /**
     * Gets the domain.
     *
     * @returns {D[]} The current domain.
     */
    public domain(): D[];
    /**
     * Sets the domain.
     *
     * @param {D[]} values If provided, the new value for the domain. On
     * a QuantitativeScaleScale, this is a [min, max] pair, or a [max, min] pair to
     * make the function decreasing. On Scale.Ordinal, this is an array of all
     * input values.
     * @returns {Scale} The calling Scale.
     */
    public domain(values: D[]): Scale<D, R>;
    public domain(values?: D[]): any {
      if (values == null) {
        return this.getDomain();
      } else {
        this.autoDomainAutomatically = false;
        this.setDomain(values);
        return this;
      }
    }

    /**
     * Gets the range.
     *
     * In the case of having a numeric range, it will be a [min, max] pair. In
     * the case of string range (e.g. Scale.InterpolatedColor), it will be a
     * list of all possible outputs.
     *
     * @returns {R[]} The current range.
     */
    public range(): R[];
    /**
     * Sets the range.
     *
     * In the case of having a numeric range, it will be a [min, max] pair. In
     * the case of string range (e.g. Scale.InterpolatedColor), it will be a
     * list of all possible outputs.
     *
     * @param {R[]} values If provided, the new values for the range.
     * @returns {Scale} The calling Scale.
     */
    public range(values: R[]): Scale<D, R>;
    public range(values?: R[]): any {
      if (values == null) {
        return this.d3Scale.range();
      } else {
        this.d3Scale.range(values);
        return this;
      }
    }

    public _removeExtent(plotProvidedKey: string, attr: string) {
      delete this.rendererExtents[plotProvidedKey + attr];
      this.autoDomainIfAutomaticMode();
      return this;
    }

    /**
     * Computes the range value corresponding to a given domain value. In other
     * words, apply the function to value.
     *
     * @param {R} value A domain value to be scaled.
     * @returns {R} The range value corresponding to the supplied domain value.
     */
    public scale(value: D): R {
      return this.d3Scale(value);
    }

    /**
     * When a renderer determines that the extent of a projector has changed,
     * it will call this function. This function should ensure that
     * the scale has a domain at least large enough to include extent.
     *
     * @param {number} rendererID A unique indentifier of the renderer sending
     *                 the new extent.
     * @param {string} attr The attribute being projected, e.g. "x", "y0", "r"
     * @param {D[]} extent The new extent to be included in the scale.
     */
    public updateExtent(plotProvidedKey: string, attr: string, extent: D[]) {
      this.rendererExtents[plotProvidedKey + attr] = extent;
      this.autoDomainIfAutomaticMode();
      return this;
    }

    protected getAllExtents(): D[][] {
      return d3.values(this.rendererExtents);
    }

    protected getDomain() {
      return this.d3Scale.domain();
    }

    protected getExtent(): D[] {
      return []; // this should be overwritten
    }

    protected setDomain(values: D[]) {
      if (!this.domainModificationInProgress) {
        this.domainModificationInProgress = true;
        this.d3Scale.domain(values);
        this.broadcaster.broadcast();
        this.domainModificationInProgress = false;
      }
    }
  }
}
