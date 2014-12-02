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
      var innerRadiusF = attrToProjector["inner-radius"];
      var outerRadiusF = attrToProjector["outer-radius"];
      delete attrToProjector["inner-radius"];
      delete attrToProjector["outer-radius"];

      attrToProjector["d"] = this._createArc(innerRadiusF, outerRadiusF);
      return super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
    }

    public draw(data: any[], drawSteps: DrawStep[], userMetadata: any, plotMetadata: Plot.PlotMetadata) {
      // HACKHACK Applying metadata should be done in base class
      var valueAccessor = (d: any, i: number) => drawSteps[0].attrToProjector["value"](d, i, userMetadata, plotMetadata);
      var pie = d3.layout.pie()
                          .sort(null)
                          .value(valueAccessor)(data);

      drawSteps.forEach(s => delete s.attrToProjector["value"]);
      return super.draw(pie, drawSteps, userMetadata, plotMetadata);
    }
  }
}
}
