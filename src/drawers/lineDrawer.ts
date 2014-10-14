///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Line extends AbstractDrawer {
    public _className = "line";
    public _createDrawSelection(): D3.Selection {
      return this._renderArea.append("path");
    }
    public _getDrawSelection(data: any[]): any {
      var drawSelection: D3.Selection;
      if (this._renderArea.select("." + this._className).node()) {
        drawSelection = this._renderArea.select("." + this._className);
      } else {
        // Make sure to insert the area before the line
        drawSelection = this._createDrawSelection();
      }
      drawSelection.datum(data);
      return drawSelection;
    }
  }
}
}
