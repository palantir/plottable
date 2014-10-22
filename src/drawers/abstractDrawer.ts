///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  /**
   * A step for the drawer to draw.
   *
   * Specifies how AttributeToProjector needs to be animated.
   */
  export interface DrawStep {
    attrToProjector: AttributeToProjector;
    animator: Animator.PlotAnimator;
  }

  export class AbstractDrawer {
    public _renderArea: D3.Selection;
    public _className: string;
    public key: string;

    /**
     * Sets the class, which needs to be applied to bound elements.
     *
     * @param{string} className The class name to be applied.
     */
    public setClass(className: string): AbstractDrawer {
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
     * Enter new data to render area and creates binding
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
    public _drawStep(step: DrawStep) {
      // no-op
    }

    public _numberOfAnimationIterations(data: any[]): number {
      return data.length;
    }

    /**
     * Draws the data into the renderArea using the spefic steps
     *
     * @param{any[]} data The data to be drawn
     * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
     */
    public draw(data: any[], drawSteps: DrawStep[]): number {
      this._enterData(data);
      var numberOfIterations = this._numberOfAnimationIterations(data);

      var delay = 0;
      drawSteps.forEach((drawStep, i) => {
        if (delay > 0) {
          setTimeout(() => this._drawStep(drawStep));
        } else {
          this._drawStep(drawStep);
        }
        var time = drawStep.animator.getTiming(numberOfIterations);
        delay += time;
      });

      return delay;
    }
  }
}
}
