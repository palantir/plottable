///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Arc extends Element {

    constructor(key: string) {
      super(key);
      this._svgElement = "path";
    }

    private retargetProjectors(attrToProjector: AttributeToAppliedProjector): AttributeToAppliedProjector {
      var retargetedAttrToProjector: AttributeToAppliedProjector = {};
      d3.entries(attrToProjector).forEach((entry) => {
        retargetedAttrToProjector[entry.key] = (d: D3.Layout.ArcDescriptor, i: number) => entry.value(d.data, i);
      });
      return retargetedAttrToProjector;
    }

    public _drawStep(step: AppliedDrawStep) {
      var attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToProjector);
      var dProjector = attrToProjector["d"];
      attrToProjector = this.retargetProjectors(attrToProjector);
      attrToProjector["d"] = dProjector;
      return super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
    }

    public draw(data: any[], drawSteps: DrawStep[], dataset: Dataset) {
      // HACKHACK Applying metadata should be done in base class
      var valueAccessor = (d: any, i: number) => drawSteps[0].attrToProjector["sector-value"](d, i, dataset);

      data = data.filter(e => Plottable.Utils.Methods.isValidNumber(+valueAccessor(e, null)));

      var pie = d3.layout.pie()
                          .sort(null)
                          .value(valueAccessor)(data);

      drawSteps.forEach(s => delete s.attrToProjector["sector-value"]);
      pie.forEach((slice) => {
        if (slice.value < 0) {
          Utils.Methods.warn("Negative values will not render correctly in a pie chart.");
        }
      });
      return super.draw(pie, drawSteps, dataset);
    }
  }
}
}
