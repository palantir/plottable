///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area<X> extends Line<X> {
    public static PLOT_CLASS = "area";
    private static _Y0_KEY = "y0";
    private _lineDrawers: Utils.Map<Dataset, Drawers.Line>;

    /**
     * Constructs an AreaPlot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.y0(0, yScale); // default

      this.animator("reset", new Animators.Null());
      this.animator("main", new Animators.Base()
                                        .duration(600)
                                        .easing("exp-in-out"));
      var defaultColor = new Scales.Color().range()[0];
      this.attr("fill-opacity", 0.25);
      this.attr("fill", defaultColor);
      this.attr("class", Area.PLOT_CLASS);

      this._lineDrawers = new Utils.Map<Dataset, Drawers.Line>();
    }

    protected _setup() {
      super._setup();
      this._lineDrawers.values().forEach((d) => d.setup(this._renderArea.append("g")));
    }

    public y0(): Plots.AccessorScaleBinding<number, number>;
    public y0(y0: number | Accessor<number>): Area<X>;
    public y0(y0: number | Accessor<number>, y0Scale: Scale<number, number>): Area<X>;
    public y0(y0?: number | Accessor<number>, y0Scale?: Scale<number, number>): any {
      if (y0 == null) {
        return this._propertyBindings.get(Area._Y0_KEY);
      }
      this._bindProperty(Area._Y0_KEY, y0, y0Scale);
      this._updateYScale();
      this.render();
      return this;
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      if (this.y().scale != null) {
        this._updateYScale();
      }
    }

    public addDataset(dataset: Dataset) {
      var lineDrawer = new Drawers.Line(dataset);
      if (this._isSetup) {
        lineDrawer.setup(this._renderArea.append("g"));
      }
      this._lineDrawers.set(dataset, lineDrawer);
      super.addDataset(dataset);
      return this;
    }

    protected _additionalPaint() {
      var drawSteps = this._generateLineDrawSteps();
      var dataToDraw = this._getDataToDraw();
      this._datasetKeysInOrder.forEach((k, i) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        this._lineDrawers.get(dataset).draw(dataToDraw.get(k), drawSteps);
      });
    }

    private _generateLineDrawSteps() {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var attrToProjector = this._generateLineAttrToProjector();
        var xProjector = Plot._scaledAccessor(this.x());
        var yProjector = Plot._scaledAccessor(this.y());

        var definedProjector = (d: any, i: number, dataset: Dataset) => {
          var positionX = xProjector(d, i, dataset);
          var positionY = yProjector(d, i, dataset);
          return positionX != null && positionX === positionX &&
                 positionY != null && positionY === positionY;
        };

        attrToProjector["d"] = (datum: any, index: number, dataset: Dataset) => {
          return d3.svg.line()
                       .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
                       .y((innerDatum, innerIndex) => this._getResetYFunction()(innerDatum, innerIndex, dataset))
                       .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum, index);
        };
        drawSteps.push({attrToProjector: attrToProjector, animator: this._getAnimator("reset")});
      }
      drawSteps.push({attrToProjector: this._generateLineAttrToProjector(), animator: this._getAnimator("main")});
      return drawSteps;
    }

    private _generateLineAttrToProjector() {
      var lineAttrToProjector = this._generateAttrToProjector();
      var fillProjector = lineAttrToProjector["fill"];
      lineAttrToProjector["stroke"] = fillProjector;
      lineAttrToProjector["stroke-width"] = () => "2px";
      var xProjector = Plot._scaledAccessor(this.x());
      var yProjector = Plot._scaledAccessor(this.y());

      var definedProjector = (d: any, i: number, dataset: Dataset) => {
        var positionX = xProjector(d, i, dataset);
        var positionY = yProjector(d, i, dataset);
        return positionX != null && positionX === positionX &&
               positionY != null && positionY === positionY;
      };

      lineAttrToProjector["d"] = (datum: any, index: number, dataset: Dataset) => {
        return d3.svg.line()
                     .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
                     .y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
                     .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum, index);
      };
      return lineAttrToProjector;
    }

    protected _getDrawer(dataset: Dataset) {
      return new Plottable.Drawers.Area(dataset);
    }

    protected _updateYScale() {
      var extents = this._propertyExtents.get("y0");
      var extent = Utils.Methods.flatten<number>(extents);
      var uniqExtentVals = Utils.Methods.uniq<number>(extent);
      var constantBaseline = uniqExtentVals.length === 1 ? uniqExtentVals[0] : null;

      var yScale = <QuantitativeScale<number>> this.y().scale;
      if (constantBaseline != null) {
        yScale.addPaddingException(this, constantBaseline);
      } else {
        yScale.removePaddingException(this);
      }
    }

    protected _getResetYFunction() {
      return Plot._scaledAccessor(this.y0());
    }

    protected _propertyProjectors(): AttributeToProjector {
      var propertyToProjectors = super._propertyProjectors();
      var xProjector = Plot._scaledAccessor(this.x());
      var yProjector = Plot._scaledAccessor(this.y());
      var y0Projector = Plot._scaledAccessor(this.y0());

      var definedProjector = (d: any, i: number, dataset: Dataset) => {
        var positionX = xProjector(d, i, dataset);
        var positionY = yProjector(d, i, dataset);
        return positionX != null && positionX === positionX &&
               positionY != null && positionY === positionY;
      };

      propertyToProjectors["d"] = (datum: any, index: number, dataset: Dataset) => {
        return d3.svg.area()
                     .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
                     .y0((innerDatum, innerIndex) => y0Projector(innerDatum, innerIndex, dataset))
                     .y1((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
                     .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum, index);
      };
      return propertyToProjectors;
    }

    public getAllSelections(datasets = this.datasets(), exclude = false) {
      var allSelections = super.getAllSelections(datasets, exclude)[0];
      if (exclude) {
        datasets = this.datasets().filter((dataset) => datasets.indexOf(dataset) < 0);
      }
      var lineDrawers = datasets.map((dataset) => this._lineDrawers.get(dataset))
                                .filter((drawer) => drawer != null);
      lineDrawers.forEach((ld, i) => allSelections.push(ld._getSelection(i).node()));
      return d3.selectAll(allSelections);
    }

    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var allPlotData = super.getAllPlotData(datasets);
      var allElements = allPlotData.selection[0];

      this._keysForDatasets(datasets).forEach((datasetKey) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
        if (plotDatasetKey == null) { return; }
        var dataset = plotDatasetKey.dataset;
        var drawer = this._lineDrawers.get(dataset);
        dataset.data().forEach((datum: any, index: number) => {
          var pixelPoint = this._pixelPoint(datum, index, dataset);
          if (pixelPoint.x !== pixelPoint.x || pixelPoint.y !== pixelPoint.y) {
            return;
          }
          allElements.push(drawer._getSelection(index).node());
        });
      });

      return { data: allPlotData.data, pixelPoints: allPlotData.pixelPoints, selection: d3.selectAll(allElements) };
    }
  }
}
}
