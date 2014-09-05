///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked<X> extends Abstract.NewStylePlot<X, number> {
    public yScale: Abstract.QuantitativeScale<number>;

    private stackedExtent = [0, 0];
    public _isVertical: boolean;

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      // HACKHACK Caused since onDataSource is called before projectors are set up.  Should be fixed by #803
      if (this._datasetKeysInOrder != null &&
          this._projectors["x"] != null &&
          this._projectors["y"] != null) {
        this.stack();
      }
    }

    private stack() {
      var datasets = this._getDatasetsInOrder();
      var outFunction = (d: any, y0: number, y: number) => {
        d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = y0;
      };

      d3.layout.stack()
        .x(this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor)
        .y(this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor)
        .values((d) => d.data())
        .out(outFunction)(datasets);

      this.stackedExtent = [0, 0];
<<<<<<< HEAD
      var maxY = Util.Methods.max(datasets[datasets.length - 1].data(),
                                  (datum: any) => datum.y + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      this.stackedExtent[1] = Math.max(0, maxY);

      var minY = Util.Methods.min(datasets[datasets.length - 1].data(),
                                  (datum: any) => datum.y + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      this.stackedExtent[0] = Math.min(minY, 0);
=======
      var maxY = _Util.Methods.max(datasets[datasets.length - 1].data(), (datum: any) => datum.y + datum.y0);
      if (maxY > 0) {
        this.stackedExtent[1] = maxY;
      }

      var minY = _Util.Methods.min(datasets[datasets.length - 1].data(), (datum: any) => datum.y + datum.y0);
      if (minY < 0) {
        this.stackedExtent[0] = minY;
      }
>>>>>>> develop
    }

    public _updateAllProjectors() {
      super._updateAllProjectors();
<<<<<<< HEAD
      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      if (primaryScale == null) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale.updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale.removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
=======
      if (this._yScale == null) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        this._yScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        this._yScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
>>>>>>> develop
      }
    }
  }
}
}
