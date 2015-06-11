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
    animator: Animator;
  };

  export type AppliedDrawStep = {
    attrToAppliedProjector: AttributeToAppliedProjector;
    animator: Animator;
  };

}

  export class Drawer {
    private _renderArea: d3.Selection<void>;
    protected _svgElementName: string;
    protected _className: string;
    private _dataset: Dataset;

    /**
     * Constructs a Drawer
     *
     * @constructor
     * @param {Dataset} dataset The dataset associated with this Drawer
     */
    constructor(dataset: Dataset) {
      this._dataset = dataset;
      this._svgElementName = "g";
    }

    /**
     * Retrieves the renderArea selection for the Drawer.
     */
    public renderArea(): d3.Selection<void>;
    /**
     * Sets the renderArea selection for the Drawer.
     *
     * @param {d3.Selection} Selection containing the <g> to render to.
     * @returns {Drawer} The calling Drawer.
     */
    public renderArea(area: d3.Selection<void>): Drawer;
    public renderArea(area?: d3.Selection<void>): any {
      if (area == null) {
        return this._renderArea;
      }
      this._renderArea = area;
      return this;
    }

    /**
     * Removes the Drawer and its renderArea
     */
    public remove() {
      if (this.renderArea() != null) {
        this.renderArea().remove();
      }
    }

    /**
     * Enter new data to render area and creates binding
     *
     * @param{any[]} data The data to be drawn
     */
    private _setSelectionData(data: any[]) {
      var dataElements = this._selection().data(data);
      dataElements.enter().append(this._svgElementName);
      dataElements.exit().remove();
      this._setDefaultAttributes(dataElements);
    }

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      if (this._className != null) {
        selection.classed(this._className, true);
      }
    }

    /**
     * Draws data using one step
     *
     * @param{AppliedDrawStep} step The step, how data should be drawn.
     */
    private _drawStep(step: Drawers.AppliedDrawStep) {
      var selection = this._selection();
      var colorAttributes = ["fill", "stroke"];
      colorAttributes.forEach((colorAttribute) => {
        if (step.attrToAppliedProjector[colorAttribute] != null) {
          selection.attr(colorAttribute, step.attrToAppliedProjector[colorAttribute]);
        }
      });
      step.animator.animate(selection, step.attrToAppliedProjector);
      this._selection().classed(this._className, true);
    }

    private _appliedProjectors(attrToProjector: AttributeToProjector): AttributeToAppliedProjector {
      var modifiedAttrToProjector: AttributeToAppliedProjector = {};
      Object.keys(attrToProjector).forEach((attr: string) => {
        modifiedAttrToProjector[attr] =
          (datum: any, index: number) => attrToProjector[attr](datum, index, this._dataset);
      });

      return modifiedAttrToProjector;
    }

    public totalDrawTime(data: any[], drawSteps: Drawers.DrawStep[]) {
      var delay = 0;
      drawSteps.forEach((drawStep, i) => {
        delay += drawStep.animator.totalTime(data.length);
      });

      return delay;
    }

    /**
     * Draws the data into the renderArea using the spefic steps and metadata
     *
     * @param{any[]} data The data to be drawn
     * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
     */
    public draw(data: any[], drawSteps: Drawers.DrawStep[]) {
      var appliedDrawSteps: Drawers.AppliedDrawStep[] = drawSteps.map((dr: Drawers.DrawStep) => {
        var attrToAppliedProjector = this._appliedProjectors(dr.attrToProjector);
        return {
          attrToAppliedProjector: attrToAppliedProjector,
          animator: dr.animator
        };
      });

      this._setSelectionData(data);

      var delay = 0;
      appliedDrawSteps.forEach((drawStep, i) => {
        Utils.Window.setTimeout(() => this._drawStep(drawStep), delay);
        delay += drawStep.animator.totalTime(data.length);
      });

      return this;
    }

    private _selection() {
      return this.renderArea().selectAll(this.selector());
    }

    /**
     * Returns the CSS selector for this Drawer's visual elements.
     */
    public selector(): string {
      return this._svgElementName;
    }

    /**
     * Returns the D3 selection corresponding to the datum with the specified index.
     */
    public selectionForIndex(index: number) {
      var allSelections = this.renderArea().selectAll(this.selector());
      return d3.select(allSelections[0][index]);
    }

  }
}
