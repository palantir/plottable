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

    public _getSelector(): string {
      return this._svgElement;
    }

    public _isSelectionInBounds(selection: D3.Selection, xExtent: Extent, yExtent: Extent, tolerance: number): boolean {
      if (this._svgElement === "circle") {
        var radius = parseFloat(selection.attr("r"));
        var circleX = parseFloat(selection.attr("cx"));
        var circleY = parseFloat(selection.attr("cy"));
        var extentPoints = [{x: xExtent.min, y: yExtent.min}, {x: xExtent.min, y: yExtent.max},
                            {x: xExtent.max, y: yExtent.min}, {x: xExtent.max, y: yExtent.max}];
        return extentPoints.some((point: Point) => {
          return Element.pointDistance(circleX, circleY, point.x, point.y) <= radius;
        });
      }
      return true;
    }

    private static pointDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.pow(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2), 0.5);
    }
  }
}
}
