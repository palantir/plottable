///<reference path="../../reference.ts" />

module Plottable {
  export class AbstractBarRenderer extends XYRenderer {
    public _baseline: D3.Selection;
    public _baselineValue = 0;
    public _barAlignment: string;

    /**
     * Creates an AbstractBarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("bar-renderer", true);
      this.project("width", 10);
    }

    /**
     * Sets the baseline for the bars to the specified value.
     *
     * @param {number} value The value to position the baseline at.
     * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
     */
    public baseline(value: number) {
      this._baselineValue = value;
      if (this.element != null) {
        this._render();
      }
      return this;
    }

    /**
     * Sets the bar alignment relative to the independent axis.
     * Behavior depends on subclass implementation.
     *
     * @param {string} alignment The desired alignment.
     * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
     */
    public barAlignment(alignment: string) {
      // implementation in child classes
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

      // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
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
     * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
     */
    public deselectAll() {
      this.dataSelection.classed("selected", false);
      return this;
    }
  }
}
