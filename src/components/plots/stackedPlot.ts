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
      var outFunction = (d: any, y0: number, y: number) => {
        d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = y0;
      };

      d3.layout.stack()
        .x(this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor)
        .y(this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor)
        .values((d) => d.data())
        .out(outFunction)(datasets);

      this.stackedExtent = [0, 0];
      var maxY = Util.Methods.max(datasets[datasets.length - 1].data(),
                                  (datum: any) => datum.y + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      if (maxY > 0) {
        this.stackedExtent[1] = maxY;
      }

      var minY = Util.Methods.min(datasets[datasets.length - 1].data(),
                                  (datum: any) => datum.y + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      if (minY < 0) {
        this.stackedExtent[0] = minY;
      }
    }

    public _updateAllProjectors() {
      super._updateAllProjectors();
      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      if (primaryScale == null) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale.updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale.removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }
  }
}
}
