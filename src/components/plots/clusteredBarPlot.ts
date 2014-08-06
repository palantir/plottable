///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class ClusteredBar extends Abstract.BarPlot {
    public static DEFAULT_WIDTH = 10;
    private nextSeriesIndex = 0;
    public barMap = d3.map();
    public datasetMap = d3.map();
    public _baselineValue = 0;
    public clusterOrder: string[];
    public renderArea: D3.Selection;
    public _isVertical: boolean;
    private innerScale: Scale.Ordinal;
    public colorScale: Scale.Color;

    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitativeScale) {
      super(dataset, xScale, yScale);
      this.clusterOrder = [];
      this.innerScale = new Scale.Ordinal();
      this._isVertical = true;
    }


    public addDataset(key: string, dataset: DataSource): ClusteredBar;
    public addDataset(key: string, dataset: any[]): ClusteredBar;
    public addDataset(dataset: DataSource): ClusteredBar;
    public addDataset(dataset: any[]): ClusteredBar;
    public addDataset(first: any, second?: any): ClusteredBar {
      if (typeof(first) !== "string" && second !== undefined) {
        throw new Error("addDataSet takes string keys");
      }
      if (typeof(first) === "string" && first[0] === "_") {
        Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }     
      var key  = typeof(first) === "string" ? first : "_" + this.nextSeriesIndex++;
      var data = typeof(first) !== "string" ? first : second;
      var dataset = (data instanceof DataSource) ? data : new DataSource(data);

      this.datasetMap.set(key, dataset);
      this.clusterOrder.push(key);
      this._onDataSourceUpdate();
      return this;
    }

    public _onDataSourceUpdate() {
      this._updateAllProjectors();
      super._onDataSourceUpdate();
    }
 
    public removeDataset(key: string): ClusteredBar {
      this.datasetMap.remove(key);
      var barGroup = this.barMap.get(key);
      barGroup.remove();
      this.barMap.remove(key);
      if (this.clusterOrder.indexOf(key) >= 0) {
        this.clusterOrder.splice(this.clusterOrder.indexOf(key), 1);
      }
      this._onDataSourceUpdate();
      return this;
    }

    public cluster(): string[];
    public cluster(cluster: string[]): ClusteredBar;
    public cluster(cluster?: string[]): any {
      if (cluster == null) {
        return this.clusterOrder;
      }
      this.clusterOrder = cluster;
      this._onDataSourceUpdate();
      return this;
    }
    // basically the same as in plot.ts, but I just iterate through the datasets
    private _updateAllProjectors(): ClusteredBar {
      d3.keys(this._projectors).forEach((attr: string) => this._updateProjector(attr));
      return this;
    }

    private _updateProjector(attr: string): ClusteredBar {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        this.datasetMap.values().forEach((datasource: DataSource, i: number) => {
          var extent = datasource._getExtent(projector.accessor);
          // I don't want to overwrite my previous extents, so I'm making a unique number somehow
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale.removeExtent(this._plottableID * 100 + i, attr);
          } else {
            projector.scale.updateExtent(this._plottableID * 100 + i, attr, extent);
          }
        });
      }
      return this;
    }

    public _paint() {
      super._paint();
      this.clusterOrder.forEach((e) =>  {
        var barGroup: D3.Selection;
        if (this.barMap.has(e)) {
          barGroup = this.barMap.get(e);
        } else {
          barGroup = this.renderArea.append("g");
        }
        var bars = barGroup.selectAll("rect").data(this.datasetMap.get(e).data(), (d) => d.year);
        bars.enter().append("rect");
        var primaryScale = this._isVertical ? this.yScale : this.xScale;
        var scaledBaseline = primaryScale.scale(this._baselineValue);
        var positionAttr = this._isVertical ? "y" : "x";
        var secondaryAttr = this._isVertical ? "x" : "y";
        var dimensionAttr = this._isVertical ? "height" : "width";


        if (this._dataChanged && this._animate && !this.barMap.has(e)) {
          var resetAttrToProjector = this.__generateAttrToProjector(e);
          resetAttrToProjector[positionAttr] = () => scaledBaseline;
          resetAttrToProjector[dimensionAttr] = () => 0;
          this._applyAnimatedAttributes(bars, "bars-reset", resetAttrToProjector);
        }

        var attrToProjector = this.__generateAttrToProjector(e);
        if (attrToProjector["fill"] != null) {
          this._bars.attr("fill", attrToProjector["fill"]); // so colors don't animate
        }
        this._applyAnimatedAttributes(bars, "bars", attrToProjector);
        bars.exit().remove();
        this.barMap.set(e, barGroup);
      });
    }

    public __generateAttrToProjector(seriesKey: string) {
      var attrToProjector = super._generateAttrToProjector();
      this.innerScale.domain(this.clusterOrder);
      this.colorScale.domain(this.clusterOrder);
      // the width is constant, so set the inner scale range to that
      var widthF = attrToProjector["width"];
      this.innerScale.range([0, widthF(null, 1)]);
      attrToProjector["width"] = (d: any, i: number) => (widthF(d, i) / this.clusterOrder.length * .7);
      var positionF = attrToProjector["x"];
      attrToProjector["x"] = (d: any, i: number) => (positionF(d, i) + this.innerScale.scale(seriesKey));
      attrToProjector["fill"] = (d: any, i: number) => (this.colorScale.scale(seriesKey));
      return attrToProjector;
    }

    // manually set colorscale for now, this should be easy to fix once the accessor changes come through
    public setColor(scale: Scale.Color) {
      this.colorScale = scale;
    }
  }
}
}
