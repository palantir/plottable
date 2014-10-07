///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class _Drawer {
    public _renderArea: D3.Selection;
    public key: string;

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

    /**
     * Draws the data into the renderArea using the attrHash for attributes
     *
     * @param{any[]} data The data to be drawn
     * @param{attrHash} AttributeToProjector The list of attributes to set on the data
     */
    public draw(data: any[], attrToProjector: AttributeToProjector, animator = new Animator.Null()) {
        // no-op
    }
  }
}
}
