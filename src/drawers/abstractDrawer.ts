///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  /**
   * A step for the drawer to draw.
   *
   * Specifies how AttributeToProjector needs to be animated.
   */
  export type DrawStep = {
    attrToProjector: AttributeToProjector;
    animator: Animator.PlotAnimator;
  }

  export type AppliedDrawStep = {
    attrToProjector: _AttributeToAppliedProjector;
    animator: Animator.PlotAnimator;
  }

  export class AbstractDrawer {
    private _renderArea: D3.Selection;
    protected _className: string;
    public key: string;
    protected _attrToProjector: _AttributeToAppliedProjector;

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

    private _applyMetadata(attrToProjector: AttributeToProjector,
                          userMetadata: any,
                          plotMetadata: Plot.PlotMetadata): _AttributeToAppliedProjector {
      var modifiedAttrToProjector: _AttributeToAppliedProjector = {};
      d3.keys(attrToProjector).forEach((attr: string) => {
        modifiedAttrToProjector[attr] =
          (datum: any, index: number) => attrToProjector[attr](datum, index, userMetadata, plotMetadata);
      });

      return modifiedAttrToProjector;
    }

    protected _prepareDrawSteps(drawSteps: AppliedDrawStep[]) {
      // no-op
    }

    protected _prepareData(data: any[], drawSteps: AppliedDrawStep[]) {
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
    public draw(data: any[], drawSteps: DrawStep[], userMetadata: any, plotMetadata: Plot.PlotMetadata) {
      var appliedDrawSteps: AppliedDrawStep[] = drawSteps.map((dr: DrawStep) => {
        var appliedAttrToProjector = this._applyMetadata(dr.attrToProjector, userMetadata, plotMetadata);
        this._attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(appliedAttrToProjector);
        return {
          attrToProjector: appliedAttrToProjector,
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

    public _getPixelPoint(datum: any, index: number): Point {
      return null;
    }

    public _getSelection(datum: any, index: number): D3.Selection {
      var selection = d3.select();
      var allSelections = this._getRenderArea().selectAll(this._getSelector());
      allSelections.each(function (selectionDatum: any, selectionIndex: number) {
        if (selectionDatum === datum && selectionIndex === index) {
          selection = d3.select(this);
        }
      });
      return selection;
    }

  }
}
}
