///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Scatter<X, Y> extends XYPlot<X, Y> {
    private static _SIZE_KEY = "size";
    private static _SYMBOL_KEY = "symbol";

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor() {
      super();
      this.classed("scatter-plot", true);
      this.animator(Plots.Animator.MAIN, new Animators.Base().duration(250).delay(5));
      this.attr("opacity", 0.6);
      this.attr("fill", new Scales.Color().range()[0]);
      this.size(6);
      var circleSymbolFactory = SymbolFactories.circle();
      this.symbol(() => circleSymbolFactory);
    }

    protected _getDrawer(dataset: Dataset) {
      return new Plottable.Drawers.Symbol(dataset);
    }

    public size<S>(): AccessorScaleBinding<S, number>;
    public size(size: number | Accessor<number>): Plots.Scatter<X, Y>;
    public size<S>(size: S | Accessor<S>, scale: Scale<S, number>): Plots.Scatter<X, Y>;
    public size<S>(size?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
      if (size == null) {
        return this._propertyBindings.get(Scatter._SIZE_KEY);
      }
      this._bindProperty(Scatter._SIZE_KEY, size, scale);
      this.render();
      return this;
    }

    public symbol(): AccessorScaleBinding<any, any>;
    public symbol(symbol: Accessor<SymbolFactory>): Plots.Scatter<X, Y>;
    public symbol(symbol?: Accessor<SymbolFactory>): any {
      if (symbol == null) {
        return this._propertyBindings.get(Scatter._SYMBOL_KEY);
      }
      this._propertyBindings.set(Scatter._SYMBOL_KEY, { accessor: symbol });
      this.render();
      return this;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        resetAttrToProjector["d"] = () => "";
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET)});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN)});
      return drawSteps;
    }

    protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: d3.Selection<void>): boolean {
      var xRange = { min: 0, max: this.width() };
      var yRange = { min: 0, max: this.height() };

      var translation = d3.transform(selection.attr("transform")).translate;
      var bbox = Utils.DOM.elementBBox(selection);
      var translatedBbox: SVGRect = {
        x: bbox.x + translation[0],
        y: bbox.y + translation[1],
        width: bbox.width,
        height: bbox.height
      };

      return Utils.DOM.intersectsBBox(xRange, yRange, translatedBbox);
    }

    protected _propertyProjectors(): AttributeToProjector {
      var propertyToProjectors = super._propertyProjectors();

      var xProjector = Plot._scaledAccessor(this.x());
      var yProjector = Plot._scaledAccessor(this.y());

      var sizeProjector = Plot._scaledAccessor(this.size());

      propertyToProjectors["transform"] = (datum: any, index: number, dataset: Dataset) =>
        "translate(" + xProjector(datum, index, dataset) + "," + yProjector(datum, index, dataset) + ")";

      var symbolProjector = Plot._scaledAccessor(this.symbol());

      propertyToProjectors["d"] = (datum: any, index: number, dataset: Dataset) =>
        symbolProjector(datum, index, dataset)(sizeProjector(datum, index, dataset));
      return propertyToProjectors;
    }
  }
}
}
