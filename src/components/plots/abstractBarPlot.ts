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


    private parseExtent(input: any): IExtent {
      if (typeof(input) === "number") {
        return {min: input, max: input};
      } else if (input instanceof Object && "min" in input && "max" in input) {
        return <IExtent> input;
      } else {
        throw new Error("input '" + input + "' can't be parsed as an IExtent");
      }
    }

    /**
     * Selects the bar under the given pixel position (if [xValOrExtent]
     * and [yValOrExtent] are {number}s), under a given line (if only one
     * of [xValOrExtent] or [yValOrExtent] are {IExtent}s) or are under a
     * 2D area (if [xValOrExtent] and [yValOrExtent] are both {IExtent}s).
     *
     * @param {any} xValOrExtent The pixel x position, or range of x values.
     * @param {any} yValOrExtent The pixel y position, or range of y values.
     * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
     * @return {D3.Selection} The selected bar, or null if no bar was selected.
     */
    public selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
    public selectBar(xValOrExtent: any, yValOrExtent: any, select = true): D3.Selection {
      var selectedBars: any[] = [];

      var xExtent: IExtent = this.parseExtent(xValOrExtent);
      var yExtent: IExtent = this.parseExtent(yValOrExtent);

      // the SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via 
      // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
      // seems appropriate:
      var tolerance: number = 0.5;

      // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
      this._bars.each(function(d: any) {
        var bbox = this.getBBox();
        if (bbox.x + bbox.width >= xExtent.min - tolerance && bbox.x <= xExtent.max + tolerance &&
            bbox.y + bbox.height >= yExtent.min - tolerance && bbox.y <= yExtent.max + tolerance) {
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
