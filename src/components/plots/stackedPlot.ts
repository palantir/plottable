///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked extends Abstract.NewStylePlot {

    public _stackedData: any[] = [];
    private stackedExtent = [0, 0];

    public _addDataset(key: string, dataset: DataSource) {
      super._addDataset(key, dataset);
      this.stack({key: key, values: dataset.data()});
    }

    private stack(d: any) {
      this._stackedData.push(d);
      this._stackedData = d3.layout.stack()
        .x(this._projectors["x"].accessor)
        .y(this._projectors["y"].accessor)
        .values((d) => d.values)(this._stackedData);
      this.stackedExtent[0] = Math.min(this.stackedExtent[0], d.y);
      this.stackedExtent[1] = Math.max(this.stackedExtent[1], d.y);
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
