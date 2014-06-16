///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class BarPlot extends XYPlot {
    public _bars: D3.UpdateSelection;
    public _baseline: D3.Selection;
    public _baselineValue = 0;
    public _barAlignment: string;

    public _animators: Animator.IPlotAnimatorMap = {
      "bars-reset" : new Animator.Null(),
      "bars"       : new Animator.IterativeDelay(),
      "baseline"   : new Animator.Null()
    };

    /**
     * Creates an AbstractBarPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("bar-renderer", true);
      this.project("width", 10);
      this.project("fill", () => "steelblue");
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
      return this;
    }

    /**
     * Sets the baseline for the bars to the specified value.
     *
     * @param {number} value The value to position the baseline at.
     * @return {AbstractBarPlot} The calling AbstractBarPlot.
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
     * @return {AbstractBarPlot} The calling AbstractBarPlot.
     */
    public barAlignment(alignment: string) {
      // implementation in child classes
      return this;
    }

    /**
     * Selects the bar under the given pixel position (if [xMax] and
     * [yMax] are not given), under a given line (if only one of [xMax]
     * and [yMax] given) or are under a 2D area (if [xMax] and [yMax]
     * are both given).
     *
     * @param {number} xMin The pixel xMin position.
     * @param {number} yMin The pixel yMin position.
     * @param {number} xMax If given, bars between the xMin & xMax pixels will be selected.
     * @param {number} yMax If given, bars between the yMin & yMax pixels will be selected.
     * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
     * @return {D3.Selection} The selected bar, or null if no bar was selected.
     */
    public selectBar(xMin: number, yMin: number, select = true, xMax?: number, yMax?: number): D3.Selection {
      var selectedBars: any[] = [];

      if (xMax === undefined) {
        xMax = xMin;
      }
      if (yMax === undefined) {
        yMax = yMin;
      }

      // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
      this._bars.each(function(d: any) {
        var bbox = this.getBBox();
        if (bbox.x + bbox.width >= xMin && bbox.x <= xMax &&
            bbox.y + bbox.height >= yMin && bbox.y <= yMax) {
          selectedBars.push(this);
        }
      });

      if (selectedBars.length > 0) {
        var selection: D3.Selection = d3.selectAll(selectedBars);
        selection.classed("selected", select);
        return selection;
      } else {
        return null;
      }
    }

    /**
     * Deselects all bars.
     * @return {AbstractBarPlot} The calling AbstractBarPlot.
     */
    public deselectAll() {
      this._bars.classed("selected", false);
      return this;
    }
  }
}
}
