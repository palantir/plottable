///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedArea<X> extends Area<X> {
    private _stackOffsets: Utils.Map<Dataset, Utils.Map<string, Utils.Stacked.StackedDatum>>;
    private _stackedExtent: number[];

    private _baseline: d3.Selection<void>;
    private _baselineValue = 0;
    private _baselineValueProvider: () => number[];

    /**
     * @constructor
     * @param {QuantitativeScale} xScale
     * @param {QuantitativeScale} yScale
     */
    constructor() {
      super();
      this.addClass("stacked-area-plot");
      this.attr("fill-opacity", 1);
      this._stackOffsets = new Utils.Map<Dataset, Utils.Map<string, Utils.Stacked.StackedDatum>>();
      this._stackedExtent = [];
      this._baselineValueProvider = () => [this._baselineValue];
    }

    protected _getAnimator(key: string): Animator {
      return new Animators.Null();
    }

    protected _setup() {
      super._setup();
      this._baseline = this._renderArea.append("line").classed("baseline", true);
    }

    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | Accessor<number>): StackedArea<X>;
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): StackedArea<X>;
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

    public y(): Plots.AccessorScaleBinding<number, number>;
    public y(y: number | Accessor<number>): StackedArea<X>;
    public y(y: number | Accessor<number>, yScale: QuantitativeScale<number>): StackedArea<X>;
    public y(y?: number | Accessor<number>, yScale?: QuantitativeScale<number>): any {
      if (y == null) {
        return super.y();
      }
      if (yScale == null) {
        super.y(<number | Accessor<number>> y);
      } else {
        super.y(<number | Accessor<number>> y, yScale);
      }

      this._updateStackExtentsAndOffsets();

      return this;
    }

    protected _additionalPaint() {
      var scaledBaseline = this.y().scale.scale(this._baselineValue);
      var baselineAttr: any = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.width(),
        "y2": scaledBaseline
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);
    }

    protected _updateYScale() {
      var yBinding = this.y();
      var scale = <QuantitativeScale<any>> (yBinding && yBinding.scale);
      if (scale == null) {
        return;
      }
      scale.addPaddingExceptionsProvider(this._baselineValueProvider);
      scale.addIncludedValuesProvider(this._baselineValueProvider);
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
      var primaryAttr = "y";
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
      var keyAccessor = this.x().accessor;
      var valueAccessor = this.y().accessor;
      var filter = this._filterForProperty("y");

      this._checkSameDomain(datasets, keyAccessor);
      this._stackOffsets = Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
      this._stackedExtent = Utils.Stacked.computeStackExtent(this._stackOffsets, keyAccessor, filter);
    }

    private _checkSameDomain(datasets: Dataset[], keyAccessor: Accessor<any>) {
      var keySets = datasets.map((dataset) => {
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset).toString())).values();
      });
      var domainKeys = Utils.Stacked.domainKeys(datasets, keyAccessor);

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        Utils.Window.warn("the domains across the datasets are not the same. Plot may produce unintended behavior.");
      }
    }

    protected _propertyProjectors(): AttributeToProjector {
      var propertyToProjectors = super._propertyProjectors();
      var yAccessor = this.y().accessor;
      var xAccessor = this.x().accessor;
      var normalizedXAccessor = (datum: any, index: number, dataset: Dataset) => {
        return Utils.Stacked.normalizeKey(xAccessor(datum, index, dataset));
      };
      var stackYProjector = (d: any, i: number, dataset: Dataset) =>
        this.y().scale.scale(+yAccessor(d, i, dataset) + this._stackOffsets.get(dataset).get(normalizedXAccessor(d, i, dataset)).offset);
      var stackY0Projector = (d: any, i: number, dataset: Dataset) =>
        this.y().scale.scale(this._stackOffsets.get(dataset).get(normalizedXAccessor(d, i, dataset)).offset);

      propertyToProjectors["d"] = this._constructAreaProjector(Plot._scaledAccessor(this.x()), stackYProjector, stackY0Projector);
      return propertyToProjectors;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
      var pixelPoint = super._pixelPoint(datum, index, dataset);
      var xValue = this.x().accessor(datum, index, dataset);
      var yValue = this.y().accessor(datum, index, dataset);
      var scaledYValue = this.y().scale.scale(+yValue + this._stackOffsets.get(dataset).get(Utils.Stacked.normalizeKey(xValue)).offset);
      return { x: pixelPoint.x, y: scaledYValue };
    }

  }
}
}
