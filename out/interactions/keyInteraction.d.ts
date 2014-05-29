/// <reference path="../reference.d.ts" />
declare module Plottable {
    class KeyInteraction extends Interaction {
        private _callback;
        private activated;
        private keyCode;
        /**
        * Creates a KeyInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for keypresses on.
        * @param {number} keyCode The key code to listen for.
        */
        constructor(componentToListenTo: Component, keyCode: number);
        public _anchor(hitBox: D3.Selection): void;
        /**
        * Sets an callback to be called when the designated key is pressed.
        *
        * @param {() => any} cb: Callback to be called.
        */
        public callback(cb: () => any): KeyInteraction;
    }
}
