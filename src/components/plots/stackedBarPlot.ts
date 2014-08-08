///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar extends Abstract.NewStyleBarPlot {
    public stackedData: any[][] = [];
    public _yAccessor: IAccessor;
    public _isVertical = true;
    public _baselineValue = 0;
    public _baseline: D3.Selection;
    private stackedExtent: number[] = [];
    private keysInStackOrder: string[] = [];

    constructor(dataset: any, xScale?: Abstract.Scale, yScale?: Abstract.Scale) {
      super(dataset, xScale, yScale);
    }


    public _onDataSourceUpdate() {
      super._onDataSourceUpdate();
      // this.stackedData = this.stack(this._yAccessor);
      this._render();
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
      return this;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale    = this._isVertical ? this.yScale : this.xScale;
      var getY0 = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y0);
      var getY = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y);
      attrToProjector["height"] = (d) => Math.abs(getY(d) - getY0(d));
      attrToProjector["y"] = (d) => getY(d);
      return attrToProjector;
    }

    public _addDataset(key: string, dataset: DataSource) {
      this.keysInStackOrder.push(key);
      return super._addDataset(key, dataset);
    }

    public removeDataset(key: string) {
      this.keysInStackOrder.splice(this.keysInStackOrder.indexOf(key), 1);
      return super.removeDataset(key);
    }

    public getDrawer(key: string) {
      return new Drawer.RectDrawer(key);
    }

    public stack(accessor: IAccessor) {
      var datasets = d3.values(this._key2DatasetDrawerKey);
      var lengths = datasets.map((d) => d.dataset.data().length);
      if (Util.Methods.uniqNumbers(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to stack data when datasets are of unequal length");
      }
      var currentBase = Util.Methods.createFilledArray(0, lengths[0]);
      var datasetsInStackOrder = this.keysInStackOrder.map((k) => this._key2DatasetDrawerKey[k].dataset);
      var stacks = datasetsInStackOrder.map((dataset) => {
        var data = dataset.data();
        var base = currentBase.slice();
        var vals = data.map(accessor);
        if (vals.some((x: number) => x<0)) {
          Util.Methods.warn("Warning: Behavior for stacked bars undefined when data includes negative values");
        }
        currentBase = Util.Methods.addArrays(base, vals);

        return data.map((d: any, i: number) => {
          d["_PLOTTABLE_PROTECTED_FIELD_Y0"] = base[i];
          d["_PLOTTABLE_PROTECTED_FIELD_Y"] = currentBase[i];
          return d;
        });
      });
      this.stackedExtent = [0, d3.max(currentBase)];
      this._onDataSourceUpdate();
      return stacks;
    }

    public _paint() {
      var accessor = this._projectors["y"].accessor;
      var attrHash = this._generateAttrToProjector();
      var stackedData = this.stack(accessor);
      var drawersInStackOrder = this.keysInStackOrder.map((k) => this._key2DatasetDrawerKey[k].drawer);
      drawersInStackOrder.forEach((d, i) => d.draw(stackedData[i], attrHash));

    }
  }
}
}
