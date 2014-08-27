///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked extends Abstract.NewStylePlot {

    private stackedExtent = [0, 0];

    public _addDataset(key: string, dataset: DataSource) {
      super._addDataset(key, dataset);
      this.stack();
    }

    public removeDataset(key: string) {
      super.removeDataset(key);
      this.stack();
      return this;
    }

    private stack() {
      var datasets = this._getDatasetsInOrder();
      d3.layout.stack()
        .x(this._projectors["x"].accessor)
        .y(this._projectors["y"].accessor)
        .values((d) => d.data())(datasets);

      var maxY = d3.max(datasets[datasets.length - 1].data(), (datum: any) => datum.y + datum.y0);
      if (maxY > 0) {
        this.stackedExtent[1] = maxY;
      }
    }

    public _updateAllProjectors() {
      super._updateAllProjectors();
      if (this.yScale == null) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        this.yScale.updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        this.yScale.removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }
  }
}
}
