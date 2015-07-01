///<reference path="../reference.ts" />

/**
 * LIST OF ITEMS TO ADDRESS
 * ========================
 * - Autoscaling the yAxis so it isn't all screwy
 * - Horizontal/vertical cases
 */

module Plottable {
export module Plots {
  export class Waterfall<X, Y> extends XYPlot<X, Y> {

    private static _TOTAL_KEY = "total";

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

    protected _createDrawer(dataset: Dataset) {
      return new Drawers.Rectangle(dataset);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var xAccessor = Plot._scaledAccessor(this.x());
      var yAccessor = Plot._scaledAccessor(this.y());
      var totalAccessor = Plot._scaledAccessor(this.total());
      var width = (<Scales.Category> <any> this.x().scale).rangeBand();

      attrToProjector["x"] = (d, i, dataset) => {
        return xAccessor(d, i, dataset) - width / 2;
      };

      attrToProjector["y"] = (d, i, dataset) => {
        var isTotal = totalAccessor(d, i, dataset);
        if (isTotal) {
          return yAccessor(d, i, dataset);
        } else {
          var currentSubtotal = this._subtotal(i, dataset);
          var priorSubtotal = this._subtotal(i - 1, dataset);
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
          var currentSubtotal = this._subtotal(i, dataset);
          var priorSubtotal = this._subtotal(i - 1, dataset);
          var height = Math.abs(this.y().scale.scale(<any> currentSubtotal) - this.y().scale.scale(<any> priorSubtotal));
          return height;
        }
        return yAccessor(d, i, dataset);
      };

      attrToProjector["width"] = (d, i, dataset) => {
        return width;
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

    private _subtotal(index: number, dataset: Dataset) {
      var data = dataset.data();
      var subtotal = 0;
      var totalAccessor = this.total().accessor;
      while (!totalAccessor(data[index], index, dataset) && index >= 0) {
        subtotal += this.y().accessor(data[index], index, dataset);
        index -= 1;
      }
      subtotal += this.y().accessor(data[index], index, dataset);
      return subtotal;
    }
  }
}
}
