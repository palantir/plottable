///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  /**
   * A step for the drawer to draw.
   *
   * Specifies how AttributeToProjector needs to be animated.
   */
  export type DrawStep = {
    attrToProjector: AttributeToProjector;
    animator: Animators.PlotAnimator;
  }

  export type AppliedDrawStep = {
    attrToProjector: AttributeToAppliedProjector;
    animator: Animators.PlotAnimator;
  }

  export class AbstractDrawer {
    private _renderArea: D3.Selection;
    protected _className: string;
    protected _dataset: Dataset;

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
     * @param {Dataset} dataset The dataset associated with this Drawer
     */
    constructor(dataset: Dataset) {
        this._dataset = dataset;
    }

    public setup(area: D3.Selection) {
      this._renderArea = area;
    }

    /**
     * Removes the Drawer and its renderArea
     */
    public remove() {
      if (this._getRenderArea() != null) {
        this._getRenderArea().remove();
      }
    }

    /**
     * Enter new data to render area and creates binding
     *
     * @param{any[]} data The data to be drawn
     */
    protected _enterData(data: any[]) {
      // no-op
    }

    /**
     * Draws data using one step
     *
     * @param{AppliedDrawStep} step The step, how data should be drawn.
     */
    protected _drawStep(step: AppliedDrawStep) {
      // no-op
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return data.length;
    }

    private _appliedProjectors(attrToProjector: AttributeToProjector): AttributeToAppliedProjector {
      var modifiedAttrToProjector: AttributeToAppliedProjector = {};
      d3.keys(attrToProjector).forEach((attr: string) => {
        modifiedAttrToProjector[attr] =
          (datum: any, index: number) => attrToProjector[attr](datum, index, this._dataset);
      });

      return modifiedAttrToProjector;
    }

    /**
     * Draws the data into the renderArea using the spefic steps and metadata
     *
     * @param{any[]} data The data to be drawn
     * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
     */
    public draw(data: any[], drawSteps: DrawStep[]) {
      var appliedDrawSteps: AppliedDrawStep[] = drawSteps.map((dr: DrawStep) => {
        var appliedAttrToProjector = this._appliedProjectors(dr.attrToProjector);
        return {
          attrToProjector: appliedAttrToProjector,
          animator: dr.animator
        };
      });

      this._enterData(data);
      var numberOfIterations = this._numberOfAnimationIterations(data);

      var delay = 0;
      appliedDrawSteps.forEach((drawStep, i) => {
        Utils.Methods.setTimeout(() => this._drawStep(drawStep), delay);
        delay += drawStep.animator.getTiming(numberOfIterations);
      });

      return delay;
    }

    /**
     * Retrieves the renderArea selection for the drawer
     *
     * @returns {D3.Selection} the renderArea selection
     */
    public _getRenderArea(): D3.Selection {
      return this._renderArea;
    }

    public _getSelector(): string {
      return "";
    }

    public _getSelection(index: number): D3.Selection {
      var allSelections = this._getRenderArea().selectAll(this._getSelector());
      return d3.select(allSelections[0][index]);
    }

  }
}
}
