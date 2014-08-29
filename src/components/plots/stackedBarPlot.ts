///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar extends Abstract.NewStyleBarPlot {
    public stackedData: any[][] = [];
    public _yAccessor: IAccessor;
    public _baselineValue = 0;
    public _baseline: D3.Selection;
    private stackedExtent: number[] = [];

    /**
     * Constructs a StackedBar plot.
     *
     * @constructor
     * @param {Scale} xScale the x scale of the plot
     * @param {Scale} yScale the y scale of the plot
     * @param {boolean} isVertical if the plot if vertical
     */
    constructor(xScale?: Abstract.Scale<any,number>, yScale?: Abstract.Scale<any,number>, isVertical = true) {
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
      if (this.yScale == null) {
        return;
      }
      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale.updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale.removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var primaryScale = this._isVertical ? this.yScale : this.xScale;
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
          d["_PLOTTABLE_PROTECTED_FIELD_START"] = base[i];
          d["_PLOTTABLE_PROTECTED_FIELD_END"] = currentBase[i];
          return d;
        });
      });
      this.stackedExtent = [0, Util.Methods.max(currentBase)];
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
