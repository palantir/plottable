///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Arc extends Element {

    constructor(key: string) {
      super(key);
      this._svgElement = "path";
    }

    private _createArc(innerRadiusF: _AppliedProjector, outerRadiusF: _AppliedProjector) {
      return d3.svg.arc()
                   .innerRadius(innerRadiusF)
                   .outerRadius(outerRadiusF);
    }

    private retargetProjectors(attrToProjector: _AttributeToAppliedProjector): _AttributeToAppliedProjector {
      var retargetedAttrToProjector: _AttributeToAppliedProjector = {};
      d3.entries(attrToProjector).forEach((entry) => {
        retargetedAttrToProjector[entry.key] = (d: D3.Layout.ArcDescriptor, i: number) => entry.value(d.data, i);
      });
      return retargetedAttrToProjector;
    }

    public _drawStep(step: AppliedDrawStep) {
      var attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      attrToProjector = this.retargetProjectors(attrToProjector);
      this._attrToProjector = this.retargetProjectors(this._attrToProjector);
      var innerRadiusAccessor = attrToProjector["inner-radius"];
      var outerRadiusAccessor = attrToProjector["outer-radius"];
      delete attrToProjector["inner-radius"];
      delete attrToProjector["outer-radius"];

      attrToProjector["d"] = this._createArc(innerRadiusAccessor, outerRadiusAccessor);
      return super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
    }

    public draw(data: any[], drawSteps: DrawStep[], userMetadata: any, plotMetadata: Plot.PlotMetadata) {
      // HACKHACK Applying metadata should be done in base class
      var valueAccessor = (d: any, i: number) => drawSteps[0].attrToProjector["value"](d, i, userMetadata, plotMetadata);
      var pie = d3.layout.pie()
                          .sort(null)
                          .value(valueAccessor)(data);

      drawSteps.forEach(s => delete s.attrToProjector["value"]);
      pie.forEach((slice) => {
        if (slice.value < 0) {
          _Util.Methods.warn("Negative values will not render correctly in a pie chart.");
        }
      });
      return super.draw(pie, drawSteps, userMetadata, plotMetadata);
    }

    public _getPixelPoint(datum: any, index: number): Point {
      var innerRadiusAccessor = this._attrToProjector["inner-radius"];
      var outerRadiusAccessor = this._attrToProjector["outer-radius"];
      var avgRadius = (innerRadiusAccessor(datum, index) + outerRadiusAccessor(datum, index)) / 2;
      var avgAngle = (datum.startAngle + datum.endAngle) / 2;
      return { x: avgRadius * Math.sin(avgAngle), y: avgRadius * Math.cos(avgAngle) };
    }

    public _getSelectionDistance(selection: D3.Selection, pixelPoint: Point): number {
      var datum = selection.datum();
      var selectionIndex: number;
      this._getRenderArea().selectAll(this._getSelector()).each((pieDatum, index) => {
        if (datum === pieDatum) {
          selectionIndex = index;
        }
      });
      var innerRadius = this._attrToProjector["inner-radius"](datum, selectionIndex);
      var outerRadius = this._attrToProjector["outer-radius"](datum, selectionIndex);
      var startAngle = datum.startAngle;
      var endAngle = datum.endAngle;
      var pixelPointAngle = _Util.Methods.positiveMod(Math.atan2(pixelPoint.x, -pixelPoint.y), 2 * Math.PI);
      var pixelPointDistance = _Util.Methods.pointDistance({x: 0, y: 0}, pixelPoint);

      if (_Util.Methods.inRange(pixelPointAngle, startAngle, endAngle)) {
        if (_Util.Methods.inRange(pixelPointDistance, innerRadius, outerRadius)) {
          return 0;
        } else if (pixelPointDistance > outerRadius) {
          return pixelPointDistance - outerRadius;
        } else if (pixelPointDistance < innerRadius) {
          return innerRadius - pixelPointDistance;
        }
      } else {
        var closerAngle = _Util.Methods.clamp(pixelPointAngle, startAngle, endAngle);
        var innerSegmentPoint = { x: innerRadius * Math.sin(closerAngle), y: -innerRadius * Math.cos(closerAngle) };
        var outerSegmentPoint = { x: outerRadius * Math.sin(closerAngle), y: -outerRadius * Math.cos(closerAngle) };
        var closestPoint = _Util.Methods.closestPoint(pixelPoint, innerSegmentPoint, outerSegmentPoint);
        return _Util.Methods.pointDistance(pixelPoint, closestPoint);
      }
    }

    public _getClosestDatumPoint(selection: D3.Selection, pixelPoint: Point): Point {
      var datum = selection.datum();
      var selectionIndex: number;
      this._getRenderArea().selectAll(this._getSelector()).each((datum, index) => {
        if (datum === selection.data()) {
          selectionIndex = index;
        }
      });
      var outerRadius = this._attrToProjector["outer-radius"](datum, selectionIndex);
      var avgAngle = (datum.startAngle + datum.endAngle) / 2;
      return { x: outerRadius * Math.sin(avgAngle), y: -outerRadius * Math.cos(avgAngle) };
    }

    public _getClosestDatum(selection: D3.Selection, pixelPoint: Point): any {
      return selection.datum().data;
    }
  }
}
}
