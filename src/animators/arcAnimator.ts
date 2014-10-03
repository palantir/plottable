///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  export class Arc extends Abstract.Path {

    public _pathTween(d: D3.Layout.ArcDescriptor, dProjector: D3.Svg.Arc): D3.Transition.BaseInterpolate {
      var animateArc = d3.svg.arc()
                             .innerRadius(dProjector.innerRadius())
                             .outerRadius(dProjector.outerRadius());
      var startAngleInterpolate = d3.interpolate(0, d.startAngle);
      var endAngleInterpolate = d3.interpolate(0, d.endAngle);
      return (t: any) => {
        animateArc.startAngle = startAngleInterpolate(t);
        animateArc.endAngle = endAngleInterpolate(t);
        return dProjector(animateArc);
      };
    }

  }

}
}
