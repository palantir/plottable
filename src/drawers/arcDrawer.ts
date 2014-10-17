///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Arc extends Element {

    constructor(key: string) {
      super(key);
      this.svgElement("path");
    }

    private createArc(innerRadiusF: AppliedAccessor, outerRadiusF: AppliedAccessor) {
      return d3.svg.arc()
                   .innerRadius(innerRadiusF)
                   .outerRadius(outerRadiusF);
    }

    private retargetProjectors(attrToProjector: AttributeToProjector): AttributeToProjector {
      var retargetedAttrToProjector: AttributeToProjector = {};
      d3.entries(attrToProjector).forEach((entry) => {
        retargetedAttrToProjector[entry.key] = (d: D3.Layout.ArcDescriptor, i: number) => entry.value(d.data, i);
      });
      return retargetedAttrToProjector;
    }

    public _drawStep(step: DrawStep) {
      var attrToProjector = <AttributeToProjector>_Util.Methods.copyMap(step.attrToProjector);
      attrToProjector = this.retargetProjectors(attrToProjector);
      var innerRadiusF = attrToProjector["inner-radius"];
      var outerRadiusF = attrToProjector["outer-radius"];
      delete attrToProjector["inner-radius"];
      delete attrToProjector["outer-radius"];

      attrToProjector["d"] = this.createArc(innerRadiusF, outerRadiusF);
      super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
    }

    public draw(data: any[], drawSteps: DrawStep[]) {
      var valueAccessor = drawSteps[0].attrToProjector["value"];
      var pie = d3.layout.pie()
                          .sort(null)
                          .value(valueAccessor)(data);

      drawSteps.forEach(s => delete s.attrToProjector["value"]);
      super.draw(pie, drawSteps);
    }
  }
}
}
