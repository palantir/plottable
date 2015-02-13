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
        return Element._ifCircleIntersect(selection, xExtent, yExtent, tolerance);
      }
      return true;
    }

    private static _ifCircleIntersect(selection: D3.Selection, xExtent: Extent, yExtent: Extent, tolerance: number): boolean {
      var circleX = parseFloat(selection.attr("cx"));
      var circleY = parseFloat(selection.attr("cy"));
      var radius = parseFloat(selection.attr("r"));

      var closestX = Element.clamp(circleX, xExtent.min, xExtent.max);
      var closestY = Element.clamp(circleY, yExtent.min, yExtent.max);

      var distanceX = Math.abs(circleX - closestX);
      var distanceY = Math.abs(circleY - closestY);

      return Math.pow(distanceX, 2) + Math.pow(distanceY, 2) <= Math.pow(radius + tolerance, 2);
    }

    private static clamp(value: number, min: number, max: number) {
      if (value < min) {
        return min;
      } else if (value > max) {
        return max;
      } else {
        return value;
      }
    }

    private static pointDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.pow(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2), 0.5);
    }
  }
}
}
