///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

<<<<<<< HEAD
  export class StackedBar extends Abstract.Stacked {
    public _baselineValue = 0;
    public _baseline: D3.Selection;
    public _barAlignmentFactor = 0.5;
=======
  export class StackedBar<X,Y> extends Abstract.NewStyleBarPlot<X,Y> {
    public stackedData: any[][];
    public _yAccessor: _IAccessor;
    private stackedExtent: number[];
>>>>>>> develop

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
      this.stackedData = [];
      this.stackedExtent = [];
      this._isVertical = isVertical; // Has to be set before super()
      super(xScale, yScale);
<<<<<<< HEAD
      this.classed("bar-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      this.baseline(this._baselineValue);
      this._isVertical = isVertical;
    }

    public _getDrawer(key: string) {
      return Abstract.NewStyleBarPlot.prototype._getDrawer.apply(this, [key]);
=======
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
>>>>>>> develop
    }

    public _generateAttrToProjector() {
      var attrToProjector = Abstract.NewStyleBarPlot.prototype._generateAttrToProjector.apply(this);

<<<<<<< HEAD
      var primaryAttr = this._isVertical ? "y" : "x";
      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      var getStart = (d: any) => primaryScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      var getEnd = (d: any) => primaryScale.scale(d[primaryAttr] + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
=======
      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var getStart = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_START);
      var getEnd = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_END);
>>>>>>> develop

      var heightF = (d: any) => Math.abs(getEnd(d) - getStart(d));
      var widthF = attrToProjector["width"];
      attrToProjector["height"] = this._isVertical ? heightF : widthF;
      attrToProjector["width"] = this._isVertical ? widthF : heightF;

<<<<<<< HEAD
      attrToProjector[primaryAttr] = this._isVertical ? getEnd : (d: any) => getEnd(d) - heightF(d);

      return attrToProjector;
    }

    public baseline(value: number) {
      return Abstract.NewStyleBarPlot.prototype.baseline.apply(this, [value]);
    }

    public _updateDomainer(scale: Abstract.Scale<any,number>) {
      return Abstract.NewStyleBarPlot.prototype._updateDomainer.apply(this, [scale]);
    }

    public _updateXDomainer() {
      return Abstract.NewStyleBarPlot.prototype._updateXDomainer.apply(this);
=======
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
>>>>>>> develop
    }

    public _updateYDomainer() {
      return Abstract.NewStyleBarPlot.prototype._updateYDomainer.apply(this);
    }
  }
}
}
