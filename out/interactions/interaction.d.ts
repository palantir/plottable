/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Interaction {
        public hitBox: D3.Selection;
        public componentToListenTo: Component;
        /**
        * Creates an Interaction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        constructor(componentToListenTo: Component);
        public _anchor(hitBox: D3.Selection): void;
        /**
        * Registers the Interaction on the Component it's listening to.
        * This needs to be called to activate the interaction.
        */
        public registerWithComponent(): Interaction;
    }
}
