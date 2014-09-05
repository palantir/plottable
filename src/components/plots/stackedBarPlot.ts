///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar<X,Y> extends Abstract.NewStyleBarPlot<X,Y> {
    public stackedData: any[][] = [];
    public _yAccessor: _IAccessor;
    public _baselineValue = 0;
    public _baseline: D3.Selection;
    private stackedExtent: number[] = [];

    /**
     * Constructs a StackedBar plot.
     * A StackedBarPlot is a plot that plots several bar plots stacking on top of each
     * other.
     * @constructor
     * @param {Scale} xScale the x scale of the plot.
     * @param {Scale} yScale the y scale of the plot.
     * @param {boolean} isVertical if the plot if vertical.
     */
    constructor(xScale?: Abstract.Scale<X,number>, yScale?: Abstract.Scale<Y,number>, isVertical = true) {
      super(xScale, yScale);
      this._isVertical = isVertical;
    }

    public _addDataset(key: string, dataset: any) {
      super._addDataset(key, dataset);
      var accessor = this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor;
      this.stackedData = this.stack(accessor);
    }

    public _updateAllProjectors() {
      super._updateAllProjectors();
      if (this._yScale == null) {
        return;
      }
      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var getStart = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_START);
      var getEnd = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_END);

      var heightF = (d: any) => Math.abs(getEnd(d) - getStart(d));
      var widthF = attrToProjector["width"];
      attrToProjector["height"] = this._isVertical ? heightF : widthF;
      attrToProjector["width"] = this._isVertical ? widthF : heightF;

      var primaryAttr = this._isVertical ? "y" : "x";
      attrToProjector[primaryAttr] = this._isVertical ? getEnd : (d, i) => getEnd(d) - heightF(d);
      return attrToProjector;
    }

    private stack(accessor: _IAccessor) {
      var datasets = d3.values(this._key2DatasetDrawerKey);
      var lengths = datasets.map((d) => d.dataset.data().length);
      if (_Util.Methods.uniq(lengths).length > 1) {
        _Util.Methods.warn("Warning: Attempting to stack data when datasets are of unequal length");
      }
      var currentBase = _Util.Methods.createFilledArray(0, lengths[0]);
      var stacks = this._getDatasetsInOrder().map((dataset) => {
        var data = dataset.data();
        var base = currentBase.slice();
        var vals = data.map(accessor);
        if (vals.some((x: number) => x<0)) {
          _Util.Methods.warn("Warning: Behavior for stacked bars undefined when data includes negative values");
        }
        currentBase = _Util.Methods.addArrays(base, vals);

        return data.map((d: any, i: number) => {
          d["_PLOTTABLE_PROTECTED_FIELD_START"] = base[i];
          d["_PLOTTABLE_PROTECTED_FIELD_END"] = currentBase[i];
          return d;
        });
      });
      this.stackedExtent = [0, _Util.Methods.max(currentBase)];
      this._onDatasetUpdate();
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
