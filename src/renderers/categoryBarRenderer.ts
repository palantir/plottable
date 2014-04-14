///<reference path="../reference.ts" />

module Plottable {
  export class CategoryBarRenderer extends CategoryXYRenderer {
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
      this.project("width", 10);
    }

    public _paint() {
      super._paint();
      var yRange = this.yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);
      var xA = this._getAppliedAccessor(this._xAccessor);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data(), xA);
      this.dataSelection.enter().append("rect");

      var attrToProjector = this._generateAttrToProjector();

      var xF = attrToProjector["x"];
      attrToProjector["x"] = (d: any, i: number) => xF(d, i) - attrToProjector["width"](d, i) / 2;

      var heightFunction = (d: any, i: number) => {
        return maxScaledY - attrToProjector["y"](d, i);
      };
      attrToProjector["height"] = heightFunction;

      var updateSelection: any = this.dataSelection;
      if (this._animate) {
        updateSelection = updateSelection.transition();
      }
      updateSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
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
