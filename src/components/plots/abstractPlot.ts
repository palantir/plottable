///<reference path="../../reference.ts" />

module Plottable {

  export module Plots {

    /**
     * A key that is also coupled with a dataset, a drawer and a metadata in Plot.
     */
    export type PlotDatasetKey = {
      dataset: Dataset;
      drawer: Drawers.AbstractDrawer;
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
  }

  export class Plot extends Component {
    protected animated: boolean = false;
    protected animateOnNextRender = true;
    protected datasetKeys: D3.Map<Plots.PlotDatasetKey>;
    protected datasetKeysInOrder: string[];
    protected dataChanged = false;
    protected renderArea: D3.Selection;
    protected projections: { [attrToSet: string]: _Projection; } = {};

    private animators: Animators.PlotAnimatorMap = {};
    private nextSeriesIndex: number;

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
      this.datasetKeys = d3.map();
      this.datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
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
    public addDataset(dataset: Dataset | any[]): Plot;
    public addDataset(key: string, dataset: Dataset | any[]): Plot;
    public addDataset(keyOrDataset: any, dataset?: any): Plot {
      if (typeof(keyOrDataset) !== "string" && dataset !== undefined) {
        throw new Error("invalid input to addDataset");
      }
      if (typeof(keyOrDataset) === "string" && keyOrDataset[0] === "_") {
        Utils.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(keyOrDataset) === "string" ? keyOrDataset : "_" + this.nextSeriesIndex++;
      var data = typeof(keyOrDataset) !== "string" ? keyOrDataset : dataset;
      dataset = (data instanceof Dataset) ? data : new Dataset(data);

      this._addDataset(key, dataset);
      return this;
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.animateOnNextRender = true;
      this.dataChanged = true;
      this.updateScaleExtents();
    }

    /**
     * Enables or disables animation.
     *
     * @param {boolean} enabled Whether or not to animate.
     */
    public animate(enabled: boolean) {
      this.animated = enabled;
      return this;
    }

    /**
     * Get the animator associated with the specified Animator key.
     *
     * @return {PlotAnimator} The Animator for the specified key.
     */
    public animator(animatorKey: string): Animators.PlotAnimator;
    /**
     * Set the animator associated with the specified Animator key.
     *
     * @param {string} animatorKey The key for the Animator.
     * @param {PlotAnimator} animator An Animator to be assigned to
     * the specified key.
     * @returns {Plot} The calling Plot.
     */
    public animator(animatorKey: string, animator: Animators.PlotAnimator): Plot;
    public animator(animatorKey: string, animator?: Animators.PlotAnimator): any {
      if (animator === undefined){
        return this.animators[animatorKey];
      } else {
        this.animators[animatorKey] = animator;
        return this;
      }
    }

    /**
     * Sets an attribute of every data point.
     *
     * Here's a common use case:
     * ```typescript
     * plot.attr("x", function(d) { return d.foo; }, xScale);
     * ```
     * This will set the x accessor of each datum `d` to be `d.foo`,
     * scaled in accordance with `xScale`
     *
     * @param {string} attrToSet The attribute to set across each data
     * point. Popular examples include "x", "y".
     *
     * @param {Function|string|any} accessor Function to apply to each element
     * of the dataSource. If a Function, use `accessor(d, i)`. If a string,
     * `d[accessor]` is used. If anything else, use `accessor` as a constant
     * across all data points.
     *
     * @param {Scale.Scale} scale If provided, the result of the accessor
     * is passed through the scale, such as `scale.scale(accessor(d, i))`.
     *
     * @returns {Plot} The calling Plot.
     */
    public attr(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      return this.project(attrToSet, accessor, scale);
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
    public datasetOrder(order: string[]): Plot;
    public datasetOrder(order?: string[]): any {
      if (order === undefined) {
        return this.datasetKeysInOrder;
      }
      function isPermutation(l1: string[], l2: string[]) {
        var intersection = Utils.Methods.intersection(d3.set(l1), d3.set(l2));
        var size = (<any> intersection).size(); // HACKHACK pending on borisyankov/definitelytyped/ pr #2653
        return size === l1.length && size === l2.length;
      }
      if (isPermutation(order, this.datasetKeysInOrder)) {
        this.datasetKeysInOrder = order;
        this.onDatasetUpdate();
      } else {
        Utils.Methods.warn("Attempted to change datasetOrder, but new order is not permutation of old. Ignoring.");
      }
      return this;
    }

    public datasets(): Dataset[] {
      return this.datasetKeysInOrder.map((k) => this.datasetKeys.get(k).dataset);
    }

    public detach() {
      super.detach();
      // make the domain resize
      this.updateScaleExtents();
      return this;
    }

    public doRender() {
      if (this._isAnchored) {
        this.paint();
        this.dataChanged = false;
        this.animateOnNextRender = false;
      }
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
      var attrToProjector = this.generateAttrToProjector();
      var plotDatasetKey = this.datasetKeys.get(datasetKey);
      var plotMetadata = plotDatasetKey.plotMetadata;
      var userMetadata = plotDatasetKey.dataset.metadata();
      var attrToAppliedProjector: AttributeToAppliedProjector = {};
      d3.entries(attrToProjector).forEach((keyValue: any) => {
        attrToAppliedProjector[keyValue.key] = (datum: any, index: number) => keyValue.value(datum, index, userMetadata, plotMetadata);
      });
      return attrToAppliedProjector;
    }

    /**
     * Retrieves all of the PlotData of this plot for the specified dataset(s)
     *
     * @param {string | string[]} datasetKeys The dataset(s) to retrieve the selections from.
     * If not provided, all selections will be retrieved.
     * @returns {PlotData} The retrieved PlotData.
     */
    public getAllPlotData(datasetKeys: string | string[] = this.datasetOrder()): Plots.PlotData {
      var datasetKeyArray: string[] = [];
      if (typeof(datasetKeys) === "string") {
        datasetKeyArray = [<string> datasetKeys];
      } else {
        datasetKeyArray = <string[]> datasetKeys;
      }

      return this._getAllPlotData(datasetKeyArray);
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
        var plotDatasetKey = this.datasetKeys.get(datasetKey);
        if (plotDatasetKey == null) { return; }
        var drawer = plotDatasetKey.drawer;
        drawer._getRenderArea().selectAll(drawer._getSelector()).each(function () {
          allSelections.push(this);
        });
      });

      return d3.selectAll(allSelections);
    }

    /**
     * Retrieves PlotData with the lowest distance, where distance is defined
     * to be the Euclidiean norm.
     *
     * @param {Point} queryPoint The point to which plot data should be compared
     *
     * @returns {PlotData} The PlotData closest to queryPoint
     */
    public getClosestPlotData(queryPoint: Point): Plots.PlotData {
      var closestDistanceSquared = Infinity;
      var closestIndex: number;
      var plotData = this.getAllPlotData();
      plotData.pixelPoints.forEach((pixelPoint: Point, index: number) => {
        var datum = plotData.data[index];
        var selection = d3.select(plotData.selection[0][index]);

        if (!this.isVisibleOnPlot(datum, pixelPoint, selection)) {
          return;
        }

        var distance = Utils.Methods.distanceSquared(pixelPoint, queryPoint);
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
     * Identical to plot.attr
     */
    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      attrToSet = attrToSet.toLowerCase();
      var currentProjection = this.projections[attrToSet];
      var existingScale = currentProjection && currentProjection.scale;

      if (existingScale) {
        this.datasetKeysInOrder.forEach((key) => {
          existingScale._removeExtent(this.getID().toString() + "_" + key, attrToSet);
          existingScale.broadcaster.deregisterListener(this);
        });
      }

      if (scale) {
        scale.broadcaster.registerListener(this, () => this.render());
      }
      accessor = Utils.Methods.accessorize(accessor);
      this.projections[attrToSet] = {accessor: accessor, scale: scale, attribute: attrToSet};
      this.updateScaleExtent(attrToSet);
      this.render(); // queue a re-render upon changing projector
      return this;
    }

    public remove() {
      super.remove();
      this.datasetKeysInOrder.forEach((k) => this.removeDataset(k));
      // deregister from all scales
      var properties = Object.keys(this.projections);
      properties.forEach((property) => {
        var projector = this.projections[property];
        if (projector.scale) {
          projector.scale.broadcaster.deregisterListener(this);
        }
      });
    }

    /**
     * Removes a dataset by the given identifier
     *
     * @param {string | Dataset | any[]} datasetIdentifer The identifier as the key of the Dataset to remove
     * If string is inputted, it is interpreted as the dataset key to remove.
     * If Dataset is inputted, the first Dataset in the plot that is the same will be removed.
     * If any[] is inputted, the first data array in the plot that is the same will be removed.
     * @returns {Plot} The calling Plot.
     */
    public removeDataset(datasetIdentifier: string | Dataset | any[]): Plot {
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
          key = this.datasetKeysInOrder[index];
        }

      }

      return this._removeDataset(key);
    }

    public updateScaleExtent(attr: string) {
      var projector = this.projections[attr];
      if (projector.scale) {
        this.datasetKeysInOrder.forEach((key) => {
          var plotDatasetKey = this.datasetKeys.get(key);
          var dataset = plotDatasetKey.dataset;
          var plotMetadata = plotDatasetKey.plotMetadata;
          var extent = dataset._getExtent(projector.accessor, projector.scale.typeCoercer, plotMetadata);
          var scaleKey = this.getID().toString() + "_" + key;
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale._removeExtent(scaleKey, attr);
          } else {
            projector.scale.updateExtent(scaleKey, attr, extent);
          }
        });
      }
    }

    protected additionalPaint(time: number) {
      // no-op
    }

    protected generateAttrToProjector(): AttributeToProjector {
      var h: AttributeToProjector = {};
      d3.keys(this.projections).forEach((a) => {
        var projection = this.projections[a];
        var accessor = projection.accessor;
        var scale = projection.scale;
        var fn = scale ? (d: any, i: number, u: any, m: Plots.PlotMetadata) => scale.scale(accessor(d, i, u, m)) : accessor;
        h[a] = fn;
      });
      return h;
    }

    protected generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this.generateAttrToProjector(), animator: new Animators.Null()}];
    }

    protected _getAllPlotData(datasetKeys: string[]): Plots.PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var allElements: EventTarget[] = [];

      datasetKeys.forEach((datasetKey) => {
        var plotDatasetKey = this.datasetKeys.get(datasetKey);
        if (plotDatasetKey == null) { return; }
        var drawer = plotDatasetKey.drawer;
        plotDatasetKey.dataset.data().forEach((datum: any, index: number) => {
          var pixelPoint = drawer._getPixelPoint(datum, index);
          if (pixelPoint.x !== pixelPoint.x || pixelPoint.y !== pixelPoint.y) {
            return;
          }
          data.push(datum);
          pixelPoints.push(pixelPoint);
          allElements.push(drawer._getSelection(index).node());
        });
      });

      return { data: data, pixelPoints: pixelPoints, selection: d3.selectAll(allElements) };
    }

    protected getAnimator(key: string): Animators.PlotAnimator {
      if (this.animated && this.animateOnNextRender) {
        return this.animators[key] || new Animators.Null();
      } else {
        return new Animators.Null();
      }
    }

    protected getDataToDraw() {
      var datasets: D3.Map<any[]> = d3.map();
      this.datasetKeysInOrder.forEach((key: string) => {
        datasets.set(key, this.datasetKeys.get(key).dataset.data());
      });
      return datasets;
    }

    protected getDrawer(key: string): Drawers.AbstractDrawer {
      return new Drawers.AbstractDrawer(key);
    }

    protected getDrawersInOrder(): Drawers.AbstractDrawer[] {
      return this.datasetKeysInOrder.map((k) => this.datasetKeys.get(k).drawer);
    }

    /**
     * Gets the new plot metadata for new dataset with provided key
     *
     * @param {string} key The key of new dataset
     */
    protected getPlotMetadataForDataset(key: string): Plots.PlotMetadata {
      return {
        datasetKey: key
      };
    }

    protected isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      return !(pixelPoint.x < 0 || pixelPoint.y < 0 ||
        pixelPoint.x > this.width() || pixelPoint.y > this.height());
    }

    protected onDatasetUpdate() {
      this.updateScaleExtents();
      this.animateOnNextRender = true;
      this.dataChanged = true;
      this.render();
    }

    protected setup() {
      super.setup();
      this.renderArea = this._content.append("g").classed("render-area", true);
      // HACKHACK on 591
      this.getDrawersInOrder().forEach((d) => d.setup(this.renderArea.append("g")));
    }

    /**
     * This function makes sure that all of the scales in this._projections
     * have an extent that includes all the data that is projected onto them.
     */
    protected updateScaleExtents() {
      d3.keys(this.projections).forEach((attr: string) => this.updateScaleExtent(attr));
    }

    private _addDataset(key: string, dataset: Dataset) {
      if (this.datasetKeys.has(key)) {
        this.removeDataset(key);
      };
      var drawer = this.getDrawer(key);
      var metadata = this.getPlotMetadataForDataset(key);
      var pdk = {drawer: drawer, dataset: dataset, key: key, plotMetadata: metadata};
      this.datasetKeysInOrder.push(key);
      this.datasetKeys.set(key, pdk);

      if (this.isSetup) {
        drawer.setup(this.renderArea.append("g"));
      }
      dataset.broadcaster.registerListener(this, () => this.onDatasetUpdate());
      this.onDatasetUpdate();
    }

    private paint() {
      var drawSteps = this.generateDrawSteps();
      var dataToDraw = this.getDataToDraw();
      var drawers = this.getDrawersInOrder();

      // TODO: Use metadata instead of dataToDraw #1297.
      var times = this.datasetKeysInOrder.map((k, i) =>
        drawers[i].draw(
          dataToDraw.get(k),
          drawSteps,
          this.datasetKeys.get(k).dataset.metadata(),
          this.datasetKeys.get(k).plotMetadata
        ));
      var maxTime = Utils.Methods.max(times, 0);
      this.additionalPaint(maxTime);
    }

    private _removeDataset(key: string): Plot {
      if (key != null && this.datasetKeys.has(key)) {
        var pdk = this.datasetKeys.get(key);
        pdk.drawer.remove();

        var projectors = d3.values(this.projections);
        var scaleKey = this.getID().toString() + "_" + key;
        projectors.forEach((p) => {
          if (p.scale != null) {
            p.scale._removeExtent(scaleKey, p.attribute);
          }
        });

        pdk.dataset.broadcaster.deregisterListener(this);
        this.datasetKeysInOrder.splice(this.datasetKeysInOrder.indexOf(key), 1);
        this.datasetKeys.remove(key);
        this.onDatasetUpdate();
      }
      return this;
    }
  }
}
