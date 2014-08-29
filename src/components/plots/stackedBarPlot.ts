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


    public _addDataset(key: string, dataset: any) {
      super._addDataset(key, dataset);
      this.stackedData = this.stack(this._projectors["y"].accessor);
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

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale    = this._isVertical ? this.yScale : this.xScale;
      var getY0 = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y0);
      var getY = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y);
      attrToProjector["height"] = (d) => Math.abs(getY(d) - getY0(d));
      attrToProjector["y"] = (d) => getY(d);
      return attrToProjector;
    }

    private stack(accessor: IAccessor) {
      var datasets = d3.values(this._key2DatasetDrawerKey);
      var lengths = datasets.map((d) => d.dataset.data().length);
      if (Util.Methods.uniq(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to stack data when datasets are of unequal length");
      }
      var currentBase = Util.Methods.createFilledArray(0, lengths[0]);
      var stacks = this._getDatasetsInOrder().map((dataset) => {
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
      this.stackedExtent = [0, Util.Methods.max(currentBase)];
      this._onDataSourceUpdate();
      return stacks;
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      this._getDrawersInOrder().forEach((d: Abstract._Drawer, i: number) => {
        var animator: Animator.Rect;
        if (this._animate) {
          animator = new Animator.Rect();
          animator.delay(animator.duration() * i);
        }
        d.draw(this.stackedData[i], attrHash, animator);
      });
    }
  }
}
}
