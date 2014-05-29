/// <reference path="../reference.d.ts" />
declare module Plottable {
    class LogScale extends QuantitiveScale {
        /**
        * Creates a new LogScale.
        *
        * @constructor
        * @param {D3.Scale.LogScale} [scale] The D3 LogScale backing the LogScale. If not supplied, uses a default scale.
        */
        constructor();
        constructor(scale: D3.Scale.LogScale);
        /**
        * Creates a copy of the LogScale with the same domain and range but without any registered listeners.
        *
        * @returns {LogScale} A copy of the calling LogScale.
        */
        public copy(): LogScale;
    }
}
