///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class AbstractDrawer {
    public _renderArea: D3.Selection;
    public _className: string;
    public key: string;

    public classed(className: string): AbstractDrawer {
      this._className = className;
      return this;
    }

    /**
     * Constructs a Drawer
     *
     * @constructor
     * @param{string} key The key associated with this Drawer
     */
    constructor(key: string) {
        this.key = key;
    }

    /**
     * Removes the Drawer and its renderArea
     */
    public remove() {
      if (this._renderArea != null) {
        this._renderArea.remove();
      }
    }

    public _getDrawSelection(data: any[]): any {
      return null;
    }

    /**
     * Draws the data into the renderArea using the attrHash for attributes
     *
     * @param{any[]} data The data to be drawn
     * @param{attrHash} AttributeToProjector The list of attributes to set on the data
     */
    public draw(data: any[], attrToProjectors: AttributeToProjector[], animators: Animator.PlotAnimator[] = []) {
      var drawSelection = this._getDrawSelection(data);
      if(this._className) drawSelection.classed(this._className, true);
      attrToProjectors.forEach((attrToProjector, i) => {
        var animator = animators[i] || new Animator.Null();
        animator.animate(drawSelection, attrToProjector);
      });

      drawSelection.exit().remove();
    }
  }
}
}
