/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class DragInteraction extends Interaction {
        private dragInitialized;
        private dragBehavior;
        public origin: number[];
        public location: number[];
        private constrainX;
        private constrainY;
        public callbackToCall: (dragInfo: any) => any;
        /**
        * Creates a DragInteraction.
        *
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        constructor(componentToListenTo: Component);
        /**
        * Adds a callback to be called when the AreaInteraction triggers.
        *
        * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public callback(cb?: (a: any) => any): DragInteraction;
        public _dragstart(): void;
        public _drag(): void;
        public _dragend(): void;
        public _doDragend(): void;
        public _anchor(hitBox: D3.Selection): DragInteraction;
    }
}
