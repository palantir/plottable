/// <reference path="../reference.d.ts" />
declare module Plottable {
    class LinearScale extends QuantitiveScale {
        /**
        * Creates a new LinearScale.
        *
        * @constructor
        * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the LinearScale. If not supplied, uses a default scale.
        */
        constructor();
        constructor(scale: D3.Scale.LinearScale);
        /**
        * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
        *
        * @returns {LinearScale} A copy of the calling LinearScale.
        */
        public copy(): LinearScale;
    }
}
