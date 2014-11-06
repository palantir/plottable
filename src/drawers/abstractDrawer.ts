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

    private applyMetadata(attrToProjector: AttributeToProjector, userMetadata: any, plotMetadata: any) {
      var modifiedAttrToProjector: AttributeToProjector = {};
      d3.keys(attrToProjector).forEach((attr: string) => {
        modifiedAttrToProjector[attr] =
          (datum: any, index: number) => attrToProjector[attr](datum, index, userMetadata, plotMetadata);
      });
      return modifiedAttrToProjector;
    }

    public _prepareDrawSteps(drawSteps: DrawStep[]) {
      // no-op
    }

    public _prepareData(data: any[], drawSteps: DrawStep[]) {
      return data;
    }

    /**
     * Draws the data into the renderArea using the spefic steps and metadata
     *
     * @param{any[]} data The data to be drawn
     * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
     * @param{any} userMetadata The metadata provided by user
     * @param{any} plotMetadata The metadata provided by plot
     */
    public draw(data: any[], drawSteps: DrawStep[], userMetadata: any = {}, plotMetadata: any = {}) {
      var appliedDrawSteps = drawSteps.map((dr: DrawStep) => {
        return {
          attrToProjector: this.applyMetadata(dr.attrToProjector, userMetadata, plotMetadata),
          animator: dr.animator
        };
      });

      var preparedData = this._prepareData(data, appliedDrawSteps);

      this._prepareDrawSteps(appliedDrawSteps);

      this._enterData(preparedData);
      var numberOfIterations = this._numberOfAnimationIterations(preparedData);

      var delay = 0;
      appliedDrawSteps.forEach((drawStep, i) => {
        _Util.Methods.setTimeout(() => this._drawStep(drawStep), delay);
        delay += drawStep.animator.getTiming(numberOfIterations);
      });

      return delay;
    }


  }
}
}
