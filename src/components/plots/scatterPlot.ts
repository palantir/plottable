///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Scatter<X, Y> extends XYPlot<X, Y> {
    private _closeDetectionRadius = 5;
    private _defaultFillColor: string;

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>) {
      super(xScale, yScale);
      this.classed("scatter-plot", true);
      this._defaultFillColor = new Scales.Color().range()[0];

      this.animator("symbols-reset", new Animators.Null());
      this.animator("symbols", new Animators.Base()
                                           .duration(250)
                                           .delay(5));
    }

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Symbol(key);
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();
      attrToProjector["size"] = attrToProjector["size"] || d3.functor(6);
      attrToProjector["opacity"] = attrToProjector["opacity"] || d3.functor(0.6);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);
      attrToProjector["symbol"] = attrToProjector["symbol"] || (() => SymbolFactories.circle());

      return attrToProjector;
    }

    protected generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this.generateAttrToProjector();
        resetAttrToProjector["size"] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this.getAnimator("symbols-reset")});
      }

      drawSteps.push({attrToProjector: this.generateAttrToProjector(), animator: this.getAnimator("symbols")});
      return drawSteps;
    }

    protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      var xRange = { min: 0, max: this.width() };
      var yRange = { min: 0, max: this.height() };

      var translation = d3.transform(selection.attr("transform")).translate;
      var bbox = selection[0][0].getBBox();
      var translatedBbox: SVGRect = {
        x: bbox.x + translation[0],
        y: bbox.y + translation[1],
        width: bbox.width,
        height: bbox.height
      };

      return Plottable.Utils.Methods.intersectsBBox(xRange, yRange, translatedBbox);
    }
  }
}
}
