///<reference path="../reference.ts" />

module Plottable {
export module Animators {

  /**
   * An animator implementation with no animation. The attributes are
   * immediately set on the selection.
   */
  export class Null implements Plot {

    public getTiming(selection: any) {
      return 0;
    }
    public animate(selection: any, attrToProjector: AttributeToProjector): D3.Selection {
      return selection.attr(attrToProjector);
    }
  }

}
}
