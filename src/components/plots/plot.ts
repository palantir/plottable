///<reference path="../../reference.ts" />

module Plottable {

  export module Plots {

    /**
     * A key that is also coupled with a dataset, a drawer and a metadata in Plot.
     */
    export type PlotDatasetKey = {
      dataset: Dataset;
      drawer: Drawers.AbstractDrawer;
      key: string;
    }

    export type PlotData = {
      data: any[];
      pixelPoints: Point[];
      selection: D3.Selection;
    }

    export interface AccessorScaleBinding<D, R> {
      accessor: Accessor<any>;
      scale?: Scale<D, R>;
    }

    export module Animator {
      export var MAIN = "main";
      export var RESET = "reset";
    }
  }

  export class Plot extends Component {
    protected _dataChanged = false;
    protected _key2PlotDatasetKey: D3.Map<Plots.PlotDatasetKey>;
    protected _datasetKeysInOrder: string[];

    protected _renderArea: D3.Selection;
    protected _attrBindings: D3.Map<_Projection>;
    protected _attrExtents: D3.Map<any[]>;
    private _extentsProvider: Scales.ExtentsProvider<any>;

    protected _animate: boolean = false;
    private _animators: {[animator: string]: Animators.Plot} = {};

    protected _animateOnNextRender = true;
    private _nextSeriesIndex: number;
    private _renderCallback: ScaleCallback<Scale<any, any>>;
    private _onDatasetUpdateCallback: DatasetCallback;

    protected _propertyExtents: D3.Map<any[]>;
    protected _propertyBindings: D3.Map<Plots.AccessorScaleBinding<any, any>>;

    /**
     * Constructs a Plot.
     *
     * Plots display data.
     *
     * @constructor
     */
    constructor() {
      super();
      this._clipPathEnabled = true;
      this.classed("plot", true);
      this._key2PlotDatasetKey = d3.map();
      this._attrBindings = d3.map();
      this._attrExtents = d3.map();
      this._extentsProvider = (scale: Scale<any, any>) => this._extentsForScale(scale);
      this._datasetKeysInOrder = [];
      this._nextSeriesIndex = 0;
      this._renderCallback = (scale) => this.render();
      this._onDatasetUpdateCallback = () => this._onDatasetUpdate();
      this._propertyBindings = d3.map();
      this._propertyExtents = d3.map();
      this._animators[Plots.Animator.MAIN] = new Animators.Base();
      this._animators[Plots.Animator.RESET] = new Animators.Null();
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
      this.datasets().forEach((dataset) => this._setupDatasetNodes(dataset));
    }

    public destroy() {
      super.destroy();
      this._scales().forEach((scale) => scale.offUpdate(this._renderCallback));
      this.datasets().forEach((dataset) => this.removeDataset(dataset));
    }

    /**
     * Adds a Dataset to the Plot.
     * 
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    public addDataset(dataset: Dataset) {
      var key = "_" + this._nextSeriesIndex++;
      if (this._key2PlotDatasetKey.has(key)) {
        this.removeDataset(dataset);
      };
      var drawer = this._getDrawer(dataset);
      var pdk = {drawer: drawer, dataset: dataset, key: key};
      this._datasetKeysInOrder.push(key);
      this._key2PlotDatasetKey.set(key, pdk);

      if (this._isSetup) {
        this._setupDatasetNodes(dataset);
      }

      dataset.onUpdate(this._onDatasetUpdateCallback);
      this._onDatasetUpdate();
      return this;
    }

    protected _setupDatasetNodes(dataset: Dataset) {
      var drawer = this._key2PlotDatasetKey.get(this._keyForDataset(dataset)).drawer;
      drawer.setup(this._renderArea.append("g"));
    }

    protected _getDrawer(dataset: Dataset): Drawers.AbstractDrawer {
      return new Drawers.AbstractDrawer(dataset);
    }

    protected _getAnimator(key: string): Animators.Plot {
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
     * Gets the AccessorScaleBinding for a particular attribute.
     * 
     * @param {string} attr
     */
    public attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
    /**
     * Sets a particular attribute to a constant value, or to the result of an Accessor.
     * 
     * @param {string} attr
     * @param {number|string|Accessor<number>|Accessor<string>} attrValue
     * @returns {Plot} The calling Plot.
     */
    public attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): Plot;
    /**
     * Sets a particular attribute to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the attribute values when autoDomain()-ing.
     * 
     * @param {string} attr
     * @param {A|Accessor<A>} attrValue
     * @param {Scale<A, number | string>} scale The Scale used to scale the attrValue.
     * @returns {Plot} The calling Plot.
     */
    public attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): Plot;
    public attr<A>(attr: string, attrValue?: number | string | Accessor<number> | Accessor<string> | A | Accessor<A>,
                   scale?: Scale<A, number | string>): any {
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
        var fn = scale ? (d: any, i: number, dataset: Dataset) => scale.scale(accessor(d, i, dataset)) : accessor;
        h[attr] = fn;
      });
      var propertyProjectors = this._propertyProjectors();
      Object.keys(propertyProjectors).forEach((key) => {
        if (h[key] == null) {
          h[key] = propertyProjectors[key];
        }
      });
      return h;
    }

    public renderImmediately() {
      if (this._isAnchored) {
        this._paint();
        this._dataChanged = false;
        this._animateOnNextRender = false;
      }
      return this;
    }

    /**
     * Enables or disables animation.
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
      this._scales().forEach((scale) => scale.addExtentsProvider(this._extentsProvider));
    }

    private _updateExtentsForAttr(attr: string) {
      // Filters should never be applied to attributes
      this._updateExtentsForKey(attr, this._attrBindings, this._attrExtents, null);
    }

    protected _updateExtentsForProperty(property: string) {
      this._updateExtentsForKey(property, this._propertyBindings, this._propertyExtents, this._filterForProperty(property));
    }

    protected _filterForProperty(property: string): Accessor<boolean> {
      return null;
    }

    private _updateExtentsForKey(key: string, bindings: D3.Map<Plots.AccessorScaleBinding<any, any>>,
        extents: D3.Map<any[]>, filter: Accessor<boolean>) {
      var accScaleBinding = bindings.get(key);
      if (accScaleBinding.accessor == null) { return; }
      extents.set(key, this._datasetKeysInOrder.map((key) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(key);
        var dataset = plotDatasetKey.dataset;
        return this._computeExtent(dataset, accScaleBinding, filter);
      }));
    }

    private _computeExtent(dataset: Dataset, accScaleBinding: Plots.AccessorScaleBinding<any, any>, filter: Accessor<boolean>): any[] {
      var accessor = accScaleBinding.accessor;
      var scale = accScaleBinding.scale;

      if (scale == null) {
        return [];
      }

      var data = dataset.data();
      if (filter != null) {
        data = data.filter((d, i) => filter(d, i, dataset));
      }
      var appliedAccessor = (d: any, i: number) => accessor(d, i, dataset);
      var mappedData = data.map(appliedAccessor);

      return scale.extentOfValues(mappedData);
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
     * Get the Animator associated with the specified Animator key.
     *
     * @return {Animators.Plot}
     */
    public animator(animatorKey: string): Animators.Plot;
    /**
     * Set the Animator associated with the specified Animator key.
     *
     * @param {string} animatorKey
     * @param {Animators.Plot} animator
     * @returns {Plot} The calling Plot.
     */
    public animator(animatorKey: string, animator: Animators.Plot): Plot;
    public animator(animatorKey: string, animator?: Animators.Plot): any {
      if (animator === undefined) {
        return this._animators[animatorKey];
      } else {
        this._animators[animatorKey] = animator;
        return this;
      }
    }

    /**
     * Removes a Dataset from the Plot.
     * 
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    public removeDataset(dataset: Dataset): Plot {
      var key = this._keyForDataset(dataset);
      if (key != null && this._key2PlotDatasetKey.has(key)) {
        var pdk = this._key2PlotDatasetKey.get(key);
        this._removeDatasetNodes(dataset);
        pdk.dataset.offUpdate(this._onDatasetUpdateCallback);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        this._key2PlotDatasetKey.remove(key);
        this._onDatasetUpdate();
      }
      return this;
    }

    protected _removeDatasetNodes(dataset: Dataset) {
      var drawer = this._key2PlotDatasetKey.get(this._keyForDataset(dataset)).drawer;
      drawer.remove();
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

    private _paint() {
      var drawSteps = this._generateDrawSteps();
      var dataToDraw = this._getDataToDraw();
      var drawers = this._getDrawersInOrder();

      var times = this._datasetKeysInOrder.map((k, i) =>
        drawers[i].draw(
          dataToDraw.get(k),
          drawSteps
        ));
      var maxTime = Utils.Methods.max(times, 0);
      this._additionalPaint(maxTime);
    }

    /**
     * Retrieves all of the Selections of this Plot for the specified Datasets.
     *
     * @param {Dataset[]} [datasets] The Datasets to retrieve the Selections for.
     *   If not provided, Selections will be retrieved for all Datasets on the Plot.
     * @param {boolean} exclude If set to true, returns the Selections for all Datasets except
     *   those specified in the datsets parameter.
     * @returns {D3.Selection}
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
        var dataset = plotDatasetKey.dataset;
        plotDatasetKey.dataset.data().forEach((datum: any, index: number) => {
          var pixelPoint = this._pixelPoint(datum, index, dataset);
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
      scale.removeExtentsProvider(this._extentsProvider);
    }

    protected _installScaleForKey(scale: Scale<any, any>, key: string) {
      scale.onUpdate(this._renderCallback);
      scale.addExtentsProvider(this._extentsProvider);
    }

    protected _propertyProjectors(): AttributeToProjector {
      return {};
    }

    protected static _scaledAccessor<D, R>(binding: Plots.AccessorScaleBinding<D, R>) {
      return binding.scale == null ?
               binding.accessor :
               (d: any, i: number, ds: Dataset) => binding.scale.scale(binding.accessor(d, i, ds));
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
      return { x: 0, y: 0 };
    }
  }
}
