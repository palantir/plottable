/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class XDragBoxInteraction extends DragBoxInteraction {
        public _drag(): void;
        public _doDragend(): void;
        public setBox(x0: number, x1: number): XDragBoxInteraction;
    }
}
