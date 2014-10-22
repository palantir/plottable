///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Element extends AbstractDrawer {
    public _svgElement: string;

    /**
     * Sets the svg element, which needs to be bind to data
     *
     * @param{string} tag The svg element to be bind
     */
    public svgElement(tag: string): Element {
      this._svgElement = tag;
      return this;
    }

    public _getDrawSelection() {
      return this._renderArea.selectAll(this._svgElement);
    }

    public _drawStep(step: DrawStep) {
      super._drawStep(step);
      var drawSelection = this._getDrawSelection();
      if (step.attrToProjector["fill"]) {
        drawSelection.attr("fill", step.attrToProjector["fill"]); // so colors don't animate
      }
      step.animator.animate(drawSelection, step.attrToProjector);
    }

    public _enterData(data: any[]) {
      super._enterData(data);
      var dataElements = this._getDrawSelection().data(data);
      dataElements.enter().append(this._svgElement);
      if (this._className != null) {
        dataElements.classed(this._className, true);
      }
      dataElements.exit().remove();
    }
  }
}
}
