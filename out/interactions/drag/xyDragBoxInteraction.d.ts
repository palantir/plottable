/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class XYDragBoxInteraction extends DragBoxInteraction {
        public _drag(): void;
        public _doDragend(): void;
    }
}
