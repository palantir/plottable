///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Waterfall<X, Y> extends Bar<X, Y> {
    private static _BAR_DECLINE_CLASS = "waterfall-decline";
    private static _BAR_GROWTH_CLASS = "waterfall-growth";
    private static _BAR_TOTAL_CLASS = "waterfall-total";
    private static _CONNECTOR_CLASS = "connector";
    private static _TOTAL_KEY = "total";
    private _connectorArea: d3.Selection<void>;
    private _connectorsEnabled = false;
    private _extent: number[];
    private _subtotals: number[];

    constructor() {
      super();
      this.addClass("waterfall-plot");
    }

    /**
     * Gets whether connectors are enabled.
     * 
     * @returns {boolean} Whether connectors should be shown or not.
     */
    public connectorsEnabled(): boolean;
    /**
     * Sets whether connectors are enabled.
     * 
     * @param {boolean} enabled
     * @returns {Waterfall} The calling Waterfall Plot.
     */
    public connectorsEnabled(enabled: boolean): Waterfall<X, Y>;
    public connectorsEnabled(enabled?: boolean): any {
      if (enabled === undefined) {
        return this._connectorsEnabled;
      }
      this._connectorsEnabled = enabled;
      return this;
    }

    public total(): Plots.AccessorScaleBinding<any, boolean>;
    public total(total: boolean | Accessor<boolean>): Waterfall<X, Y>;
    public total<T>(total: boolean | Accessor<T>, scale: Scale<T, boolean>): Waterfall<X, Y>;
    public total<T>(total?: boolean | Accessor<boolean> | T | Accessor<T>, scale?: Scale<T, boolean>): any {
      if (total === undefined) {
        return this._propertyBindings.get(Waterfall._TOTAL_KEY);
      }
      this._bindProperty(Waterfall._TOTAL_KEY, total, scale);
      return this;
    }

    protected _additionalPaint(time: number) {
      this._connectorArea.selectAll("line").remove();
      if (this._connectorsEnabled) {
        Utils.Window.setTimeout(() => this._drawConnectors(), time);
      }
    }

    protected _createNodesForDataset(dataset: Dataset) {
      var drawer = super._createNodesForDataset(dataset);
      this._connectorArea = this._renderArea.append("g").classed("connector-area", true);
      return drawer;
    }

    protected _extentsForProperty(attr: string) {
      var primaryAttr = "y";
      if (attr === primaryAttr) {
        return [this._extent];
      } else {
        return super._extentsForProperty(attr);
      }
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var yAccessor = Plot._scaledAccessor(this.y());
      var totalAccessor = Plot._scaledAccessor(this.total());

      attrToProjector["y"] = (d, i, dataset) => {
        var isTotal = totalAccessor(d, i, dataset);
        if (isTotal) {
          return yAccessor(d, i, dataset);
        } else {
          var currentSubtotal = this._subtotals[i];
          var priorSubtotal = this._subtotals[i - 1];
          if (currentSubtotal > priorSubtotal) {
            return this.y().scale.scale(<any> currentSubtotal);
          } else {
            return this.y().scale.scale(<any> priorSubtotal);
          }
        }
      };

      attrToProjector["height"] = (d, i, dataset) => {
        var isTotal = totalAccessor(d, i, dataset);
        var currentValue = this.y().accessor(d, i, dataset);
        if (isTotal) {
          return Math.abs(this.y().scale.scale(<any> currentValue) - this.y().scale.scale(<any> 0));
        } else {
          var currentSubtotal = this._subtotals[i];
          var priorSubtotal = this._subtotals[i - 1];
          var height = Math.abs(this.y().scale.scale(<any> currentSubtotal) - this.y().scale.scale(<any> priorSubtotal));
          return height;
        }
        return yAccessor(d, i, dataset);
      };

      attrToProjector["class"] = (d, i, dataset) => {
        var isTotal = totalAccessor(d, i, dataset);
        if (isTotal) {
          return Waterfall._BAR_TOTAL_CLASS;
        } else {
          var delta  = this.y().accessor(d, i, dataset);
          return delta > 0 ? Waterfall._BAR_GROWTH_CLASS : Waterfall._BAR_DECLINE_CLASS;
        }
      };

      return attrToProjector;
    }

    protected _onDatasetUpdate() {
      this._updateSubtotals();
      super._onDatasetUpdate();
      return this;
    }

    private _calculateSubtotalsAndExtent(dataset: Dataset) {
      var min = Number.MAX_VALUE;
      var max = Number.MIN_VALUE;
      var total = 0;
      dataset.data().forEach((datum, index) => {
        var currentValue = this.y().accessor(datum, index, dataset);
        var isTotal = this.total().accessor(datum, index, dataset);
        if (!isTotal || index === 0) {
          total += currentValue;
        }
        this._subtotals.push(total);
        if (total < min) {
          min = total;
        }
        if (total > max) {
          max = total;
        }
      });
      this._extent = [min, max];
    }

    private _drawConnectors() {
      var attrToProjector = this._generateAttrToProjector();
      var dataset = this.datasets()[0];
      for (var datumIndex = 1; datumIndex < dataset.data().length; datumIndex++) {
        var prevIndex = datumIndex - 1;
        var datum = dataset.data()[datumIndex];
        var prevDatum = dataset.data()[prevIndex];
        var x = attrToProjector["x"](prevDatum, prevIndex, dataset);
        var x2 = attrToProjector["x"](datum, datumIndex, dataset) + attrToProjector["width"](datum, datumIndex, dataset);
        var y = this._subtotals[datumIndex] <= this._subtotals[prevIndex] ?
          attrToProjector["y"](datum, datumIndex, dataset) :
          attrToProjector["y"](datum, datumIndex, dataset) + attrToProjector["height"](datum, datumIndex, dataset);
        this._connectorArea.append("line").classed(Waterfall._CONNECTOR_CLASS, true)
          .attr("x1", x).attr("x2", x2).attr("y1", y).attr("y2", y);
      }
    }

    private _updateSubtotals() {
      var datasets = this.datasets();
      if (datasets.length > 0) {
        var dataset = datasets[datasets.length - 1];
        this._subtotals = new Array();
        this._calculateSubtotalsAndExtent(dataset);
      }
    }
  }
}
}
