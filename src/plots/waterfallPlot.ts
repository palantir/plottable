///<reference path="../reference.ts" />
/* tslint:disable: no-var-keyword */

module Plottable {
export module Plots {
  export class Waterfall<X, Y> extends Bar<X, number> {
    private static _BAR_DECLINE_CLASS = "waterfall-decline";
    private static _BAR_GROWTH_CLASS = "waterfall-growth";
    private static _BAR_TOTAL_CLASS = "waterfall-total";
    private static _CONNECTOR_CLASS = "connector";
    private static _CONNECTOR_AREA_CLASS = "connector-area";
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
     * @returns {Plots.Waterfall} The calling Waterfall Plot.
     */
    public connectorsEnabled(enabled: boolean): Waterfall<X, Y>;
    public connectorsEnabled(enabled?: boolean): any {
      if (enabled == null) {
        return this._connectorsEnabled;
      }
      this._connectorsEnabled = enabled;
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for whether a bar represents a total or a delta.
     */
    public total<T>(): Plots.AccessorScaleBinding<T, boolean>;
    /**
     * Sets total to a constant number or the result of an Accessor
     * 
     * @param {Accessor<boolean>}
     * @returns {Plots.Waterfall} The calling Waterfall Plot.
     */
    public total(total: Accessor<boolean>): Waterfall<X, Y>;
    public total(total?: Accessor<boolean>): any {
      if (total == null) {
        return this._propertyBindings.get(Waterfall._TOTAL_KEY);
      }
      this._bindProperty(Waterfall._TOTAL_KEY, total, null);
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
      this._connectorArea = this._renderArea.append("g").classed(Waterfall._CONNECTOR_AREA_CLASS, true);
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

      var yScale = this.y().scale;
      var totalAccessor = Plot._scaledAccessor(this.total());

      var yAttr = this.attr("y");
      if (yAttr == null) {
        attrToProjector["y"] = (d, i, dataset) => {
          var currentValue = this.y().accessor(d, i, dataset);
          var isTotal = totalAccessor(d, i, dataset);
          if (isTotal) {
            return Math.min(yScale.scale(currentValue), yScale.scale(0));
          } else {
            var currentSubtotal = this._subtotals[i];
            if (i === 0) {
              if (currentValue < 0) {
                return yScale.scale(currentSubtotal - currentValue);
              } else {
                return yScale.scale(currentSubtotal);
              }
            }
            var priorSubtotal = this._subtotals[i - 1];
            if (currentSubtotal > priorSubtotal) {
              return yScale.scale(currentSubtotal);
            } else {
              return yScale.scale(priorSubtotal);
            }
          }
        };
      }

      var heightAttr = this.attr("height");
      if (heightAttr == null) {
        attrToProjector["height"] = (d, i, dataset) => {
          var isTotal = totalAccessor(d, i, dataset);
          var currentValue = this.y().accessor(d, i, dataset);
          if (isTotal) {
            return Math.abs(yScale.scale(currentValue) - yScale.scale(0));
          } else {
            var currentSubtotal = this._subtotals[i];
            if (i === 0) {
              return Math.abs(yScale.scale(currentSubtotal) - yScale.scale(currentSubtotal - currentValue));
            } else {
              var priorSubtotal = this._subtotals[i - 1];
              return Math.abs(yScale.scale(currentSubtotal) - yScale.scale(priorSubtotal));
            }
          }
        };
      }

      attrToProjector["class"] = (d, i, dataset) => {
        var baseClass = "";
        if (this.attr("class") != null) {
          baseClass = this.attr("class").accessor(d, i, dataset) + " ";
        }
        var isTotal = totalAccessor(d, i, dataset);
        if (isTotal) {
          return baseClass + Waterfall._BAR_TOTAL_CLASS;
        } else {
          var delta  = this.y().accessor(d, i, dataset);
          return baseClass + (delta > 0 ? Waterfall._BAR_GROWTH_CLASS : Waterfall._BAR_DECLINE_CLASS);
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
      var startValue = -Infinity;
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
        if (isTotal) {
          if (currentValue < min) {
            min = currentValue;
          }
          if (currentValue > max) {
            max = currentValue;
          }
        }
        if (startValue === -Infinity && isTotal) {
          var startTotal = currentValue - total;
          for (var i = 0; i < this._subtotals.length; i++) {
            this._subtotals[i] += startTotal;
          }
          startValue = this._subtotals[i];
          total += startTotal;
          min += startTotal;
          max += startTotal;
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
        var y = attrToProjector["y"](datum, datumIndex, dataset);
        if ((this._subtotals[datumIndex] > 0 && this._subtotals[datumIndex] > this._subtotals[prevIndex]) ||
            (this._subtotals[datumIndex] < 0 && this._subtotals[datumIndex] >= this._subtotals[prevIndex])) {
          y = attrToProjector["y"](datum, datumIndex, dataset) + attrToProjector["height"](datum, datumIndex, dataset);
        }
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
