/// <reference path="../reference.d.ts" />
declare module Plottable {
    class ClickInteraction extends Interaction {
        private _callback;
        /**
        * Creates a ClickInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for clicks on.
        */
        constructor(componentToListenTo: Component);
        public _anchor(hitBox: D3.Selection): void;
        /**
        * Sets an callback to be called when a click is received.
        *
        * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
        */
        public callback(cb: (x: number, y: number) => any): ClickInteraction;
    }
}
