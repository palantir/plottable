///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked extends Abstract.NewStylePlot {

    public _stackedData: any[] = [];
    private stackedExtent: number[] = [];

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
    }
  }
}
}
