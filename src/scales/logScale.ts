///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Log extends Abstract.QuantitiveScale {

    /**
     * Creates a new Scale.Log.
     *
     * @constructor
     * @param {D3.Scale.LogScale} [scale] The D3 Scale.Log backing the Scale.Log. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LogScale);
    constructor(scale?: any) {
      super(scale == null ? d3.scale.log() : scale);
    }

    /**
     * Creates a copy of the Scale.Log with the same domain and range but without any registered listeners.
     *
     * @returns {Scale.Log} A copy of the calling Scale.Log.
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
