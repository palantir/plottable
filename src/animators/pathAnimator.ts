///<reference path="../reference.ts" />

module Plottable {
export module Abstract {

  export class Path extends Animator.Base {

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Transition.Transition {
      return super.animate(selection.attr(attrToProjector), attrToProjector)
                  .attrTween("d", (d) => this._pathTween(d, attrToProjector["d"]));
    }

    public _pathTween(d: any, dProjector: IAppliedAccessor): D3.Transition.BaseInterpolate {
      return (t: any) => dProjector(d);
    }

  }

}
}
