///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Log extends Abstract.QuantitativeScale<number> {

    private static warned = false;

    /**
     * Constructs a new Scale.Log.
     *
     * Warning: Log is deprecated; if possible, use ModifiedLog. Log scales are
     * very unstable due to the fact that they can't handle 0 or negative
     * numbers. The only time when you would want to use a Log scale over a
     * ModifiedLog scale is if you're plotting very small data, such as all
     * data < 1.
     *
     * @constructor
     * @param {D3.Scale.LogScale} [scale] The D3 Scale.Log backing the Scale.Log. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LogScale);
    constructor(scale?: any) {
      super(scale == null ? d3.scale.log() : scale);
      if (!Log.warned) {
        Log.warned = true;
        _Util.Methods.warn("Plottable.Scale.Log is deprecated. If possible, use Plottable.Scale.ModifiedLog instead.");
      }
    }

    /**
     * Creates a copy of the Scale.Log with the same domain and range but without any registered listeners.
     *
     * @returns {Log} A copy of the calling Log.
     */
    public copy(): Log {
      return new Log(this._d3Scale.copy());
    }

    public _defaultExtent(): number[] {
      return [1, 10];
    }
  }
}
}
