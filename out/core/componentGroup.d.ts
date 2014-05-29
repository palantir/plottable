/// <reference path="../reference.d.ts" />
declare module Plottable {
    class ComponentGroup extends ComponentContainer {
        /**
        * Creates a ComponentGroup.
        *
        * @constructor
        * @param {Component[]} [components] The Components in the ComponentGroup.
        */
        constructor(components?: Component[]);
        public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
        public merge(c: Component): ComponentGroup;
        public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): ComponentGroup;
        public _isFixedWidth(): boolean;
        public _isFixedHeight(): boolean;
    }
}
