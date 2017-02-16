import * as d3 from "d3";

import * as Plots from "./";
import { LightweightPlotEntity, PlotEntity } from "../plots";

import { Null } from "../animators";
import { Animator } from "../animators/animator";

import * as Drawers from "../drawers";
import { IComponent } from "../components";
import * as Scales from "../scales";
import * as Utils from "../utils";
import { Map } from "../utils";

import { Dataset, DatasetCallback } from "../core/dataset";
import { Accessor, AttributeToProjector, Bounds, Point } from "../core/interfaces";
import { IDrawer } from "../drawers/drawer";
import { Scale, ScaleCallback } from "../scales/scale";

export interface IPlot {
 /**
  * Adds a Dataset to the Plot.
  *
  * @param {Dataset} dataset
  * @returns {Plot} The calling Plot.
  */
  addDataset(dataset: Dataset): this;
  /**
   * Returns whether the plot will be animated.
   */
  animated(): boolean;
  /**
   * Enables or disables animation.
   */
  animated(willAnimate: boolean): this;
  animated(willAnimate?: boolean): any;
   /**
   * Get the Animator associated with the specified Animator key.
   *
   * @return {Animator}
   */
  animator(animatorKey: string): Animator;
  /**
   * Set the Animator associated with the specified Animator key.
   *
   * @param {string} animatorKey
   * @param {Animator} animator
   * @returns {Plot} The calling Plot.
   */
  animator(animatorKey: string, animator: Animator): this;
  animator(animatorKey: string, animator?: Animator): any;
  /**
   * Gets the AccessorScaleBinding for a particular attribute.
   *
   * @param {string} attr
   */
  attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
  /**
   * Sets a particular attribute to a constant value or the result of an Accessor.
   *
   * @param {string} attr
   * @param {number|string|Accessor<number>|Accessor<string>} attrValue
   * @returns {Plot} The calling Plot.
   */
  attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): this;
  /**
   * Sets a particular attribute to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the attribute values when autoDomain()-ing.
   *
   * @param {string} attr
   * @param {A|Accessor<A>} attrValue
   * @param {Scale<A, number | string>} scale The Scale used to scale the attrValue.
   * @returns {Plot} The calling Plot.
   */
  attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): this;
  attr<A>(attr: string, attrValue?: number | string | Accessor<number> | Accessor<string> | A | Accessor<A>,
                 scale?: Scale<A, number | string>): any
  datasets(): Dataset[];
  datasets(datasets: Dataset[]): this;
  datasets(datasets?: Dataset[]): any;
  destroy(): void;
 /**
  * Gets the Entities associated with the specified Datasets.
  *
  * @param {Dataset[]} datasets The Datasets to retrieve the Entities for.
  *   If not provided, returns defaults to all Datasets on the Plot.
  * @return {Plots.PlotEntity[]}
  */
  entities(datasets?: Dataset[]): PlotEntity[];
  /**
   * Gets the PlotEntities at a particular Point.
   *
   * Each plot type determines how to locate entities at or near the query
   * point. For example, line and area charts will return the nearest entity,
   * but bar charts will only return the entities that fully contain the query
   * point.
   *
   * @param {Point} point The point to query.
   * @returns {PlotEntity[]} The PlotEntities at the particular point
   */
  entitiesAt(point: Point): PlotEntity[];
  /**
   * Returns the {Plots.PlotEntity} nearest to the query point,
   * or undefined if no {Plots.PlotEntity} can be found.
   *
   * @param {Point} queryPoint
   * @param {bounds} Bounds The bounding box within which to search. By default, bounds is the bounds of
   * the chart, relative to the parent.
   * @returns {Plots.PlotEntity} The nearest PlotEntity, or undefined if no {Plots.PlotEntity} can be found.
   */
  entityNearest(queryPoint: Point, bounds: Bounds): PlotEntity;
  /**
   * Removes a Dataset from the Plot.
   *
   * @param {Dataset} dataset
   * @returns {Plot} The calling Plot.
   */
  removeDataset(dataset: Dataset): this;
  renderImmediately(): this;
}

export type DrawerFactory = (dataset: Dataset) => IDrawer;
export type RenderAreaAccessor = (dataset: Dataset) => d3.Selection<void>;

export type EntityAdapter<P extends PlotEntity> = (entity: LightweightPlotEntity, position: Point) => P;

export class BasePlot<P extends PlotEntity> implements IPlot {
  private _animate = false;
  private _animators: {[animator: string]: Animator} = {};
  private _attrBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
  private _attrExtents: d3.Map<any[]>;
  /**
   * _cachedEntityStore is a cache of all the entities in the plot. It, at times
   * may be undefined and shouldn't be accessed directly. Instead, use _getEntityStore
   * to access the entity store.
   */
  private _cachedEntityStore: Utils.EntityStore<Plots.LightweightPlotEntity>;
  private _dataChanged = false;
  private _datasetToDrawer: Utils.Map<Dataset, IDrawer>;
  private _drawerFactory: DrawerFactory;
  private _handleDatasetUpdate: DatasetCallback;
  private _includedValuesProvider: Scales.IncludedValuesProvider<any>;
  private _onDatasetRemovedCallback: DatasetCallback;

  protected _component: IComponent<any>;
  protected _entityAdapter: EntityAdapter<P>;
  protected _onDatasetUpdateCallback: DatasetCallback;
  protected _propertyBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
  protected _propertyExtents: d3.Map<any[]>;
  protected _renderCallback: ScaleCallback<Scale<any, any>>;
  protected _renderArea: RenderAreaAccessor;

  constructor(drawerFactory: DrawerFactory, entityAdapter: EntityAdapter<P>, component: IComponent<any>) {
    this._attrBindings = d3.map<Plots.AccessorScaleBinding<any, any>>();
    this._attrExtents = d3.map<any[]>();
    this._component = component;
    this._drawerFactory = drawerFactory;
    this._datasetToDrawer = new Utils.Map<Dataset, IDrawer>();
    this._entityAdapter = entityAdapter;
    this._propertyBindings = d3.map<Plots.AccessorScaleBinding<any, any>>();
    this._propertyExtents = d3.map<any[]>();

    this._includedValuesProvider = (scale: Scale<any, any>) => this._includedValuesForScale(scale);
    this._handleDatasetUpdate = (dataset?: Dataset) => this._onDatasetUpdate(dataset);
  }

  public addDataset(dataset: Dataset) {
    this._addDataset(dataset);
    this._handleDatasetUpdate(dataset);
    return this;
  }

  public animated(): boolean;
  public animated(willAnimate: boolean): this;
  public animated(willAnimate?: boolean): any {
    if (willAnimate == null) {
      return this._animate;
    }

    this._animate = willAnimate;
    return this;
  }
 /**
   * Get the Animator associated with the specified Animator key.
   *
   * @return {Animator}
   */
  public animator(animatorKey: string): Animator;
  /**
   * Set the Animator associated with the specified Animator key.
   *
   * @param {string} animatorKey
   * @param {Animator} animator
   * @returns {Plot} The calling Plot.
   */
  public animator(animatorKey: string, animator: Animator): this;
  public animator(animatorKey: string, animator?: Animator): any {
    if (animator === undefined) {
      return this._animators[animatorKey];
    } else {
      this._animators[animatorKey] = animator;
      return this;
    }
  }

  public attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
  public attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): this;
  public attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): this;
  public attr<A>(attr: string, attrValue?: number | string | Accessor<number> | Accessor<string> | A | Accessor<A>,
                 scale?: Scale<A, number | string>): any {
    if (attrValue == null) {
      return this._attrBindings.get(attr);
    }

    this._bindAttr(attr, attrValue, scale);

    if (this._renderCallback != null) {
      this._renderCallback(scale);
    }

    return this;
  }

  public clearDataCache() {
    this._dataChanged = true;
    this._cachedEntityStore = undefined;
  }

  public renderArea(): d3.Selection<void>;
  public renderArea(renderArea: d3.Selection<void> | RenderAreaAccessor): this;
  public renderArea(renderArea?: d3.Selection<void> | RenderAreaAccessor): any {
    if (renderArea === undefined) {
        return this._renderArea;
    }

    if (typeof renderArea === "function") {
      this._renderArea = renderArea;
    } else {
      this._renderArea = () => renderArea;
    }

    this.datasets().forEach((dataset) => {
      const drawer = this.drawer(dataset);
      const existingRenderARea = drawer.renderArea();

      // remove any existing render area before adding a new one
      // so that sub classes can define custom render areas if they choose
      if (existingRenderARea != null) {
        existingRenderARea.remove();
      }

      this.drawer(dataset).renderArea(this._renderArea(dataset));
    });

    return this;
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    let currentDatasets: Dataset[] = [];
    this._getDatasetToDrawer().forEach((drawer, dataset) => currentDatasets.push(dataset));
    if (datasets == null) {
       return currentDatasets;
    }

    currentDatasets.forEach((dataset) => this._removeDataset(dataset));
    datasets.forEach((dataset) => this._addDataset(dataset));
    this._handleDatasetUpdate(null);
    return this;
  }

  public destroy() {
    this._scales().forEach((scale) => scale.offUpdate(this._renderCallback));
    this.datasets([]);
  }

  public drawer(dataset: Dataset) {
    return this._getDatasetToDrawer().get(dataset);
  }

  /**
   * Gets the Entities associated with the specified Datasets.
   *
   * @param {Dataset[]} datasets The Datasets to retrieve the Entities for.
   *   If not provided, returns defaults to all Datasets on the Plot.
   * @return {Plots.PlotEntity[]}
   */
  public entities(datasets?: Dataset[]): P[] {

    return this._getEntityStore(datasets).map((entity) => {
      const point = this._pixelPoint(entity.datum, entity.index, entity.dataset);
      return this._entityAdapter(entity, point);
    });
  }

  public entitiesAt(point: Point): P[] {
    throw new Error("plots must implement entitiesAt");
  }

  public entityNearest(queryPoint: Point, bounds: Bounds): P {
    const nearest = this._getEntityStore().entityNearest(queryPoint, (entity: LightweightPlotEntity) => {
      return this._entityVisibleOnPlot(entity, bounds);
    });

    if (nearest === undefined) {
      return undefined;
    }

    const point = this._pixelPoint(nearest.datum, nearest.index, nearest.dataset);
    return this._entityAdapter(nearest, point);
  }

  public onDatasetRemoved(_onDatasetRemoved: DatasetCallback) {
    this._onDatasetRemovedCallback = _onDatasetRemoved;
  }

  public onDatasetUpdate(_onDatasetUpdateCallback: DatasetCallback) {
    this._onDatasetUpdateCallback = _onDatasetUpdateCallback
  }

  protected _onDatasetUpdate(dataset?: Dataset) {
    this.clearDataCache();
    this._onDatasetUpdateCallback(dataset);
  }

  /**
   * Removes a Dataset from the Plot.
   *
   * @param {Dataset} dataset
   * @returns {Plot} The calling Plot.
   */
  public removeDataset(dataset: Dataset) {
    this._removeDataset(dataset)
    this._handleDatasetUpdate(dataset);
    return this;
  }

  public renderImmediately() {
    let drawSteps = this._generateDrawSteps();
    let dataToDraw = this._getDataToDraw();
    let drawers = this._getDrawersInOrder();
    this.datasets().forEach((ds, i) => drawers[i].draw(dataToDraw.get(ds), drawSteps));

    let times = this.datasets().map((ds, i) => drawers[i].totalDrawTime(dataToDraw.get(ds), drawSteps));
    let maxTime = Utils.Math.max(times, 0);
    this._additionalPaint(maxTime);

    this._dataChanged = false;

    return this;
  }

  public renderCallback(_renderCallback: ScaleCallback<Scale<any, any>>) {
    this._renderCallback = _renderCallback;
  }

 /**
  * Updates the extents associated with each attribute, then autodomains all scales the Plot uses.
  */
  public updateExtents() {
    this._attrBindings.forEach((attr) => this._updateExtentsForAttr(attr));
    this._propertyExtents.forEach((property) => this._updateExtentsForProperty(property));
    this._scales().forEach((scale) => scale.addIncludedValuesProvider(this._includedValuesProvider));
  }

  protected _addDataset(dataset: Dataset) {
    this._removeDataset(dataset);
    let drawer = this._drawerFactory(dataset);
    if (this._renderArea != null) {
      // may not be initiated yet, we'll initiate everything later
      drawer.renderArea(this._renderArea(dataset));
    }

    this._getDatasetToDrawer().set(dataset, drawer);
    this.clearDataCache();
    dataset.onUpdate(this._handleDatasetUpdate);
  }

  protected _animateOnNextRender() {
    return this._animate && this._dataChanged;
  }

  protected _additionalPaint(time: number) {
    // no-op
  }

  protected _bindProperty(property: string, value: any, scale: Scale<any, any>) {
    let binding = this._propertyBindings.get(property);
    let oldScale = binding != null ? binding.scale : null;

    this._propertyBindings.set(property, { accessor: d3.functor(value), scale: scale });
    this._updateExtentsForProperty(property);

    if (oldScale != null) {
      this._uninstallScaleForKey(oldScale, property);
    }
    if (scale != null) {
      this._installScaleForKey(scale, property);
    }
  }

 /**
   * _buildLightweightPlotEntities constucts {LightweightPlotEntity[]} from
   * all the entities in the plot
   * @param {Dataset[]} [datasets] - datasets comprising this plot
   */
  protected _buildLightweightPlotEntities(datasets: Dataset[]) {
    const lightweightPlotEntities: LightweightPlotEntity[] = [];
    datasets.forEach((dataset: Dataset, datasetIndex: number) => {
      let drawer = this.drawer(dataset);
      let validDatumIndex = 0;

      dataset.data().forEach((datum: any, datumIndex: number) => {
        let position = this._pixelPoint(datum, datumIndex, dataset);
        if (Utils.Math.isNaN(position.x) || Utils.Math.isNaN(position.y)) {
          return;
        }

        lightweightPlotEntities.push({
          datum,
          position,
          index: datumIndex,
          dataset,
          datasetIndex,
          component: this._component,
          drawer,
          validDatumIndex,
        });
        validDatumIndex++;
      });
    });

    return lightweightPlotEntities;
  }

  protected _entityVisibleOnPlot(entity: Plots.PlotEntity | Plots.LightweightPlotEntity, chartBounds: Bounds) {
    return !(entity.position.x < chartBounds.topLeft.x || entity.position.y < chartBounds.topLeft.y ||
    entity.position.x > chartBounds.bottomRight.x || entity.position.y > chartBounds.bottomRight.y);
  }

  /**
   * Override in subclass to add special extents, such as included values
   */
  protected _extentsForProperty(property: string) {
    return this._propertyExtents.get(property);
  }

  protected _generateAttrToProjector(): AttributeToProjector {
    let h: AttributeToProjector = {};
    this._attrBindings.forEach((attr, binding) => {
      let accessor = binding.accessor;
      let scale = binding.scale;
      let fn = scale ? (d: any, i: number, dataset: Dataset) => scale.scale(accessor(d, i, dataset)) : accessor;
      h[attr] = fn;
    });
    let propertyProjectors = this._propertyProjectors();
    Object.keys(propertyProjectors).forEach((key) => {
      if (h[key] == null) {
        h[key] = propertyProjectors[key];
      }
    });
    return h;
  }

  protected _getAnimator(key: string): Animator {
    if (this._animateOnNextRender()) {
      return this._animators[key] || new Null();
    } else {
      return new Null();
    }
  }

  protected _getDatasetToDrawer() {
    return this._datasetToDrawer;
  }

  protected _getDrawersInOrder(): IDrawer[] {
    return this.datasets().map((dataset) => this.drawer(dataset));
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw: Utils.Map<Dataset, any[]> = new Utils.Map<Dataset, any[]>();
    this.datasets().forEach((dataset) => dataToDraw.set(dataset, dataset.data()));
    return dataToDraw;
  }

  /**
   * _getEntityStore returns the store of all Entities associated with the specified dataset
   *
   * @param {Dataset[]} [datasets] - The datasets with which to construct the store. If no datasets
   * are specified all datasets will be used.
   */
  protected _getEntityStore(datasets?: Dataset[]): Utils.EntityStore<Plots.LightweightPlotEntity> {
    if (datasets !== undefined) {
      const EntityStore = new Utils.EntityArray<Plots.LightweightPlotEntity>();
      this._buildLightweightPlotEntities(datasets).forEach((entity: Plots.LightweightPlotEntity) => {
        EntityStore.add(entity);
      });

      return EntityStore;
    } else if (this._cachedEntityStore === undefined) {
      this._cachedEntityStore = new Utils.EntityArray<Plots.LightweightPlotEntity>();
      this._buildLightweightPlotEntities(this.datasets()).forEach((entity: Plots.LightweightPlotEntity) => {
        this._cachedEntityStore.add(entity);
      });
    }

    return this._cachedEntityStore;
  }

  protected _filterForProperty(property: string): Accessor<boolean> {
    return null;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    return [{ attrToProjector: this._generateAttrToProjector(), animator: new Null() }];
  }

  protected _installScaleForKey(scale: Scale<any, any>, key: string) {
    scale.onUpdate(this._renderCallback);
    scale.addIncludedValuesProvider(this._includedValuesProvider);
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    return { x: 0, y: 0 };
  }

  protected _propertyProjectors(): AttributeToProjector {
     return {};
  }

  protected _removeDataset(dataset: Dataset) {
    if (this.datasets().indexOf(dataset) === -1) {
      return this;
    }

    dataset.offUpdate(this._handleDatasetUpdate);
    const drawer = this.drawer(dataset);
    drawer.remove();
    this._getDatasetToDrawer().delete(dataset);

    this.clearDataCache();

    this._onDatasetRemovedCallback(dataset);
    return this;
  }

  protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
    scale.offUpdate(this._renderCallback);
    scale.removeIncludedValuesProvider(this._includedValuesProvider);
  }


  protected _updateExtentsForProperty(property: string) {
    this._updateExtentsForKey(property, this._propertyBindings, this._propertyExtents, this._filterForProperty(property));
  }

  private _bindAttr(attr: string, value: any, scale: Scale<any, any>) {
    let binding = this._attrBindings.get(attr);
    let oldScale = binding != null ? binding.scale : null;

    this._attrBindings.set(attr, { accessor: d3.functor(value), scale: scale });
    this._updateExtentsForAttr(attr);

    if (oldScale != null) {
      this._uninstallScaleForKey(oldScale, attr);
    }

    if (scale != null) {
      this._installScaleForKey(scale, attr);
    }
  }

  private _computeExtent(dataset: Dataset, accScaleBinding: Plots.AccessorScaleBinding<any, any>, filter: Accessor<boolean>): any[] {
    let accessor = accScaleBinding.accessor;
    let scale = accScaleBinding.scale;

    if (scale == null) {
      return [];
    }

    let data = dataset.data();
    if (filter != null) {
      data = data.filter((d, i) => filter(d, i, dataset));
    }
    let appliedAccessor = (d: any, i: number) => accessor(d, i, dataset);
    let mappedData = data.map(appliedAccessor);

    return scale.extentOfValues(mappedData);
  }

  private _includedValuesForScale<D>(scale: Scale<D, any>): D[] {
    let includedValues: D[] = [];
    this._attrBindings.forEach((attr, binding) => {
      if (binding.scale === scale) {
        let extents = this._attrExtents.get(attr);
        if (extents != null) {
          includedValues = includedValues.concat(<D[]> d3.merge(extents));
        }
      }
    });

    this._propertyBindings.forEach((property, binding) => {
      if (binding.scale === scale) {
        let extents = this._extentsForProperty(property);
        if (extents != null) {
          includedValues = includedValues.concat(<D[]> d3.merge(extents));
        }
      }
    });

    return includedValues;
  }

 /**
  * @returns {Scale[]} A unique array of all scales currently used by the Plot.
  */
  private _scales() {
    let scales: Scale<any, any>[] = [];
    this._attrBindings.forEach((attr, binding) => {
      let scale = binding.scale;
      if (scale != null && scales.indexOf(scale) === -1) {
        scales.push(scale);
      }
    });

    this._propertyBindings.forEach((property, binding) => {
      let scale = binding.scale;
      if (scale != null && scales.indexOf(scale) === -1) {
        scales.push(scale);
      }
    });

    return scales;
  }

  private _updateExtentsForAttr(attr: string) {
    // Filters should never be applied to attributes
    this._updateExtentsForKey(attr, this._attrBindings, this._attrExtents, null);
  }

  private _updateExtentsForKey(key: string, bindings: d3.Map<Plots.AccessorScaleBinding<any, any>>,
                                extents: d3.Map<any[]>, filter: Accessor<boolean>) {
    let accScaleBinding = bindings.get(key);
    if (accScaleBinding == null || accScaleBinding.accessor == null) {
      return;
    }

     extents.set(key, this.datasets().map((dataset) => this._computeExtent(dataset, accScaleBinding, filter)));
  }

  protected static _scaledAccessor<D, R>(binding: Plots.AccessorScaleBinding<D, R>) {
    return binding.scale == null ?
      binding.accessor :
      (d: any, i: number, ds: Dataset) => binding.scale.scale(binding.accessor(d, i, ds));
  }
}
