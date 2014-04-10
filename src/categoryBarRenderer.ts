///<reference path="reference.ts" />

module Plottable {
  export class CategoryBarRenderer extends CategoryXYRenderer {
    private _widthAccessor: any;

    /**
     * Creates a CategoryBarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
     * @param {IAccessor} [widthAccessor] A function for extracting the width position of each bar, in pixels, from the data.
     * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
     */
    constructor(dataset: any,
            xScale: OrdinalScale,
            yScale: QuantitiveScale,
            xAccessor?: IAccessor,
            widthAccessor?: IAccessor,
            yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("bar-renderer", true);
      this._animate = true;
      this._widthAccessor = (widthAccessor != null) ? widthAccessor : 10; // default width is 10px
    }

    /**
     * Sets the width accessor.
     *
     * @param {any} accessor The new width accessor.
     * @returns {CategoryBarRenderer} The calling CategoryBarRenderer.
     */
    public widthAccessor(accessor: any) {
      this._widthAccessor = accessor;
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
      return this;
    }

    public _paint() {
      super._paint();
      var yRange = this.yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);
      var xA = this._getAppliedAccessor(this._xAccessor);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._data, xA);
      this.dataSelection.enter().append("rect");

      var rangeType = this.xScale.rangeType();

      var widthFunction: (d:any, i: number) => number;
      if (rangeType === "points"){
        widthFunction = this._getAppliedAccessor(this._widthAccessor);
      } else {
        widthFunction = (d:any, i: number) => this.xScale.rangeBand();
      }

      var xFunction = (d: any, i: number) => {
        var x = xA(d, i);
        var scaledX = this.xScale.scale(x);
        if (rangeType === "points") {
          return scaledX - widthFunction(d, i)/2;
        } else {
          return scaledX;
        }
      };

      var yA = this._getAppliedAccessor(this._yAccessor);
      var yFunction = (d: any, i: number) => {
        var y = yA(d, i);
        var scaledY = this.yScale.scale(y);
        return scaledY;
      };

      var heightFunction = (d: any, i: number) => {
        return maxScaledY - yFunction(d, i);
      };

      var updateSelection: any = this.dataSelection;

      var classAccessor = this._getAppliedAccessor(this._classAccessor);
      updateSelection.each(function(d: any, i: number): any { // no double arrow because we need the element from "this"
        var classes: any = classAccessor(d,i);
        if (classes instanceof String) {
          d3.select(this).classed(classes, true);
        } else if (classes instanceof Object) {
          d3.select(this).classed(classes);
        }
      });

      if (this._animate) {
        updateSelection = updateSelection.transition();
      }

      updateSelection
            .attr("x", xFunction)
            .attr("y", yFunction)
            .attr("width", widthFunction)
            .attr("height", heightFunction)
            .attr("fill", this._getAppliedAccessor(this._colorAccessor));

      this.dataSelection.exit().remove();
    }

    public autorange() {
      super.autorange();
      var yDomain = this.yScale.domain();
      if (yDomain[1] < 0 || yDomain[0] > 0) { // domain does not include 0
        var newDomain = [Math.min(0, yDomain[0]), Math.max(0, yDomain[1])];
        this.yScale.domain(newDomain);
      }
      return this;
    }

    /**
     * Selects the bar under the given pixel position.
     *
     * @param {number} x The pixel x position.
     * @param {number} y The pixel y position.
     * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
     * @return {D3.Selection} The selected bar, or null if no bar was selected.
     */
    public selectBar(x: number, y: number, select = true): D3.Selection {
      var selectedBar: D3.Selection = null;

      this.dataSelection.each(function(d: any) {
        var bbox = this.getBBox();
        if (bbox.x <= x && x <= bbox.x + bbox.width &&
            bbox.y <= y && y <= bbox.y + bbox.height) {
          selectedBar = d3.select(this);
        }
      });

      if (selectedBar != null) {
        selectedBar.classed("selected", select);
      }

      return selectedBar;
    }

    /**
     * Deselects all bars.
     */
    public deselectAll() {
      this.dataSelection.classed("selected", false);
    }
  }
}
