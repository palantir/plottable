///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Arc<D> extends Element {

    private _piePlot: Plots.Pie<D>;

    constructor(key: string, plot: Plots.Pie<D>) {
      super(key);
      this._piePlot = plot;
      this._svgElement = "path";
    }

    private _createArc() {
      var metadata = (<any> this._piePlot)._key2PlotDatasetKey.get(this.key).dataset.metadata();
      var plotMetadata = (<any> this._piePlot)._key2PlotDatasetKey.get(this.key).plotMetadata;
      return d3.svg.arc()
                   .innerRadius((d, i) => Arc._scaledAccessor(this._piePlot.innerRadius())(d.data, i, metadata, plotMetadata))
                   .outerRadius((d, i) => Arc._scaledAccessor(this._piePlot.outerRadius())(d.data, i, metadata, plotMetadata));
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
      attrToProjector = this.retargetProjectors(attrToProjector);

      attrToProjector["d"] = this._createArc();
      return super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
    }

    public draw(data: any[], drawSteps: DrawStep[], userMetadata: any, plotMetadata: Plots.PlotMetadata) {
      // HACKHACK Applying metadata should be done in base class
      var valueAccessor = (d: any, i: number) => Arc._scaledAccessor(this._piePlot.sectorValue())(d, i, userMetadata, plotMetadata);

      data = data.filter(e => Plottable.Utils.Methods.isValidNumber(+valueAccessor(e, null)));

      var pie = d3.layout.pie()
                          .sort(null)
                          .value(valueAccessor)(data);

      pie.forEach((slice) => {
        if (slice.value < 0) {
          Utils.Methods.warn("Negative values will not render correctly in a pie chart.");
        }
      });
      return super.draw(pie, drawSteps, userMetadata, plotMetadata);
    }

    public _getPixelPoint(datum: any, index: number): Point {
      var metadata = (<any> this._piePlot)._key2PlotDatasetKey.get(this.key).dataset.metadata();
      var plotMetadata = (<any> this._piePlot)._key2PlotDatasetKey.get(this.key).plotMetadata;
      var innerRadius = Arc._scaledAccessor(this._piePlot.innerRadius())(datum, index, metadata, plotMetadata);
      var outerRadius = Arc._scaledAccessor(this._piePlot.outerRadius())(datum, index, metadata, plotMetadata);
      var avgRadius = (innerRadius + outerRadius) / 2;
      var startAngle = +this._getSelection(index).datum().startAngle;
      var endAngle = +this._getSelection(index).datum().endAngle;
      var avgAngle = (startAngle + endAngle) / 2;
      return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
    }

    private static _scaledAccessor<SD, SR>(accScaleBinding: Plots.AccessorScaleBinding<SD, SR>): _Accessor {
      return accScaleBinding.scale == null ?
               accScaleBinding.accessor :
               (d: any, i: number, u: any, m: Plots.PlotMetadata) => accScaleBinding.scale.scale(accScaleBinding.accessor(d, i, u, m));
    }
  }
}
}
