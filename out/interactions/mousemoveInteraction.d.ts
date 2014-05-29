/// <reference path="../reference.d.ts" />
declare module Plottable {
    class MousemoveInteraction extends Interaction {
        constructor(componentToListenTo: Component);
        public _anchor(hitBox: D3.Selection): void;
        public mousemove(x: number, y: number): void;
    }
}
