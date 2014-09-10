///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   */
  export class Pie extends Abstract.Plot {

    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _datasetKeysInOrder: string[];
    private nextSeriesIndex: number;
    private _sectorLabelsEnabled: boolean;

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
      this._sectorLabelsEnabled = true;
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
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["d"] = this.arc();
      attrToProjector["transform"] = () => "translate(" + this.width() / 2 + "," + this.height() / 2 + ")";
      attrToProjector["fill"] = () => "steelblue";
      return attrToProjector;
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

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var datasets = this._getDatasetsInOrder();
      this._getDrawersInOrder().forEach((d, i) => {
        var animator = this._animate ? this._getAnimator(d, i) : new Animator.Null();
        var pieData = this.pie(datasets[i].data());
        d.draw(pieData, attrHash, animator);

        if (this.sectorLabelsEnabled()) {
          this.drawSectorLabels(pieData);
        }
      });
    }

    private pie(d: any[]): D3.Layout.ArcDescriptor[] {
      return d3.layout.pie()
                      .sort(null)
                      .value((d) => d.value)(d);
    }

    private arc(): D3.Svg.Arc {
      return d3.svg.arc()
                   .outerRadius(Math.min(this.width(), this.height()) / 2)
                   .innerRadius(0);
    }

    private drawSectorLabels(arcData: D3.Layout.ArcDescriptor[]) {
      var labels = this._renderArea.selectAll("text").data(arcData);
      labels.enter().append("text");
      labels.exit().remove();

      labels.attr("transform", (d: any) => {
                                 var centroid = this.arc().centroid(d);
                                 var translatedCentroid = [centroid[0] + this.width() / 2, centroid[1] + this.height() / 2];
                                 return "translate(" + translatedCentroid+ ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .classed("pie-label", true)
            .text((d: any) => (((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100) + "%");
    }

    /**
     * Checks if sector labels are enabled on the pie plot
     *
     * @returns {boolean} If sector labels are enabled
     */
    public sectorLabelsEnabled(): boolean;
    /**
     * Sets if sector labels are enabled on the pie plot, then re-renders if changed
     *
     * @returns {Pie} The calling PiePlot
     */
    public sectorLabelsEnabled(isEnabled: boolean): Pie;
    public sectorLabelsEnabled(isEnabled?: boolean): any {
      if (isEnabled == null) {
        return this._sectorLabelsEnabled;
      }
      var oldSectorLabelsEnabled = this._sectorLabelsEnabled;
      this._sectorLabelsEnabled = isEnabled;
      if (oldSectorLabelsEnabled !== isEnabled) {
        if (isEnabled) {
          this._paint();
        } else {
          this._renderArea.selectAll(".pie-label").remove();
        }
      }
      return this;
    }

  }
}
}
