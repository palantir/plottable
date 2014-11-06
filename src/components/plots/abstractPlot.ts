///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class AbstractPlot extends Component.AbstractComponent {
    public _dataChanged = false;
    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _datasetKeysInOrder: string[];

    public _renderArea: D3.Selection;
    public _projectors: { [attrToSet: string]: _Projector; } = {};

    public _animate: boolean = false;
    public _animators: Animator.PlotAnimatorMap = {};
    public _ANIMATION_DURATION = 250; // milliseconds
    public _animateOnNextRender = true;
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
      this._key2DatasetDrawerKey = d3.map();
      this._datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this._animateOnNextRender = true;
      this._dataChanged = true;
      this._updateScaleExtents();
    }

    public _setup() {
      super._setup();
      this._renderArea = this._content.append("g").classed("render-area", true);
      // HACKHACK on 591
      this._getDrawersInOrder().forEach((d) => d.setup(this._renderArea.append("g")));
    }

    public remove() {
      super.remove();
      this._datasetKeysInOrder.forEach((k) => this.removeDataset(k));
      // deregister from all scales
      var properties = Object.keys(this._projectors);
      properties.forEach((property) => {
        var projector = this._projectors[property];
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
     * @param {any[]|Dataset} dataset dataset to add.
     * @returns {Plot} The calling Plot.
     */
    public addDataset(key: string, dataset: Dataset): AbstractPlot;
    public addDataset(key: string, dataset: any[]): AbstractPlot;
    public addDataset(dataset: Dataset): AbstractPlot;
    public addDataset(dataset: any[]): AbstractPlot;
    public addDataset(keyOrDataset: any, dataset?: any): AbstractPlot {
      if (typeof(keyOrDataset) !== "string" && dataset !== undefined) {
        throw new Error("invalid input to addDataset");
      }
      if (typeof(keyOrDataset) === "string" && keyOrDataset[0] === "_") {
        _Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(keyOrDataset) === "string" ? keyOrDataset : "_" + this.nextSeriesIndex++;
      var data = typeof(keyOrDataset) !== "string" ? keyOrDataset : dataset;
      var dataset = (data instanceof Dataset) ? data : new Dataset(data);

      this._addDataset(key, dataset);
      return this;
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._key2DatasetDrawerKey.has(key)) {
        this.removeDataset(key);
      };
      var drawer = this._getDrawer(key);
      var ddk = {drawer: drawer, dataset: dataset, key: key};
      this._datasetKeysInOrder.push(key);
      this._key2DatasetDrawerKey.set(key, ddk);

      if (this._isSetup) {
        drawer.setup(this._renderArea.append("g"));
      }
      dataset.broadcaster.registerListener(this, () => this._onDatasetUpdate());
      this._onDatasetUpdate();
    }

    public _getDrawer(key: string): _Drawer.AbstractDrawer {
      return new _Drawer.AbstractDrawer(key);
    }

    public _getAnimator(key: string): Animator.PlotAnimator {
      if (this._animate && this._animateOnNextRender) {
        return this._animators[key] || new Animator.Null();
      } else {
        return new Animator.Null();
      }
    }

    public _onDatasetUpdate() {
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
      var currentProjection = this._projectors[attrToSet];
      var existingScale = currentProjection && currentProjection.scale;

      if (existingScale) {
        this._datasetKeysInOrder.forEach((key) => {
          existingScale._removeExtent(this._plottableID.toString() + "_" + key, attrToSet);
          existingScale.broadcaster.deregisterListener(this);
        });
      }

      if (scale) {
        scale.broadcaster.registerListener(this, () => this._render());
      }
      var activatedAccessor = _Util.Methods._applyAccessor(accessor, this);
      this._projectors[attrToSet] = {accessor: activatedAccessor, scale: scale, attribute: attrToSet};
      this._updateScaleExtent(attrToSet);
      this._render(); // queue a re-render upon changing projector
      return this;
    }

    public _generateAttrToProjector(): AttributeToProjector {
      var h: AttributeToProjector = {};
      d3.keys(this._projectors).forEach((a) => {
        var projector = this._projectors[a];
        var accessor = projector.accessor;
        var scale = projector.scale;
        var fn = scale ? (d: any, i: number) => scale.scale(accessor(d, i)) : accessor;
        h[a] = fn;
      });
      return h;
    }

    public _doRender() {
      if (this._isAnchored) {
        this.paint();
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
     * This function makes sure that all of the scales in this._projectors
     * have an extent that includes all the data that is projected onto them.
     */
    public _updateScaleExtents() {
      d3.keys(this._projectors).forEach((attr: string) => this._updateScaleExtent(attr));
    }

    public _updateScaleExtent(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale) {
        this._key2DatasetDrawerKey.forEach((key, ddk) => {
          var extent = ddk.dataset._getExtent(projector.accessor, projector.scale._typeCoercer);
          var scaleKey = this._plottableID.toString() + "_" + key;
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
     * Removes a dataset by string key
     *
     * @param {string} key The key of the dataset
     * @return {Plot} The calling Plot.
     */
    public removeDataset(key: string): AbstractPlot {
      if (key != null && this._key2DatasetDrawerKey.has(key)) {
        var ddk = this._key2DatasetDrawerKey.get(key);
        ddk.drawer.remove();

        var projectors = d3.values(this._projectors);
        var scaleKey = this._plottableID.toString() + "_" + key;
        projectors.forEach((p) => {
          if (p.scale != null) {
            p.scale._removeExtent(scaleKey, p.attribute);
          }
        });

        ddk.dataset.broadcaster.deregisterListener(this);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        this._key2DatasetDrawerKey.remove(key);
        this._onDatasetUpdate();
      }
      return this;
    }

    public datasets(): Dataset[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey.get(k).dataset);
    }

    public _getDrawersInOrder(): _Drawer.AbstractDrawer[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey.get(k).drawer);
    }

    public _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: new Animator.Null()}];
    }

    public _additionalPaint(time: number) {
      // no-op
    }

    public _getDataToDraw() {
      var datasets: D3.Map<any[]> = d3.map();
      this._datasetKeysInOrder.forEach((key: string) => {
        datasets.set(key, this._key2DatasetDrawerKey.get(key).dataset.data());
      });
      return datasets;
    }

    private paint() {
      var drawSteps = this._generateDrawSteps();
      var dataToDraw = this._getDataToDraw();
      var drawers = this._getDrawersInOrder();
      var times = this._datasetKeysInOrder.map((k, i) => drawers[i].draw(dataToDraw.get(k), drawSteps));
      var maxTime = _Util.Methods.max(times, 0);
      this._additionalPaint(maxTime);
    }
  }
}
}
