///<reference path="../../reference.ts" />

module Plottable {

  export module Plots {

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
    protected _datasetToDrawer: Utils.Map<Dataset, Drawers.AbstractDrawer>;

    protected _renderArea: D3.Selection;
    protected _attrBindings: D3.Map<_Projection>;
    protected _attrExtents: D3.Map<any[]>;
    private _extentsProvider: Scales.ExtentsProvider<any>;

    protected _animate: boolean = false;
    private _animators: {[animator: string]: Animators.Plot} = {};

    protected _animateOnNextRender = true;
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
      this._datasetToDrawer = new Utils.Map<Dataset, Drawers.AbstractDrawer>();
      this._attrBindings = d3.map();
      this._attrExtents = d3.map();
      this._extentsProvider = (scale: Scale<any, any>) => this._extentsForScale(scale);
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
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    public addDataset(dataset: Dataset) {
      if (this.datasets().indexOf(dataset) > -1) {
        this.removeDataset(dataset);
      };
      var drawer = this._getDrawer(dataset);
      this._datasetToDrawer.set(dataset, drawer);

      if (this._isSetup) {
        this._setupDatasetNodes(dataset);
      }

      dataset.onUpdate(this._onDatasetUpdateCallback);
      this._onDatasetUpdate();
      return this;
    }

    protected _setupDatasetNodes(dataset: Dataset) {
      var drawer = this._datasetToDrawer.get(dataset);
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

    public attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
    public attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): Plot;
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
      extents.set(key, this.datasets().map((dataset) => this._computeExtent(dataset, accScaleBinding, filter)));
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
     * Get the animator associated with the specified Animator key.
     *
     * @return {PlotAnimator} The Animator for the specified key.
     */
    public animator(animatorKey: string): Animators.Plot;
    /**
     * Set the animator associated with the specified Animator key.
     *
     * @param {string} animatorKey The key for the Animator.
     * @param {PlotAnimator} animator An Animator to be assigned to
     * the specified key.
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
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    public removeDataset(dataset: Dataset): Plot {
      if (this.datasets().indexOf(dataset) > -1) {
        this._removeDatasetNodes(dataset);
        dataset.offUpdate(this._onDatasetUpdateCallback);
        this._datasetToDrawer.delete(dataset);
        this._onDatasetUpdate();
      }
      return this;
    }

    protected _removeDatasetNodes(dataset: Dataset) {
      var drawer = this._datasetToDrawer.get(dataset);
      drawer.remove();
    }

    public datasets(): Dataset[];
    public datasets(datasets: Dataset[]): Plot;
    public datasets(datasets?: Dataset[]): any {
      var currentDatasets = this._datasetToDrawer.keys().map((dataset) => dataset);
      if (datasets == null) {
        return currentDatasets;
      }
      currentDatasets.forEach((dataset) => this.removeDataset(dataset));
      datasets.forEach((dataset) => this.addDataset(dataset));
      return this;
    }

    protected _getDrawersInOrder(): Drawers.AbstractDrawer[] {
      return this.datasets().map((dataset) => this._datasetToDrawer.get(dataset));
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: new Animators.Null()}];
    }

    protected _additionalPaint(time: number) {
      // no-op
    }

    protected _getDataToDraw() {
      var datasets: Utils.Map<Dataset, any[]> = new Utils.Map<Dataset, any[]>();
      this.datasets().forEach((dataset) => datasets.set(dataset, dataset.data()));
      return datasets;
    }

    private _paint() {
      var drawSteps = this._generateDrawSteps();
      var dataToDraw = this._getDataToDraw();
      var drawers = this._getDrawersInOrder();

      var times = this.datasets().map((ds, i) =>
        drawers[i].draw(
          dataToDraw.get(ds),
          drawSteps
        ));
      var maxTime = Utils.Methods.max(times, 0);
      this._additionalPaint(maxTime);
    }

    /**
     * Retrieves all of the Selections of this Plot for the specified Datasets.
     *
     * @param {Dataset[]} datasets The Datasets to retrieve the selections from.
     * If not provided, all selections will be retrieved.
     * @param {boolean} exclude If set to true, all Datasets will be queried excluding the Datasets referenced
     * in the previous argument (default = false).
     * @returns {D3.Selection} The retrieved Selections.
     */
    public getAllSelections(datasets = this.datasets(), exclude = false): D3.Selection {

      if (exclude) {
        datasets = this.datasets().filter((dataset) => datasets.indexOf(dataset) === -1);
      }

      var allSelections: EventTarget[] = [];

      datasets.forEach((dataset) => {
        var drawer = this._datasetToDrawer.get(dataset);
        if (drawer == null) { return; }
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

      datasets.forEach((dataset) => {
        var drawer = this._datasetToDrawer.get(dataset);
        if (drawer == null) { return; }
        dataset.data().forEach((datum: any, index: number) => {
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
