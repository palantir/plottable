///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Log extends QuantitativeScale<number> {

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
        Utils.Methods.warn("Plottable.Scale.Log is deprecated. If possible, use Plottable.Scale.ModifiedLog instead.");
      }
    }

    public _defaultExtent(): number[] {
      return [1, 10];
    }
  }
}
}
