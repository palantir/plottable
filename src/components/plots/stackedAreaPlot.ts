///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedArea<X> extends AbstractStacked<X, number> {

    public _baseline: D3.Selection;
    public _baselineValue = 0;

    /**
     * Constructs a StackedArea plot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      this._isVertical = true;
    }

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Area(key).drawLine(false);
    }

    public _setup() {
      super._setup();
      this._baseline = this._renderArea.append("line").classed("baseline", true);
    }

    public _updateStackOffsets() {
      var domainKeys = this._getDomainKeys();
      var keyAccessor = this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;
      var keySets = this.datasets().map((dataset) => d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i).toString())).values());

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        _Util.Methods.warn("the domains across the datasets are not the same.  Plot may produce unintended behavior.");
      }
      super._updateStackOffsets();
    }

    public _additionalPaint() {
      var scaledBaseline = this._yScale.scale(this._baselineValue);
      var baselineAttr: any = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.width(),
        "y2": scaledBaseline
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);
    }

    public _updateYDomainer() {
      super._updateYDomainer();
      var scale = <Scale.AbstractQuantitative<any>> this._yScale;
      if (!scale._userSetDomainer) {
        scale.domainer().addPaddingException(0, "STACKED_AREA_PLOT+" + this._plottableID);
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale._autoDomainIfAutomaticMode();
      }
    }

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      Plot.Area.prototype._onDatasetUpdate.apply(this);
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var yAccessor = this._projections["y"].accessor;
      attrToProjector["y"] = (d: any) => this._yScale.scale(+yAccessor(d) + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      attrToProjector["y0"] = (d: any) => this._yScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);

      // Align fill with first index
      var fillProjector = attrToProjector["fill"];
      attrToProjector["fill"] = (d, i, u, m) => (d && d[0]) ? fillProjector(d[0], i, u, m) : null;

      return attrToProjector;
    }
  }
}
}
