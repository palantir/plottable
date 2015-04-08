///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * A key that is also coupled with a dataset, a drawer and a metadata in Plot.
   */
  export type PlotDatasetKey = {
    dataset: Dataset;
    drawer: _Drawer.AbstractDrawer;
    plotMetadata: PlotMetadata;
    key: string;
  }

  export interface PlotMetadata {
    datasetKey: string
  }

  export type PlotData = {
    data: any[];
    pixelPoints: Point[];
    selection: D3.Selection;
  }

  export class AbstractPlot extends Component.AbstractComponent {
    protected _dataChanged = false;
    protected _key2PlotDatasetKey: D3.Map<PlotDatasetKey>;
    protected _datasetKeysInOrder: string[];

    protected _renderArea: D3.Selection;
    protected _projections: { [attrToSet: string]: _Projection; } = {};

    protected _animate: boolean = false;
    private _animators: Animator.PlotAnimatorMap = {};
    protected _animateOnNextRender = true;
    private _nextSeriesIndex: number;

    /**
     * Constructs a Plot.
     *
     * Plots render data. Common example include Plot.Scatter, Plot.Bar, and Plot.Line.
     *
     * A bare Plot has a DataSource and any number of projectors, which take
     * data and "project" it onto the Plot, such as "x", "y", "fill", "r".
     *
     * @constructor
     * @param {any[]|Dataset} [dataset] If provided, the data or Dataset to be associated with this Plot.
     */
    constructor() {
      super();
      this.clipPathEnabled = true;
      this.classed("plot", true);
      this._key2PlotDatasetKey = d3.map();
      this._datasetKeysInOrder = [];
      this._nextSeriesIndex = 0;
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this._animateOnNextRender = true;
      this._dataChanged = true;
      this._updateScaleExtents();
    }

    protected _setup() {
      super._setup();
      this._renderArea = this._content.append("g").classed("render-area", true);
      // HACKHACK on 591
      this._getDrawersInOrder().forEach((d) => d.setup(this._renderArea.append("g")));
    }

    public remove() {
      super.remove();
      this._datasetKeysInOrder.forEach((k) => this.removeDataset(k));
      // deregister from all scales
      var properties = Object.keys(this._projections);
      properties.forEach((property) => {
        var projector = this._projections[property];
        if (projector.scale) {
          projector.scale.broadcaster.deregisterListener(this);
        }
      });
    }

    /**
     * Adds a dataset to this plot. Identify this dataset with a key.
     *
     * A key is automatically generated if not supplied.
     *
     * @param {string} [key] The key of the dataset.
     * @param {Dataset | any[]} dataset dataset to add.
     * @returns {Plot} The calling Plot.
     */
    public addDataset(dataset: Dataset | any[]): AbstractPlot;
    public addDataset(key: string, dataset: Dataset | any[]): AbstractPlot;
    public addDataset(keyOrDataset: any, dataset?: any): AbstractPlot {
      if (typeof(keyOrDataset) !== "string" && dataset !== undefined) {
        throw new Error("invalid input to addDataset");
      }
      if (typeof(keyOrDataset) === "string" && keyOrDataset[0] === "_") {
        _Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(keyOrDataset) === "string" ? keyOrDataset : "_" + this._nextSeriesIndex++;
      var data = typeof(keyOrDataset) !== "string" ? keyOrDataset : dataset;
      dataset = (data instanceof Dataset) ? data : new Dataset(data);

      this._addDataset(key, dataset);
      return this;
    }

    private _addDataset(key: string, dataset: Dataset) {
      if (this._key2PlotDatasetKey.has(key)) {
        this.removeDataset(key);
      };
      var drawer = this._getDrawer(key);
      var metadata = this._getPlotMetadataForDataset(key);
      var pdk = {drawer: drawer, dataset: dataset, key: key, plotMetadata: metadata};
      this._datasetKeysInOrder.push(key);
      this._key2PlotDatasetKey.set(key, pdk);

      if (this._isSetup) {
        drawer.setup(this._renderArea.append("g"));
      }
      dataset.broadcaster.registerListener(this, () => this._onDatasetUpdate());
      this._onDatasetUpdate();
    }

    protected _getDrawer(key: string): _Drawer.AbstractDrawer {
      return new _Drawer.AbstractDrawer(key);
    }

    protected _getAnimator(key: string): Animator.PlotAnimator {
      if (this._animate && this._animateOnNextRender) {
        return this._animators[key] || new Animator.Null();
      } else {
        return new Animator.Null();
      }
    }

    protected _onDatasetUpdate() {
      this._updateScaleExtents();
      this._animateOnNextRender = true;
      this._dataChanged = true;
      this._render();
    }

    /**
     * Sets an attribute of every data point.
     *
     * Here's a common use case:
     * ```typescript
     * plot.attr("r", function(d) { return d.foo; });
     * ```
     * This will set the radius of each datum `d` to be `d.foo`.
     *
     * @param {string} attrToSet The attribute to set across each data
     * point. Popular examples include "x", "y", "r". Scales that inherit from
     * Plot define their meaning.
     *
     * @param {Function|string|any} accessor Function to apply to each element
     * of the dataSource. If a Function, use `accessor(d, i)`. If a string,
     * `d[accessor]` is used. If anything else, use `accessor` as a constant
     * across all data points.
     *
     * @param {Scale.AbstractScale} scale If provided, the result of the accessor
     * is passed through the scale, such as `scale.scale(accessor(d, i))`.
     *
     * @returns {Plot} The calling Plot.
     */
    public attr(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any,any>) {
      return this.project(attrToSet, accessor, scale);
    }

    /**
     * Identical to plot.attr
     */
    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      attrToSet = attrToSet.toLowerCase();
      var currentProjection = this._projections[attrToSet];
      var existingScale = currentProjection && currentProjection.scale;

      if (existingScale) {
        this._datasetKeysInOrder.forEach((key) => {
          existingScale._removeExtent(this.getID().toString() + "_" + key, attrToSet);
          existingScale.broadcaster.deregisterListener(this);
        });
      }

      if (scale) {
        scale.broadcaster.registerListener(this, () => this._render());
      }
      accessor = _Util.Methods.accessorize(accessor);
      this._projections[attrToSet] = {accessor: accessor, scale: scale, attribute: attrToSet};
      this._updateScaleExtent(attrToSet);
      this._render(); // queue a re-render upon changing projector
      return this;
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var h: AttributeToProjector = {};
      d3.keys(this._projections).forEach((a) => {
        var projection = this._projections[a];
        var accessor = projection.accessor;
        var scale = projection.scale;
        var fn = scale ? (d: any, i: number, u: any, m: PlotMetadata) => scale.scale(accessor(d, i, u, m)) : accessor;
        h[a] = fn;
      });
      return h;
    }

    /**
     * Generates a dictionary mapping an attribute to a function that calculate that attribute's value
     * in accordance with the given datasetKey.
     *
     * Note that this will return all of the data attributes, which may not perfectly align to svg attributes
     *
     * @param {datasetKey} the key of the dataset to generate the dictionary for
     * @returns {AttributeToAppliedProjector} A dictionary mapping attributes to functions
     */
    public generateProjectors(datasetKey: string): AttributeToAppliedProjector {
      var attrToProjector = this._generateAttrToProjector();
      var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
      var plotMetadata = plotDatasetKey.plotMetadata;
      var userMetadata = plotDatasetKey.dataset.metadata();
      var attrToAppliedProjector: AttributeToAppliedProjector = {};
      d3.entries(attrToProjector).forEach((keyValue: any) => {
        attrToAppliedProjector[keyValue.key] = (datum: any, index: number) => keyValue.value(datum, index, userMetadata, plotMetadata);
      });
      return attrToAppliedProjector;
    }

    public _doRender() {
      if (this._isAnchored) {
        this._paint();
        this._dataChanged = false;
        this._animateOnNextRender = false;
      }
    }

    /**
     * Enables or disables animation.
     *
     * @param {boolean} enabled Whether or not to animate.
     */
    public animate(enabled: boolean) {
      this._animate = enabled;
      return this;
    }

    public detach() {
      super.detach();
      // make the domain resize
      this._updateScaleExtents();
      return this;
    }

    /**
     * This function makes sure that all of the scales in this._projections
     * have an extent that includes all the data that is projected onto them.
     */
    protected _updateScaleExtents() {
      d3.keys(this._projections).forEach((attr: string) => this._updateScaleExtent(attr));
    }

    public _updateScaleExtent(attr: string) {
      var projector = this._projections[attr];
      if (projector.scale) {
        this._datasetKeysInOrder.forEach((key) => {
          var plotDatasetKey = this._key2PlotDatasetKey.get(key);
          var dataset = plotDatasetKey.dataset;
          var plotMetadata = plotDatasetKey.plotMetadata;
          var extent = dataset._getExtent(projector.accessor, projector.scale._typeCoercer, plotMetadata);
          var scaleKey = this.getID().toString() + "_" + key;
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale._removeExtent(scaleKey, attr);
          } else {
            projector.scale._updateExtent(scaleKey, attr, extent);
          }
        });
      }
    }

    /**
     * Get the animator associated with the specified Animator key.
     *
     * @return {PlotAnimator} The Animator for the specified key.
     */
    public animator(animatorKey: string): Animator.PlotAnimator;
    /**
     * Set the animator associated with the specified Animator key.
     *
     * @param {string} animatorKey The key for the Animator.
     * @param {PlotAnimator} animator An Animator to be assigned to
     * the specified key.
     * @returns {Plot} The calling Plot.
     */
    public animator(animatorKey: string, animator: Animator.PlotAnimator): AbstractPlot;
    public animator(animatorKey: string, animator?: Animator.PlotAnimator): any {
      if (animator === undefined){
        return this._animators[animatorKey];
      } else {
        this._animators[animatorKey] = animator;
        return this;
      }
    }

    /**
     * Gets the dataset order by key
     *
     * @returns {string[]} A string array of the keys in order
     */
    public datasetOrder(): string[];
    /**
     * Sets the dataset order by key
     *
     * @param {string[]} order If provided, a string array which represents the order of the keys.
     * This must be a permutation of existing keys.
     *
     * @returns {Plot} The calling Plot.
     */
    public datasetOrder(order: string[]): AbstractPlot;
    public datasetOrder(order?: string[]): any {
      if (order === undefined) {
        return this._datasetKeysInOrder;
      }
      function isPermutation(l1: string[], l2: string[]) {
        var intersection = _Util.Methods.intersection(d3.set(l1), d3.set(l2));
        var size = (<any> intersection).size(); // HACKHACK pending on borisyankov/definitelytyped/ pr #2653
        return size === l1.length && size === l2.length;
      }
      if (isPermutation(order, this._datasetKeysInOrder)) {
        this._datasetKeysInOrder = order;
        this._onDatasetUpdate();
      } else {
        _Util.Methods.warn("Attempted to change datasetOrder, but new order is not permutation of old. Ignoring.");
      }
      return this;
    }

    /**
     * Removes a dataset by the given identifier
     *
     * @param {string | Dataset | any[]} datasetIdentifer The identifier as the key of the Dataset to remove
     * If string is inputted, it is interpreted as the dataset key to remove.
     * If Dataset is inputted, the first Dataset in the plot that is the same will be removed.
     * If any[] is inputted, the first data array in the plot that is the same will be removed.
     * @returns {AbstractPlot} The calling AbstractPlot.
     */
    public removeDataset(datasetIdentifier: string | Dataset | any[]): AbstractPlot {
      var key: string;
      if (typeof datasetIdentifier === "string") {
        key = <string> datasetIdentifier;
      } else if (typeof datasetIdentifier === "object") {

        var index = -1;
        if (datasetIdentifier instanceof Dataset) {
          var datasetArray = this.datasets();
          index = datasetArray.indexOf(<Dataset> datasetIdentifier);
        } else if (datasetIdentifier instanceof Array) {
          var dataArray = this.datasets().map(d => d.data());
          index = dataArray.indexOf(<any[]> datasetIdentifier);
        }
        if (index !== -1) {
          key = this._datasetKeysInOrder[index];
        }

      }

      return this._removeDataset(key);
    }

    private _removeDataset(key: string): AbstractPlot {
      if (key != null && this._key2PlotDatasetKey.has(key)) {
        var pdk = this._key2PlotDatasetKey.get(key);
        pdk.drawer.remove();

        var projectors = d3.values(this._projections);
        var scaleKey = this.getID().toString() + "_" + key;
        projectors.forEach((p) => {
          if (p.scale != null) {
            p.scale._removeExtent(scaleKey, p.attribute);
          }
        });

        pdk.dataset.broadcaster.deregisterListener(this);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        this._key2PlotDatasetKey.remove(key);
        this._onDatasetUpdate();
      }
      return this;
    }

    public datasets(): Dataset[] {
      return this._datasetKeysInOrder.map((k) => this._key2PlotDatasetKey.get(k).dataset);
    }

    protected _getDrawersInOrder(): _Drawer.AbstractDrawer[] {
      return this._datasetKeysInOrder.map((k) => this._key2PlotDatasetKey.get(k).drawer);
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: new Animator.Null()}];
    }

    protected _additionalPaint(time: number) {
      // no-op
    }

    protected _getDataToDraw() {
      var datasets: D3.Map<any[]> = d3.map();
      this._datasetKeysInOrder.forEach((key: string) => {
        datasets.set(key, this._key2PlotDatasetKey.get(key).dataset.data());
      });
      return datasets;
    }

    /**
     * Gets the new plot metadata for new dataset with provided key
     *
     * @param {string} key The key of new dataset
     */
    protected _getPlotMetadataForDataset(key: string): PlotMetadata {
      return {
        datasetKey: key
      };
    }

    private _paint() {
      var drawSteps = this._generateDrawSteps();
      var dataToDraw = this._getDataToDraw();
      var drawers = this._getDrawersInOrder();

      // TODO: Use metadata instead of dataToDraw #1297.
      var times = this._datasetKeysInOrder.map((k, i) =>
        drawers[i].draw(
          dataToDraw.get(k),
          drawSteps,
          this._key2PlotDatasetKey.get(k).dataset.metadata(),
          this._key2PlotDatasetKey.get(k).plotMetadata
        ));
      var maxTime = _Util.Methods.max(times, 0);
      this._additionalPaint(maxTime);
    }

    /**
     * Retrieves all of the selections of this plot for the specified dataset(s)
     *
     * @param {string | string[]} datasetKeys The dataset(s) to retrieve the selections from.
     * If not provided, all selections will be retrieved.
     * @param {boolean} exclude If set to true, all datasets will be queried excluding the keys referenced
     * in the previous datasetKeys argument (default = false).
     * @returns {D3.Selection} The retrieved selections.
     */
    public getAllSelections(datasetKeys: string | string[] = this.datasetOrder(), exclude = false): D3.Selection {
      var datasetKeyArray: string[] = [];
      if (typeof(datasetKeys) === "string") {
        datasetKeyArray = [<string> datasetKeys];
      } else {
        datasetKeyArray = <string[]> datasetKeys;
      }

      if (exclude) {
        var excludedDatasetKeys = d3.set(datasetKeyArray);
        datasetKeyArray = this.datasetOrder().filter((datasetKey) => !excludedDatasetKeys.has(datasetKey));
      }

      var allSelections: EventTarget[] = [];

      datasetKeyArray.forEach((datasetKey) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
        if (plotDatasetKey == null) { return; }
        var drawer = plotDatasetKey.drawer;
        drawer._getRenderArea().selectAll(drawer._getSelector()).each(function () {
          allSelections.push(this);
        });
      });

      return d3.selectAll(allSelections);
    }

    /**
     * Retrieves all of the PlotData of this plot for the specified dataset(s)
     *
     * @param {string | string[]} datasetKeys The dataset(s) to retrieve the selections from.
     * If not provided, all selections will be retrieved.
     * @returns {PlotData} The retrieved PlotData.
     */
    public getAllPlotData(datasetKeys: string | string[] = this.datasetOrder()): PlotData {
      var datasetKeyArray: string[] = [];
      if (typeof(datasetKeys) === "string") {
        datasetKeyArray = [<string> datasetKeys];
      } else {
        datasetKeyArray = <string[]> datasetKeys;
      }

      return this._getAllPlotData(datasetKeyArray);
    }

    protected _getAllPlotData(datasetKeys: string[]): PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var allElements: EventTarget[] = [];

      datasetKeys.forEach((datasetKey) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
        if (plotDatasetKey == null) { return; }
        var drawer = plotDatasetKey.drawer;
        plotDatasetKey.dataset.data().forEach((datum: any, index: number) => {
          data.push(datum);
          pixelPoints.push(drawer._getPixelPoint(datum, index));
          allElements.push(drawer._getSelection(index).node());
        });
      });

      return { data: data, pixelPoints: pixelPoints, selection: d3.selectAll(allElements) };
    }

    /**
     * Retrieves the closest PlotData for the specified dataset(s)
     *
     * @param {Point} queryPoint The point to query from
     * @param {number} withinValue Will only return plot data that is of a distance below withinValue
     *                             (default = Infinity)
     * @param {string | string[]} datasetKeys The dataset(s) to retrieve the plot data from.
     *                                        (default = this.datasetOrder())
     * @returns {PlotData} The retrieved PlotData.
     */
    public getClosestPlotData(queryPoint: Point, withinValue = Infinity, datasetKeys: string | string[] = this.datasetOrder()) {
      var datasetKeyArray: string[] = [];
      if (typeof(datasetKeys) === "string") {
        datasetKeyArray = [<string> datasetKeys];
      } else {
        datasetKeyArray = <string[]> datasetKeys;
      }

      return this._getClosestPlotData(queryPoint, datasetKeyArray, withinValue);
    }

    protected _getClosestPlotData(queryPoint: Point, datasetKeys: string[], withinValue = Infinity) {
      var closestDistanceSquared = Math.pow(withinValue, 2);
      var closestIndex: number;
      var plotData = this.getAllPlotData(datasetKeys);
      plotData.pixelPoints.forEach((pixelPoint: Point, index: number) => {
        var distance = _Util.Methods.distanceSquared(pixelPoint, queryPoint);
        if (distance < closestDistanceSquared) {
          closestDistanceSquared = distance;
          closestIndex = index;
        }
      });

      if (closestIndex == null) {
        return {data: [], pixelPoints: [], selection: d3.select()};
      }

      return {data: [plotData.data[closestIndex]],
              pixelPoints: [plotData.pixelPoints[closestIndex]],
              selection: d3.select(plotData.selection[0][closestIndex])};
    }

    /**
     * Retrieves the PlotData at the specified x/y value or within the x/y extents
     *
     * @param {number | Extent} xValueOrExtent The x value or extent to query
     * @param {number | Extent} yValueOrExtent The y value or extent to query
     * @param {string | string[]} datasetKeys The dataset(s) to retrieve the plot data from.
     *                                        (default = this.datasetOrder())
     * @returns {PlotData} The retrieved PlotData.
     */
    public getPlotData(xValueOrExtent: number | Extent, yValueOrExtent: number | Extent,
                       datasetKeys: string | string[] = this.datasetOrder()): PlotData {
      var xExtent = AbstractPlot._parseExtent(xValueOrExtent);
      var yExtent = AbstractPlot._parseExtent(yValueOrExtent);

      var datasetKeyArray: string[] = [];
      if (typeof(datasetKeys) === "string") {
        datasetKeyArray = [<string> datasetKeys];
      } else {
        datasetKeyArray = <string[]> datasetKeys;
      }

      return this._getPlotData(xExtent, yExtent, datasetKeyArray);
    }

    private static _parseExtent(input: number | Extent): Extent {
      return (typeof input === "number") ? {min: <number> input, max: <number> input} : <Extent> input;
    }

    protected _getPlotData(xExtent: Extent, yExtent: Extent, datasetKeys: string[]): PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var selections: EventTarget[] = [];
      var plotData = this.getAllPlotData(datasetKeys);
      plotData.selection.each(function(datum, index) {
        var bbox = this.getBBox();
        if (bbox.x + bbox.width >= xExtent.min && bbox.x <= xExtent.max &&
            bbox.y + bbox.height >= yExtent.min && bbox.y <= yExtent.max) {
          data.push(plotData.data[index]);
          pixelPoints.push(plotData.pixelPoints[index]);
          selections.push(this);
        }
      });

      return {data: data,
              pixelPoints: pixelPoints,
              selection: d3.selectAll(selections)};
    }
  }
}
}
