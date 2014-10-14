///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends Line {
    public _className = "area";
    public _createDrawSelection(): D3.Selection {
      return this._renderArea.insert("path", ".line");
    }
  }
}
}
