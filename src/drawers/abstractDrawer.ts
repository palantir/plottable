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
        _Util.Methods.setTimeout(() => this._drawStep(drawStep), delay);
        delay += drawStep.animator.getTiming(numberOfIterations);
      });

      return delay;
    }

    private applyMetadata(attrToProjector: AttributeToProjector, userMetadata: any, plotMetadata: any) {
      var modifiedAttrToProjector: AttributeToProjector = {};
      d3.keys(attrToProjector).forEach((attr: string) => {
        modifiedAttrToProjector[attr] =
          (datum: any, index: number) => attrToProjector[attr](datum, index, userMetadata, plotMetadata);
      });
      return modifiedAttrToProjector;
    }

    public newDraw(data: any[], drawSteps: DrawStep[], userMetadata: any = {}, plotMetadata: any = {}) {
      var modifiedDrawSteps = drawSteps.map((dr: DrawStep) => {
        return {
          attrToProjector: this.applyMetadata(dr.attrToProjector, userMetadata, plotMetadata),
          animator: dr.animator
        };
      });
      return this.draw(data, modifiedDrawSteps);
    }


  }
}
}
