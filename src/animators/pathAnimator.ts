///<reference path="../reference.ts" />

module Plottable {
export module Abstract {

  export class Path extends Animator.Base {

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Transition.Transition {
      return super.animate(selection, attrToProjector)
                  .attrTween("d", (d) => this._pathTween(d, attrToProjector["d"]));
    }

    public _pathTween(d: any, dProjector: any): D3.Transition.BaseInterpolate {
      return (t: any) => {
        return dProjector(d);
      }
    }

  }

}
}
