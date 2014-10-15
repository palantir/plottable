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

    public setup(area: D3.Selection) {
      this._renderArea = area;
    }

    /**
     * Removes the Drawer and its renderArea
     */
    public remove() {
      if (this._renderArea != null) {
        this._renderArea.remove();
      }
    }

    public _applyData(data: any[]) {
      // no-op
    }

    public _drawStep(drawStep: DrawStep) {
      // no-op
    }

    /**
     * Draws the data into the renderArea using the attrHash for attributes
     *
     * @param{any[]} data The data to be drawn
     * @param{attrHash} AttributeToProjector The list of attributes to set on the data
     */
    public draw(data: any[], drawSteps: DrawStep[]) {
      this._applyData(data);
      drawSteps.forEach((drawStep) => {
        this._drawStep(drawStep);
      });
    }
  }
}
}
