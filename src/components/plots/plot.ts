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

    export interface AccessorScaleBinding<D, R> {
      accessor: _Accessor;
      scale?: Scale<D, R>;
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

    protected _propertyExtents: D3.Map<any[]>;
    protected _propertyBindings: D3.Map<Plots.AccessorScaleBinding<any, any>>;

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
      this._clipPathEnabled = true;
      this.classed("plot", true);
      this._key2PlotDatasetKey = d3.map();
      this._attrBindings = d3.map();
      this._attrExtents = d3.map();
      this._extentProvider = (scale: Scale<any, any>) => this._extentsForScale(scale);
      this._datasetKeysInOrder = [];
      this._nextSeriesIndex = 0;
      this._renderCallback = (scale) => this.render();
      this._onDatasetUpdateCallback = () => this._onDatasetUpdate();
      this._propertyBindings = d3.map();
      this._propertyExtents = d3.map();
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
      var drawer = this._getDrawer(key);
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

    protected _getDrawer(key: string): Drawers.AbstractDrawer {
      return new Drawers.AbstractDrawer(key);
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

    public attr<D>(attr: string): Plots.AccessorScaleBinding<D, number | string>;
    public attr(attr: string, attrValue: number | string | _Accessor): Plot;
    public attr<D>(attr: string, attrValue: D | _Accessor, scale: Scale<D, number | string>): Plot;
    public attr<D>(attr: string, attrValue?: number | string | _Accessor | D, scale?: Scale<D, number | string>): any {
      if (attrValue == null) {
        return this._attrBindings.get(attr);
      }
      this._bindAttr(attr, attrValue, scale);
      this.render(); // queue a re-render upon changing projector
      return this;
    }

    protected _bindProperty(property: string, value: any, scale: Scale<any, any>) {
      this._bind(property, value, scale, this._propertyBindings, this._propertyExtents);
      this._updateExtentsForProperty(property);
    }

    private _bindAttr(attr: string, value: any, scale: Scale<any, any>) {
      this._bind(attr, value, scale, this._attrBindings, this._attrExtents);
      this._updateExtentsForAttr(attr);
    }

    private _bind(key: string, value: any, scale: Scale<any, any>,
                      bindings: D3.Map<Plots.AccessorScaleBinding<any, any>>, extents: D3.Map<any[]>) {
      var binding = bindings.get(key);
      var oldScale = binding != null ? binding.scale : null;

      if (oldScale != null) {
        this._uninstallScaleForKey(oldScale, key);
      }
      if (scale != null) {
        this._installScaleForKey(scale, key);
      }

      bindings.set(key, { accessor: d3.functor(value), scale: scale });
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var h: AttributeToProjector = {};
      this._attrBindings.forEach((attr, binding) => {
        var accessor = binding.accessor;
        var scale = binding.scale;
        var fn = scale ? (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => scale.scale(accessor(d, i, dataset, m)) : accessor;
        h[attr] = fn;
      });
      var propertyProjectors = this._generatePropertyToProjectors();
      Object.keys(propertyProjectors).forEach((key) => {
        if (h[key] == null) {
          h[key] = propertyProjectors[key];
        }
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
      this._propertyBindings.forEach((property, binding) => {
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
      this._propertyExtents.forEach((property) => this._updateExtentsForProperty(property));
      this._scales().forEach((scale) => scale._autoDomainIfAutomaticMode());
    }

    private _updateExtentsForAttr(attr: string) {
      // Filters should never be applied to attributes
      this._updateExtentsForKey(attr, this._attrBindings, this._attrExtents, null);
    }

    protected _updateExtentsForProperty(property: string) {
      this._updateExtentsForKey(property, this._propertyBindings, this._propertyExtents, this._filterForProperty(property));
    }

    protected _filterForProperty(property: string): _Accessor {
      return null;
    }

    private _updateExtentsForKey(key: string, bindings: D3.Map<Plots.AccessorScaleBinding<any, any>>,
        extents: D3.Map<any[]>, filter: _Accessor) {
      var accScaleBinding = bindings.get(key);
      if (accScaleBinding.accessor == null) { return; }
      extents.set(key, this._datasetKeysInOrder.map((key) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(key);
        var dataset = plotDatasetKey.dataset;
        var plotMetadata = plotDatasetKey.plotMetadata;
        return this._computeExtent(dataset, accScaleBinding.accessor, plotMetadata, filter);
      }));
    }

    private _computeExtent(dataset: Dataset, accessor: _Accessor, plotMetadata: any, filter: _Accessor): any[] {
      var data = dataset.data();
      if (filter != null) {
        data = data.filter((d, i) => filter(d, i, dataset, plotMetadata));
      }
      var appliedAccessor = (d: any, i: number) => accessor(d, i, dataset, plotMetadata);
      var mappedData = data.map(appliedAccessor);
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
    protected _extentsForProperty(property: string) {
      return this._propertyExtents.get(property);
    }

    private _extentsForScale<D>(scale: Scale<D, any>): D[][] {
      if (!this._isAnchored) {
        return [];
      }
      var allSetsOfExtents: D[][][] = [];
      this._attrBindings.forEach((attr, binding) => {
        if (binding.scale === scale) {
          var extents = this._attrExtents.get(attr);
          if (extents != null) {
            allSetsOfExtents.push(extents);
          }
        }
      });

      this._propertyBindings.forEach((property, binding) => {
        if (binding.scale === scale) {
          var extents = this._extentsForProperty(property);
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

    protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
      scale.offUpdate(this._renderCallback);
      scale.removeExtentProvider(this._extentProvider);
      scale._autoDomainIfAutomaticMode();
    }

    protected _installScaleForKey(scale: Scale<any, any>, key: string) {
      scale.onUpdate(this._renderCallback);
      scale.addExtentProvider(this._extentProvider);
      scale._autoDomainIfAutomaticMode();
    }

    protected _generatePropertyToProjectors(): AttributeToProjector {
      var attrToProjector: AttributeToProjector = {};
      this._propertyBindings.forEach((key, binding) => {
        var scaledAccessor = (d: any, i: number, dataset: Dataset, m: any) => binding.scale.scale(binding.accessor(d, i, dataset, m));
        attrToProjector[key] = binding.scale == null ? binding.accessor : scaledAccessor;
      });
      return attrToProjector;
    }
  }
}
