///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked extends Abstract.NewStylePlot {

    private stackedExtent = [0, 0];

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
      d3.layout.stack()
        .x(this._projectors["x"].accessor)
        .y(this._projectors["y"].accessor)
        .values((d) => d.data())(datasets);

      this.stackedExtent = [0, 0];
      var maxY = _Util.Methods.max(datasets[datasets.length - 1].data(), (datum: any) => datum.y + datum.y0);
      if (maxY > 0) {
        this.stackedExtent[1] = maxY;
      }

      var minY = _Util.Methods.min(datasets[datasets.length - 1].data(), (datum: any) => datum.y + datum.y0);
      if (minY < 0) {
        this.stackedExtent[0] = minY;
      }
    }

    public _updateAllProjectors() {
      super._updateAllProjectors();
      if (this._yScale == null) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        this._yScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        this._yScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }
  }
}
}
