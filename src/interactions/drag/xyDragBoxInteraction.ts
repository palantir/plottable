///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    constructor() {
      _Util.Methods.warn("XYDragBox is deprecated; use DragBox instead");
      super();
    }
  }
}
}
