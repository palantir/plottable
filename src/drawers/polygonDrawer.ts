///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Polygon extends Abstract._Drawer {

    public draw(data: any[], attrToProjector: IAttributeToProjector, animator = new Animator.Null()) {
      throw new Error("MUST IMPLEMENT");
    }
  }
}
}
