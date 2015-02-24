///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Line extends AbstractDrawer {
    public static LINE_CLASS = "line";

    private _pathSelection: D3.Selection;

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      this._pathSelection = area.append("path")
                               .classed(Line.LINE_CLASS, true)
                               .style({
                                 "fill": "none",
                                 "vector-effect": "non-scaling-stroke"
                               });
      super.setup(area);
    }

    private _createLine(xFunction: _AppliedProjector, yFunction: _AppliedProjector, definedFunction: _AppliedProjector) {
      if(!definedFunction) {
        definedFunction = (d, i) => true;
      }

      return d3.svg.line()
                   .x(xFunction)
                   .y(yFunction)
                   .defined(definedFunction);
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      var baseTime = super._drawStep(step);
      var attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      var definedFunction = attrToProjector["defined"];

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      attrToProjector["d"] = this._createLine(xProjector, yProjector, definedFunction);
      if (attrToProjector["fill"]) {
        this._pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      step.animator.animate(this._pathSelection, attrToProjector);

      // Restore classes that may have been overridden by class projectors
      this._pathSelection.classed(Line.LINE_CLASS, true);
    }

    public _getSelector() {
      return "." + Line.LINE_CLASS;
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }

    public _getSelection(index: number): D3.Selection {
      return this._getRenderArea().select(this._getSelector());
    }

    public _getSelectionDistance(selection: D3.Selection, pixelPoint: Point): number {
      var lineSegments = d3.pairs(selection.datum().map((lineDatum: any, index: number) => this._getPixelPoint(lineDatum, index)));
      return _Util.Methods.min(lineSegments, (lineSegment: Point[]) => {
        if (lineSegment[0].x === lineSegment[1].x) {
          var closestY = _Util.Methods.clamp(pixelPoint.y, lineSegment[0].y, lineSegment[1].y);
          return _Util.Methods.pointDistance({x: lineSegment[0].x, y: closestY}, pixelPoint);
        }
        var slope = (lineSegment[1].y - lineSegment[0].y) / (lineSegment[1].x - lineSegment[0].x);
        var lineConstant = lineSegment[0].y - slope * lineSegment[0].x;

        if (_Util.Methods.inRange(pixelPoint.x, lineSegment[0].x, lineSegment[1].x) &&
            _Util.Methods.inRange(pixelPoint.y, lineSegment[0].y, lineSegment[1].y) &&
            (slope * pixelPoint.x + lineConstant === pixelPoint.y)) {
          return 0;
        } else {
          var closestPoint = _Util.Methods.closestPoint(pixelPoint, lineSegment[0], lineSegment[1]);
          return _Util.Methods.pointDistance(closestPoint, pixelPoint);
        }
      }, Infinity);
    }

    public _getClosestDatumPoint(selection: D3.Selection, pixelPoint: Point): Point {
      var pixelPoints = selection.data().map((datum, index) =>  this._getPixelPoint(datum, index));
      return _Util.Methods.min(pixelPoints, (point: Point) => _Util.Methods.pointDistance(pixelPoint, point), <any> null);
    }
  }
}
}
