///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class AbstractDrawer {
    public _renderArea: D3.Selection;
    public _className: string;
    public key: string;

    /**
     * Sets the class, which needs to be applied to bound elements.
     *
     * @param{string} className The class name to be applied.
     */
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

    /**
     * Enter new data to render arrea and creates binding
     *
     * @param{any[]} data The data to be drawn
     */
    public _enterData(data: any[]) {
      // no-op
    }

    /**
     * Draws data using one step
     *
     * @param{DataStep} step The step, how data should be drawn.
     */
    public _drawStep(drawStep: DrawStep) {
      // no-op
    }

    /**
     * Draws the data into the renderArea using the spefic steps
     *
     * @param{any[]} data The data to be drawn
     * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
     */
    public draw(data: any[], drawSteps: DrawStep[]) {
      this._enterData(data);
      drawSteps.forEach((drawStep) => {
        this._drawStep(drawStep);
      });
    }
  }
}
}
