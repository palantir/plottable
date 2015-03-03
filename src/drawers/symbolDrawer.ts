///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Symbol extends AbstractDrawer {

    protected _enterData(data: any[]) {
      super._enterData(data);
      var dataElements = this._getDrawSelection().data(data);
      dataElements.enter().append("path");
      dataElements.exit().remove();
      dataElements.classed("symbol", true);
    }

    private _getDrawSelection() {
      return this._getRenderArea().selectAll("path");
    }

    protected _drawStep(step: AppliedDrawStep) {
      super._drawStep(step);
      var attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      this._attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      attrToProjector["transform"] = (datum: any, index: number) =>
        "translate(" + xProjector(datum, index) + "," + yProjector(datum, index) + ")";

      var symbolProjector = attrToProjector["symbol"];
      var rProjector = attrToProjector["r"];
      delete attrToProjector["symbol"];
      delete attrToProjector["r"];

      attrToProjector["d"] = (datum: any, index: number) =>
        symbolProjector(datum, index)(rProjector(datum, index))(datum, index);

      var drawSelection = this._getDrawSelection();
      if (attrToProjector["fill"]) {
        drawSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      step.animator.animate(drawSelection, attrToProjector);
    }

    public _getSelector() {
      return "path";
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }
  }
}
}
