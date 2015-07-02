///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Waterfall<X, Y> extends Bar<X, Y> {
    private static _TOTAL_KEY = "total";
    private _extent: number[];
    private _subtotals: number[];

    constructor() {
      super();
      this.addClass("waterfall-plot");
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
          return "waterfall-total";
        } else {
          var delta  = this.y().accessor(d, i, dataset);
          return delta > 0 ? "waterfall-growth" : "waterfall-decline";
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
