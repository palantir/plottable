/// <reference path="../reference.d.ts" />
declare module Plottable {
    class ScaleDomainCoordinator {
        private rescaleInProgress;
        private scales;
        /**
        * Creates a ScaleDomainCoordinator.
        *
        * @constructor
        * @param {Scale[]} scales A list of scales whose domains should be linked.
        */
        constructor(scales: Scale[]);
        public rescale(scale: Scale): void;
    }
}
