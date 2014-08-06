///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar extends Abstract.NewStylePlot {
    public stackedData: any[][] = [];
    public _yAccessor: IAccessor;
    public _isVertical = true;
    public _baselineValue = 0;
    public _baseline: D3.Selection;

    constructor(dataset: any, xScale?: Abstract.Scale, yScale?: Abstract.Scale) {
      super(dataset, xScale, yScale);
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
      return this;
    }

    public _onDataSourceUpdate() {
      // super._onDataSourceUpdate();
      // this.stackedData = this.stack(this._yAccessor);
      this._render();
    }


    public _generateAttrToProjector() {
      // Primary scale/direction: the "length" of the bars
      // Secondary scale/direction: the "width" of the bars
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale    = this._isVertical ? this.yScale : this.xScale;
      var secondaryScale  = this._isVertical ? this.xScale : this.yScale;
      var primaryAttr     = this._isVertical ? "y" : "x";
      var secondaryAttr   = this._isVertical ? "x" : "y";
      var bandsMode = (secondaryScale instanceof Plottable.Scale.Ordinal)
                      && (<Plottable.Scale.Ordinal> secondaryScale).rangeType() === "bands";

      if (secondaryScale == null || primaryScale == null) {
        console.log("warning: scales null, continuing");
        return (<any> {});
      }

      if (attrToProjector["width"] == null) {
        var constantWidth = bandsMode ? (<Scale.Ordinal> secondaryScale).rangeBand() : 5;
        attrToProjector["width"] = (d: any, i: number) => constantWidth;
      }

      var positionF = attrToProjector[secondaryAttr];
      var widthF = attrToProjector["width"];
      if (!bandsMode) {
        throw new Error("only supported for bands mode atm");
        // attrToProjector[secondaryAttr] = (d: any, i: number) => positionF(d, i) - widthF(d, i) * this._barAlignmentFactor;
      } else {
        var bandWidth = (<Plottable.Scale.Ordinal> secondaryScale).rangeBand();
        attrToProjector[secondaryAttr] = (d: any, i: number) => positionF(d, i) - widthF(d, i) / 2 + bandWidth / 2;
      }

      var getY0 = (d: any) => this.yScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y0);
      var getY = (d: any) => this.yScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y);
      attrToProjector["height"] = (d) => Math.abs(getY(d) - getY0(d));
      attrToProjector["y"] = (d) => getY(d);
      return attrToProjector;
    }


    public getDrawer(key: string) {
      return new Drawer.RectDrawer(key);
    }

    public stack(accessor: IAccessor) {
      var lengths = this.datasets.map((d) => d.dataset.data().length);
      if (Util.Methods.uniqNumbers(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to stack data when datasets are of unequal length");
      }
      var currentBase = Util.Methods.createFilledArray(0, lengths[0]);
      var stacks =  this.datasets.map((dnk) => {
        var data = dnk.dataset.data();
        var base = currentBase.slice();
        var vals = data.map(accessor);
        if (vals.some((x) => x<0)) {
          Util.Methods.warn("Warning: Behavior for stacked bars undefined when data includes negative values");
        }
        currentBase = Util.Methods.addArrays(base, vals);

        return data.map((d, i) => {
          d["_PLOTTABLE_PROTECTED_FIELD_Y0"] = base[i];
          d["_PLOTTABLE_PROTECTED_FIELD_Y"] = currentBase[i];
          return d;
          });
      });

      this.project("y", "_PLOTTABLE_PROTECTED_FIELD_Y", this.yScale)
      return stacks;
    }

    public _updateYDomainer() {
      this._updateDomainer(this.yScale);
      return this;
    }

    public _updateDomainer(scale: Abstract.Scale) {
      if (scale instanceof Abstract.QuantitativeScale) {
        var qscale = <Abstract.QuantitativeScale> scale;
        if (!qscale._userSetDomainer) {
          if (this._baselineValue != null) {
            qscale.domainer()
              .addPaddingException(this._baselineValue, "BAR_PLOT+" + this._plottableID)
              .addIncludedValue(this._baselineValue, "BAR_PLOT+" + this._plottableID);
          } else {
            qscale.domainer()
              .removePaddingException("BAR_PLOT+" + this._plottableID)
              .removeIncludedValue("BAR_PLOT+" + this._plottableID);
          }
        }
            // prepending "BAR_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        qscale._autoDomainIfAutomaticMode();
      }
      return this;
    }


    // /**
    //  * Gets the Plot's DataSource.
    //  *
    //  * @return {DataSource} The current DataSource.
    //  */
    // public dataSource(): DataSource;
    // /**
    //  * Sets the Plot's DataSource.
    //  *
    //  * @param {DataSource} source The DataSource the Plot should use.
    //  * @return {Plot} The calling Plot.
    //  */
    // public dataSource(source: DataSource): Plot;
    // public dataSource(source?: DataSource): any {
    //   if (source == null) {
    //     return this._dataSource;
    //   }
    //   var oldSource = this._dataSource;
    //   if (oldSource != null) {
    //     this._dataSource.broadcaster.deregisterListener(this);
    //   }
    //   this._dataSource = source;
    //   this._dataSource.broadcaster.registerListener(this, () => this._onDataSourceUpdate());
    //   this._onDataSourceUpdate();
    //   return this;
    // }


    public _paint() {
      var scaledBaseline = this.yScale.scale(this._baselineValue);

      var baselineAttr: Abstract.IAttributeToProjector = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.availableWidth : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.availableHeight
      };
      this._baseline.attr(baselineAttr);

      var accessor = this._projectors["y"].accessor;
      var attrHash = this._generateAttrToProjector();
      var stackedData = this.stack(accessor);
      this.drawers.forEach((d, i) => d.draw(stackedData[i], attrHash));

    }
  }
}
}
