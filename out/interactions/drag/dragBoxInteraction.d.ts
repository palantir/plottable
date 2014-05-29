/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class DragBoxInteraction extends DragInteraction {
        private static CLASS_DRAG_BOX;
        public dragBox: D3.Selection;
        public boxIsDrawn: boolean;
        public _dragstart(): void;
        /**
        * Clears the highlighted drag-selection box drawn by the AreaInteraction.
        *
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public clearBox(): DragBoxInteraction;
        public setBox(x0: number, x1: number, y0: number, y1: number): DragBoxInteraction;
        public _anchor(hitBox: D3.Selection): DragBoxInteraction;
    }
}
