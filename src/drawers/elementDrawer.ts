///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Element extends AbstractDrawer {
    protected _svgElement: string;

    /**
     * Sets the svg element, which needs to be bind to data
     *
     * @param{string} tag The svg element to be bind
     */
    public svgElement(tag: string): Element {
      this._svgElement = tag;
      return this;
    }

    private _getDrawSelection() {
      return this._getRenderArea().selectAll(this._svgElement);
    }

    protected _drawStep(step: AppliedDrawStep) {
      super._drawStep(step);
      var drawSelection = this._getDrawSelection();
      if (step.attrToProjector["fill"]) {
        drawSelection.attr("fill", step.attrToProjector["fill"]); // so colors don't animate
      }
      step.animator.animate(drawSelection, step.attrToProjector);
    }

    protected _enterData(data: any[]) {
      super._enterData(data);
      var dataElements = this._getDrawSelection().data(data);
      dataElements.enter().append(this._svgElement);
      if (this._className != null) {
        dataElements.classed(this._className, true);
      }
      dataElements.exit().remove();
    }

    private _filterDefinedData(data: any[], definedFunction: (d: any, i: number) => boolean): any[] {
      return definedFunction ? data.filter(definedFunction) : data;
    }

    // HACKHACK To prevent populating undesired attribute to d3, we delete them here.
    protected _prepareDrawSteps(drawSteps: AppliedDrawStep[]) {
      super._prepareDrawSteps(drawSteps);
      drawSteps.forEach((d: DrawStep) => {
        if (d.attrToProjector["defined"]) {
          delete d.attrToProjector["defined"];
        }
      });
    }

    protected _prepareData(data: any[], drawSteps: AppliedDrawStep[]) {
      return drawSteps.reduce((data: any[], drawStep: AppliedDrawStep) =>
              this._filterDefinedData(data, drawStep.attrToProjector["defined"]), super._prepareData(data, drawSteps));
    }
  }
}
}
