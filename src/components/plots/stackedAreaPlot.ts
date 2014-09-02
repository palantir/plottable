///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedArea extends Abstract.Stacked {

    public _baseline: D3.Selection;
    public _baselineValue = 0;

    /**
     * Constructs a StackedArea plot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Abstract.QuantitativeScale<any>, yScale: Abstract.QuantitativeScale<any>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      this._isVertical = true;
    }

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Area(key);
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
    }

    public _paint() {
      var scaledBaseline = this.yScale.scale(this._baselineValue);
      var baselineAttr: any = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.width(),
        "y2": scaledBaseline
      };
      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);

      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      attrToProjector["d"] = d3.svg.area()
                                    .x(xFunction)
                                    .y0(y0Function)
                                    .y1(yFunction);

      // Align fill with first index
      var fillProjector = attrToProjector["fill"];
      attrToProjector["fill"] = (d, i) => fillProjector(d[0], i);

      this._draw(attrToProjector);
    }

    public _updateYDomainer() {
      super._updateYDomainer();
      var scale = <Abstract.QuantitativeScale<any>> this.yScale;
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
      attrToProjector["y"] = (d: any) => this.yScale.scale(d.y + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      attrToProjector["y0"] = (d: any) => this.yScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      return attrToProjector;
    }
  }
}
}
