///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   *
   * Primary projection attributes:
   *   "fill" - Accessor determining the color of each sector
   *   "inner-radius" - Accessor determining the distance from the center to the inner edge of the sector
   *   "outer-radius" - Accessor determining the distance from the center to the outer edge of the sector
   *   "value" - Accessor to extract the value determining the proportion of each slice to the total
   */
  export class Pie extends AbstractPlot {

    private static DEFAULT_COLOR_SCALE = new Scale.Color();

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this.classed("pie-plot", true);
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in Pie plots");
        return;
      }
      super._addDataset(key, dataset);
    }


    public _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector = this.retargetProjectors(super._generateAttrToProjector());
      var innerRadiusF = attrToProjector["inner-radius"] || d3.functor(0);
      var outerRadiusF = attrToProjector["outer-radius"] || d3.functor(Math.min(this.width(), this.height()) / 2);
      attrToProjector["d"] = d3.svg.arc()
                      .innerRadius(innerRadiusF)
                      .outerRadius(outerRadiusF);
      delete attrToProjector["inner-radius"];
      delete attrToProjector["outer-radius"];

      if (attrToProjector["fill"] == null) {
        attrToProjector["fill"] = (d: any, i: number) => Pie.DEFAULT_COLOR_SCALE.scale(String(i));
      }

      delete attrToProjector["value"];
      return attrToProjector;
    }

    /**
     * Since the data goes through a pie function, which returns an array of ArcDescriptors,
     * projectors will need to be retargeted so they point to the data portion of each arc descriptor.
     */
    private retargetProjectors(attrToProjector: AttributeToProjector): AttributeToProjector {
      var retargetedAttrToProjector: AttributeToProjector = {};
      d3.entries(attrToProjector).forEach((entry) => {
        retargetedAttrToProjector[entry.key] = (d: D3.Layout.ArcDescriptor, i: number) => entry.value(d.data, i);
      });
      return retargetedAttrToProjector;
    }

    public _getDrawer(key: string): _Drawer.AbstractDrawer {
      return new Plottable._Drawer.Element(key).svgElement("path").classed("arc");
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var datasets = this.datasets();
      this._getDrawersInOrder().forEach((d, i) => {
        var animator = this._animate ? this._getAnimator(d, i) : new Animator.Null();
        var pieData = this.pie(datasets[i].data());
        d.draw(pieData, [attrHash], [animator]);
      });
    }

    private pie(d: any[]): D3.Layout.ArcDescriptor[] {
      var defaultAccessor = (d: any) => d.value;
      var valueProjector = this._projectors["value"];
      var valueAccessor = valueProjector ? valueProjector.accessor : defaultAccessor;
      return d3.layout.pie()
                      .sort(null)
                      .value(valueAccessor)(d);
    }

  }
}
}
