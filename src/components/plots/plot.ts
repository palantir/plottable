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
      datasetKey: string;
    }

    export type PlotData = {
      data: any[];
      pixelPoints: Point[];
      selection: D3.Selection;
    }
  }

  export class Plot extends Component {
    protected _dataChanged = false;
    protected _key2PlotDatasetKey: D3.Map<Plots.PlotDatasetKey>;
    protected _datasetKeysInOrder: string[];

    protected _renderArea: D3.Selection;
    protected _attrBindings: D3.Map<_Projection>;
    protected _attrExtents: D3.Map<any[]>;
    private _extentProvider: Scales.ExtentProvider<any>;

    protected _animate: boolean = false;
    private _animators: Animators.PlotAnimatorMap = {};
    protected _animateOnNextRender = true;
    private _nextSeriesIndex: number;
    private _renderCallback: ScaleCallback<Scale<any, any>>;
    private _onDatasetUpdateCallback: DatasetCallback;

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
      this._attrBindings = d3.map();
      this._attrExtents = d3.map();
      this._extentProvider = (scale: Scale<any, any>) => this._extentsForScale(scale);
      this._datasetKeysInOrder = [];
      this._nextSeriesIndex = 0;
      this._renderCallback = (scale) => this.render();
      this._onDatasetUpdateCallback = () => this._onDatasetUpdate();
    }

    public anchor(selection: D3.Selection) {
      super.anchor(selection);
      this._animateOnNextRender = true;
      this._dataChanged = true;
      this._updateExtents();
      return this;
    }

    protected _setup() {
      super._setup();
      this._renderArea = this._content.append("g").classed("render-area", true);
      // HACKHACK on 591
      this._getDrawersInOrder().forEach((d) => d.setup(this._renderArea.append("g")));
    }

    public destroy() {
      super.destroy();
      this._scales().forEach((scale) => scale.offUpdate(this._renderCallback));
      this.datasets().forEach((dataset) => this.removeDataset(dataset));
    }

    /**
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    public addDataset(dataset: Dataset) {
      var key = "_" + this._nextSeriesIndex++;
      if (this._key2PlotDatasetKey.has(key)) {
        this.removeDataset(dataset);
      };
      var drawer = this._getDrawer();
      var metadata = this._getPlotMetadataForDataset(key);
      var pdk = {drawer: drawer, dataset: dataset, key: key, plotMetadata: metadata};
      this._datasetKeysInOrder.push(key);
      this._key2PlotDatasetKey.set(key, pdk);

      if (this._isSetup) {
        drawer.setup(this._renderArea.append("g"));
      }

      dataset.onUpdate(this._onDatasetUpdateCallback);
      this._onDatasetUpdate();
      return this;
    }

    protected _getDrawer(): Drawers.AbstractDrawer {
      return new Drawers.AbstractDrawer();
    }

    protected _getAnimator(key: string): Animators.PlotAnimator {
      if (this._animate && this._animateOnNextRender) {
        return this._animators[key] || new Animators.Null();
      } else {
        return new Animators.Null();
      }
    }

    protected _onDatasetUpdate() {
      this._updateExtents();
      this._animateOnNextRender = true;
      this._dataChanged = true;
      this.render();
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
     * Identical to plot.attr
     */
    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      attrToSet = attrToSet.toLowerCase();
      var previousProjection = this._attrBindings.get(attrToSet);
      var previousScale = previousProjection && previousProjection.scale;

      accessor = Utils.Methods.accessorize(accessor);
      this._attrBindings.set(attrToSet, {accessor: accessor, scale: scale, attribute: attrToSet});
      this._updateExtentsForAttr(attrToSet);

      if (previousScale) {
        if (this._scales().indexOf(previousScale) !== -1) {
          previousScale.offUpdate(this._renderCallback);
          previousScale.removeExtentProvider(this._extentProvider);
        }
        previousScale._autoDomainIfAutomaticMode();
      }

      if (scale) {
        scale.onUpdate(this._renderCallback);
        scale.addExtentProvider(this._extentProvider);
        scale._autoDomainIfAutomaticMode();
      }
      this.render(); // queue a re-render upon changing projector
      return this;
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var h: AttributeToProjector = {};
      this._attrBindings.forEach((attr, binding) => {
        var accessor = binding.accessor;
        var scale = binding.scale;
        var fn = scale ? (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => scale.scale(accessor(d, i, dataset, m)) : accessor;
        h[attr] = fn;
      });
      return h;
    }

    /**
     * Generates a dictionary mapping an attribute to a function that calculate that attribute's value
     * in accordance with the given datasetKey.
     *
     * Note that this will return all of the data attributes, which may not perfectly align to svg attributes
     *
     * @param {Dataset} dataset The dataset to generate the dictionary for
     * @returns {AttributeToAppliedProjector} A dictionary mapping attributes to functions
     */
    public generateProjectors(dataset: Dataset): AttributeToAppliedProjector {
      var attrToAppliedProjector: AttributeToAppliedProjector = {};
      var datasetKey = this._keyForDataset(dataset);
      if (datasetKey != null) {
        var attrToProjector = this._generateAttrToProjector();
        var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
        var plotMetadata = plotDatasetKey.plotMetadata;
        d3.entries(attrToProjector).forEach((keyValue: any) => {
          attrToAppliedProjector[keyValue.key] = (datum: any, index: number) => {
            return keyValue.value(datum, index, plotDatasetKey.dataset, plotMetadata);
          };
        });
      }
      return attrToAppliedProjector;
    }

    protected _render() {
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
      this._updateExtents();
      return this;
    }

    /**
     * @returns {Scale[]} A unique array of all scales currently used by the Plot.
     */
    private _scales() {
      var scales: Scale<any, any>[] = [];
      this._attrBindings.forEach((attr, binding) => {
        var scale = binding.scale;
        if (scale != null && scales.indexOf(scale) === -1) {
          scales.push(scale);
        }
      });
      return scales;
    }

    /**
     * Updates the extents associated with each attribute, then autodomains all scales the Plot uses.
     */
    protected _updateExtents() {
      this._attrBindings.forEach((attr) => this._updateExtentsForAttr(attr));
      this._scales().forEach((scale) => scale._autoDomainIfAutomaticMode());
    }

    private _updateExtentsForAttr(attr: string) {
      var binding = this._attrBindings.get(attr);
      var accessor = binding.accessor;
      var scale = binding.scale;
      var coercer = (scale != null) ? scale._typeCoercer : (d: any) => d;
      var extents = this._datasetKeysInOrder.map((key) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(key);
        var dataset = plotDatasetKey.dataset;
        var plotMetadata = plotDatasetKey.plotMetadata;
        return this._computeExtent(dataset, accessor, coercer, plotMetadata);
      });
      this._attrExtents.set(attr, extents);
    }

    private _computeExtent(dataset: Dataset, accessor: _Accessor, typeCoercer: (d: any) => any, plotMetadata: any): any[] {
      var data = dataset.data();
      var appliedAccessor = (d: any, i: number) => accessor(d, i, dataset, plotMetadata);
      var mappedData = data.map(appliedAccessor).map(typeCoercer);
      if (mappedData.length === 0) {
        return [];
      } else if (typeof(mappedData[0]) === "string") {
        return Utils.Methods.uniq(mappedData);
      } else {
        var extent = d3.extent(mappedData);
        if (extent[0] == null || extent[1] == null) {
          return [];
        } else {
          return extent;
        }
      }
    }

    /**
     * Override in subclass to add special extents, such as included values
     */
    protected _extentsForAttr(attr: string) {
      return this._attrExtents.get(attr);
    }

    private _extentsForScale<D>(scale: Scale<D, any>): D[][] {
      if (!this._isAnchored) {
        return [];
      }
      var allSetsOfExtents: D[][][] = [];
      this._attrBindings.forEach((attr, binding) => {
        if (binding.scale === scale) {
          var extents = this._extentsForAttr(attr);
          if (extents != null) {
            allSetsOfExtents.push(extents);
          }
        }
      });
      return d3.merge(allSetsOfExtents);
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
      if (animator === undefined) {
        return this._animators[animatorKey];
      } else {
        this._animators[animatorKey] = animator;
        return this;
      }
    }

    /**
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    public removeDataset(dataset: Dataset): Plot {
      var key = this._keyForDataset(dataset);
      if (key != null && this._key2PlotDatasetKey.has(key)) {
        var pdk = this._key2PlotDatasetKey.get(key);
        pdk.drawer.remove();
        pdk.dataset.offUpdate(this._onDatasetUpdateCallback);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        this._key2PlotDatasetKey.remove(key);
        this._onDatasetUpdate();
      }
      return this;
    }

    /**
     * Returns the internal key for the Dataset, or undefined if not found
     */
    private _keyForDataset(dataset: Dataset) {
      return this._datasetKeysInOrder[this.datasets().indexOf(dataset)];
    }

    /**
     * Returns an array of internal keys corresponding to those Datasets actually on the plot
     */
    protected _keysForDatasets(datasets: Dataset[]) {
      return datasets.map((dataset) => this._keyForDataset(dataset)).filter((key) => key != null);
    }

    public datasets(): Dataset[];
    public datasets(datasets: Dataset[]): Plot;
    public datasets(datasets?: Dataset[]): any {
      var currentDatasets = this._datasetKeysInOrder.map((k) => this._key2PlotDatasetKey.get(k).dataset);
      if (datasets == null) {
        return currentDatasets;
      }
      currentDatasets.forEach((dataset) => this.removeDataset(dataset));
      datasets.forEach((dataset) => this.addDataset(dataset));
      return this;
    }

    protected _getDrawersInOrder(): Drawers.AbstractDrawer[] {
      return this._datasetKeysInOrder.map((k) => this._key2PlotDatasetKey.get(k).drawer);
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: new Animators.Null()}];
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
    protected _getPlotMetadataForDataset(key: string): Plots.PlotMetadata {
      return {
        datasetKey: key
      };
    }

    private _paint() {
      var drawSteps = this._generateDrawSteps();
      var dataToDraw = this._getDataToDraw();
      var drawers = this._getDrawersInOrder();

      var times = this._datasetKeysInOrder.map((k, i) =>
        drawers[i].draw(
          dataToDraw.get(k),
          drawSteps,
          this._key2PlotDatasetKey.get(k).dataset,
          this._key2PlotDatasetKey.get(k).plotMetadata
        ));
      var maxTime = Utils.Methods.max(times, 0);
      this._additionalPaint(maxTime);
    }

    /**
     * Retrieves all of the Selections of this Plot for the specified Datasets.
     *
     * @param {Dataset[]} datasets The Datasets to retrieve the selections from.
     * If not provided, all selections will be retrieved.
     * @param {boolean} exclude If set to true, all Datasets will be queried excluding the keys referenced
     * in the previous datasetKeys argument (default = false).
     * @returns {D3.Selection} The retrieved Selections.
     */
    public getAllSelections(datasets = this.datasets(), exclude = false): D3.Selection {
      var datasetKeyArray = this._keysForDatasets(datasets);

      if (exclude) {
        var excludedDatasetKeys = d3.set(datasetKeyArray);
        datasetKeyArray = this._datasetKeysInOrder.filter((datasetKey) => !excludedDatasetKeys.has(datasetKey));
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
     * @param {Dataset[]} datasets The Datasets to retrieve the PlotData from.
     * If not provided, all PlotData will be retrieved.
     * @returns {PlotData} The retrieved PlotData.
     */
    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var allElements: EventTarget[] = [];

      this._keysForDatasets(datasets).forEach((datasetKey) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
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

        if (!this._isVisibleOnPlot(datum, pixelPoint, selection)) {
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

    protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      return !(pixelPoint.x < 0 || pixelPoint.y < 0 ||
        pixelPoint.x > this.width() || pixelPoint.y > this.height());
    }
  }
}
