///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked extends Abstract.NewStylePlot {

    public _stackedData: any[] = [];
    private stackedExtent: number[] = [];

    public _addDataset(key: string, dataset: any) {
      super._addDataset(key, dataset);
      this.stack({key: key, values: (<DataSource> dataset).data()});
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

    private stack(d: any) {
      this._stackedData.push(d);
      this._stackedData = d3.layout.stack()
        .values(function(d) { return d.values; })(this._stackedData);
    }
  }
}
}
