///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedBar<X, Y> extends Bar<X, Y> {
    private _stackOffsets: Utils.Map<Dataset, D3.Map<number>>;
    private _stackedExtent: number[];

    /**
     * Constructs a StackedBar plot.
     * A StackedBarPlot is a plot that plots several bar plots stacking on top of each
     * other.
     * @constructor
     * @param {Scale} xScale the x scale of the plot.
     * @param {Scale} yScale the y scale of the plot.
     * @param {string} orientation The orientation of the Bar Plot ("vertical"/"horizontal").
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, orientation = Bar.ORIENTATION_VERTICAL) {
      super(xScale, yScale, orientation);
      this._stackOffsets = new Utils.Map<Dataset, D3.Map<number>>();
      this._stackedExtent = [];
    }

    protected _getAnimator(key: string): Animators.PlotAnimator {
      if (this._animate && this._animateOnNextRender) {
        if (this.animator(key)) {
          return this.animator(key);
        } else if (key === "stacked-bar") {
          var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
          var scaledBaseline = primaryScale.scale(this.baseline());
          return new Animators.MovingRect(scaledBaseline, this._isVertical);
        }
      }

      return new Animators.Null();
    }

    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }
      if (xScale == null) {
        super.x(<number | Accessor<number>> x);
      } else {
        super.x(<X | Accessor<X>> x, xScale);
      }

      this._updateStackExtentsAndOffsets();
      return this;
    }

    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }
      if (yScale == null) {
        super.y(<number | Accessor<number>> y);
      } else {
        super.y(<Y | Accessor<Y>> y, yScale);
      }

      this._updateStackExtentsAndOffsets();
      return this;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var valueAttr = this._isVertical ? "y" : "x";
      var keyAttr = this._isVertical ? "x" : "y";
      var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      var primaryAccessor = this._propertyBindings.get(valueAttr).accessor;
      var keyAccessor = this._propertyBindings.get(keyAttr).accessor;
      var getStart = (d: any, i: number, dataset: Dataset) =>
        primaryScale.scale(this._stackOffsets.get(dataset).get(keyAccessor(d, i, dataset)));
      var getEnd = (d: any, i: number, dataset: Dataset) =>
        primaryScale.scale(+primaryAccessor(d, i, dataset) + this._stackOffsets.get(dataset).get(keyAccessor(d, i, dataset)));

      var heightF = (d: any, i: number, dataset: Dataset) => {
        return Math.abs(getEnd(d, i, dataset) - getStart(d, i, dataset));
      };

      var attrFunction = (d: any, i: number, dataset: Dataset) =>
        +primaryAccessor(d, i, dataset) < 0 ? getStart(d, i, dataset) : getEnd(d, i, dataset);
      attrToProjector[valueAttr] = (d: any, i: number, dataset: Dataset) =>
        this._isVertical ? attrFunction(d, i, dataset) : attrFunction(d, i, dataset) - heightF(d, i, dataset);

      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("stacked-bar")}];
    }

    protected _onDatasetUpdate() {
      this._updateStackExtentsAndOffsets();
      super._onDatasetUpdate();
      return this;
    }

    protected _updateExtentsForProperty(property: string) {
      super._updateExtentsForProperty(property);
      if ((property === "x" || property === "y") && this._projectorsReady()) {
        this._updateStackExtentsAndOffsets();
      }
    }

    protected _extentsForProperty(attr: string) {
      var primaryAttr = this._isVertical ? "y" : "x";
      if (attr === primaryAttr) {
        return [this._stackedExtent];
      } else {
        return super._extentsForProperty(attr);
      }
    }

    private _updateStackExtentsAndOffsets() {
      if (!this._projectorsReady()) {
        return;
      }

      var datasets = this.datasets();
      var keyAccessor = this._isVertical ? this.x().accessor : this.y().accessor;
      var valueAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
      var filter = this._filterForProperty(this._isVertical ? "y" : "x");

      this._stackOffsets = Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
      this._stackedExtent = Utils.Stacked.computeStackExtent(datasets, keyAccessor, valueAccessor, this._stackOffsets, filter);
    }
  }
}
}
