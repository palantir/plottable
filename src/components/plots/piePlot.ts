///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   *
   * Primary projection attributes:
   *   "fill" - Accessor determining the color of each sector
   *   "innerradius" - Accessor determining the distance from the center to the inner edge of the sector
   *   "outerradius" - Accessor determining the distance from the center to the outer edge of the sector
   *   "value" - Accessor to extract the value determining the proportion of each slice to the total
   */
  export class Pie extends Abstract.Plot {

    private static DEFAULT_COLOR_SCALE = new Scale.Color();

    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _datasetKeysInOrder: string[];
    private nextSeriesIndex: number;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      this._key2DatasetDrawerKey = d3.map();
      this._datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
      super(new Plottable.Dataset());
      this.classed("pie-plot", true);
    }

    public _setup() {
      Abstract.NewStylePlot.prototype._setup.call(this);
    }

    /**
     * Adds a dataset to this plot. Only one dataset can be added to a PiePlot.
     *
     * A key is automatically generated if not supplied.
     *
     * @param {string} [key] The key of the dataset.
     * @param {any[]|Dataset} dataset dataset to add.
     * @returns {Pie} The calling PiePlot.
     */
    public addDataset(key: string, dataset: Dataset): Pie;
    public addDataset(key: string, dataset: any[]): Pie;
    public addDataset(dataset: Dataset): Pie;
    public addDataset(dataset: any[]): Pie;
    public addDataset(keyOrDataset: any, dataset?: any): Pie {
      return Abstract.NewStylePlot.prototype.addDataset.call(this, keyOrDataset, dataset);
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in pie plots");
        return;
      }
      Abstract.NewStylePlot.prototype._addDataset.call(this, key, dataset);
    }

    /**
     * Removes a dataset
     *
     * @param {string} key The key of the dataset
     * @returns {Pie} The calling PiePlot.
     */
    public removeDataset(key: string): Pie {
      return Abstract.NewStylePlot.prototype.removeDataset.call(this, key);
    }

    public _generateAttrToProjector(): IAttributeToProjector {
      var attrToProjector = this.retargetProjectors(super._generateAttrToProjector());
      var innerRadiusF = attrToProjector["innerradius"] || d3.functor(0);
      var outerRadiusF = attrToProjector["outerradius"] || d3.functor(Math.min(this.width(), this.height()) / 2);
      attrToProjector["d"] = d3.svg.arc()
                      .innerRadius(innerRadiusF)
                      .outerRadius(outerRadiusF);
      delete attrToProjector["innerradius"];
      delete attrToProjector["outerradius"];

      if (attrToProjector["fill"] == null) {
        attrToProjector["fill"] = (d: any, i: number) => Pie.DEFAULT_COLOR_SCALE.scale(String(i));
      }

      attrToProjector["transform"] = () => "translate(" + this.width() / 2 + "," + this.height() / 2 + ")";
      delete attrToProjector["value"];
      return attrToProjector;
    }

    /**
     * Since the data goes through a pie function, which returns an array of ArcDescriptors,
     * projectors will need to be retargeted so they point to the data portion of each arc descriptor.
     */
    private retargetProjectors(attrToProjector: IAttributeToProjector): IAttributeToProjector {
      var retargetedAttrToProjector: IAttributeToProjector = {};
      d3.entries(attrToProjector).forEach((entry) => {
        retargetedAttrToProjector[entry.key] = (d: D3.Layout.ArcDescriptor, i: number) => entry.value(d.data, i);
      });
      return retargetedAttrToProjector;
    }

    public _getAnimator(drawer: Abstract._Drawer, index: number): Animator.IPlotAnimator {
      return Abstract.NewStylePlot.prototype._getAnimator.call(this, drawer, index);
    }

    public _getDrawer(key: string): Abstract._Drawer {
      return new Plottable._Drawer.Arc(key);
    }

    public _getDatasetsInOrder(): Dataset[] {
      return Abstract.NewStylePlot.prototype._getDatasetsInOrder.call(this);
    }

    public _getDrawersInOrder(): Abstract._Drawer[] {
      return Abstract.NewStylePlot.prototype._getDrawersInOrder.call(this);
    }

    public _updateProjector(attr: string) {
      Abstract.NewStylePlot.prototype._updateProjector.call(this, attr);
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var datasets = this._getDatasetsInOrder();
      this._getDrawersInOrder().forEach((d, i) => {
        var animator = this._animate ? this._getAnimator(d, i) : new Animator.Null();
        var pieData = this.pie(datasets[i].data());
        d.draw(pieData, attrHash, animator);
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
