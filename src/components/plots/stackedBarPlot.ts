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

    public _updateYDomainer() {
      this._updateDomainer(this.yScale);
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


    public getDrawer(key: string) {
      return new Drawer.RectDrawer(key);
    }

    public stack(accessor: IAccessor) {
      var lengths = this.datasets.map((d) => d.dataset.data().length);
      if (Util.Methods.uniqNumbers(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to stack data when datasets are of unequal length");
      }
      var currentBase = Util.Methods.createFilledArray(0, lengths[0]);
      var stacks =  this.datasets.map((dnk) => {
        var data = dnk.dataset.data();
        var base = currentBase.slice();
        var vals = data.map(accessor);
        if (vals.some((x) => x<0)) {
          Util.Methods.warn("Warning: Behavior for stacked bars undefined when data includes negative values");
        }
        currentBase = Util.Methods.addArrays(base, vals);

        return data.map((d, i) => {
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
      this.drawers.forEach((d, i) => d.draw(stackedData[i], attrHash));

    }
  }
}
}
