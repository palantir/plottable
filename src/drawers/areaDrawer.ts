///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends AbstractDrawer {

    public _getDrawSelection(data: any[]): any {
      var areaPath: D3.Selection;
      if (this._renderArea.select(".area").node()) {
        areaPath = this._renderArea.select(".area");
      } else {
        // Make sure to insert the area before the line
        areaPath = this._renderArea.insert("path", ".line");
      }
      areaPath.datum(data);
      return areaPath;
    }
  }
}
}
