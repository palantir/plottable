///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class Rect extends Default {

    public isVertical: boolean;
    public isReverse: boolean;

    constructor(isVertical = true, isReverse = false) {
      super();
      this.isVertical = isVertical;
      this.isReverse = isReverse;
    }

    public animate(selection: any, attrToProjector: IAttributeToProjector, plot: Abstract.Plot): any {

      var copyAttrToProjector: IAttributeToProjector = {};
      var animatedAttributes = this.getAnimateAttributes();

      for (var i = 0; i < animatedAttributes.length; i++) {
        var attribute = animatedAttributes[i];
        copyAttrToProjector[attribute] = attrToProjector[attribute];
      }

      if (this.isVertical) {
        var height = attrToProjector["height"];
        if (!this.isReverse) {
          var yFunction = copyAttrToProjector["y"];
          copyAttrToProjector["y"] = (d: any, i: number) => yFunction(d, i) + height(d, i);
        }
        copyAttrToProjector["height"] = () => 0;
      } else {
        var width = attrToProjector["width"];
        if (!this.isReverse) {
          var xFunction = copyAttrToProjector["x"];
          copyAttrToProjector["x"] = (d: any, i: number) => xFunction(d, i) - width(d, i);
        }
        copyAttrToProjector["width"] = () => 0;
      }
      selection.attr(copyAttrToProjector);
      return super.animate(selection, attrToProjector, plot);
    }

    private getAnimateAttributes() {
      return ["height", "width", "x", "y"];
    }

  }

}
}
