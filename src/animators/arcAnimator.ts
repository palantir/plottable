///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  export class Arc extends Abstract.Path {

    public _pathTween(d: any, dProjector: any): D3.Transition.BaseInterpolate {
      var i = d3.interpolate(0, d.endAngle);
      var j = d3.interpolate(0, d.startAngle);
      return (t: any) => {
        d.startAngle = i(t);
        d.endAngle = j(t);
        return (<D3.Svg.Arc> dProjector)(d);
      }
    }

  }

}
}
