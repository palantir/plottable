/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Animators from "../animators";
import { Animator } from "../animators/animator";
import { Component } from "../components/component";
import { Dataset, DatasetCallback } from "../core/dataset";
import { Accessor, AttributeToProjector, Bounds, Point, SimpleSelection } from "../core/interfaces";
import * as Drawers from "../drawers";
import { Drawer } from "../drawers/drawer";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import { coerceExternalD3 } from "../utils/coerceD3";
import { makeEnum } from "../utils/makeEnum";
import * as Plots from "./commons";

export const Renderer = makeEnum(["svg", "canvas"]);
export type Renderer = keyof typeof Renderer;

export class Plot extends Component {
  protected static _ANIMATION_MAX_DURATION = 600;

  /**
   * _cachedEntityStore is a cache of all the entities in the plot. It, at times
   * may be undefined and shouldn't be accessed directly. Instead, use _getEntityStore
   * to access the entity store.
   */
  private _cachedEntityStore: Utils.EntityStore<Plots.LightweightPlotEntity>;
  /**
   * Whether the backing datasets have changed since this plot's last render.
   */
  private _dataChanged = false;
  /**
   * Stores the Drawer for each dataset attached to this plot.
   */
  private _datasetToDrawer: Utils.Map<Dataset, Drawer>;

  /**
   * The _renderArea is the main SVG drawing area upon which this plot should draw to.
   */
  protected _renderArea: SimpleSelection<void>;
  /**
   * Mapping from attribute names to the AccessorScale that defines that attribute.
   */
  private _attrBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
  /**
   * Mapping from attribute names to the extents ([min, max]) values that that attribute takes on.
   */
  private _attrExtents: d3.Map<any[]>;
  /**
   * Callback that we register onto Scales that get bound to this Plot.
   *
   * TODO make this an arrow method instead of re-defining it in constructor()
   */
  private _includedValuesProvider: Scales.IncludedValuesProvider<any>;

  private _animate = false;
  /**
   * The Animators for this plot. Each plot exposes a set of "animator key" strings that
   * define how different parts of that particular Plot animates. For instance, Rectangle
   * Plots have a "rectangles" animator key which controls how the <rect>s are animated.
   * @see animator()
   *
   * There are two common animators that most Plots respect: "main" and "reset". In general,
   * Plots draw in two steps: first they "reset" their visual elements (e.g. scatter plots set
   * all the dots to size 0), and then they do the "main" animation into the correct visualization
   * (e.g. scatter plot dots grow to their specified size).
   */
  private _animators: {[animator: string]: Animator} = {};

  /**
   * Callback that triggers when any scale that's bound to this plot Updates.
   *
   * TODO make this an arrow method instead of re-defining it in constructor()
   */
  protected _renderCallback: ScaleCallback<Scale<any, any>>;
  /**
   * Callback that triggers when any Dataset that's bound to this plot Updates.
   *
   * TODO make this an arrow method insteade of re-defining it in constructor()
   */
  private _onDatasetUpdateCallback: DatasetCallback;

  /**
   * Mapping from property names to the AccessorScale that defines that property.
   *
   * e.g. Line may register an "x" -> binding and a "y" -> binding;
   * Rectangle would register "x", "y", "x2", and "y2"
   *
   * Only subclasses control how they register properties, while attrs can be registered by the user.
   * By default, only attrs are passed to the _generateDrawStep's attrToProjector; properties are not.
   */
  protected _propertyBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
  /**
   * Mapping from property names to the extents ([min, max]) values that that property takes on.
   */
  protected _propertyExtents: d3.Map<any[]>;

  /**
   * The canvas element that this Plot will render to if using the canvas renderer, or null if not using the SVG
   * renderer. The node may be parent-less (which means that the plot isn't setup yet but is still using the canvas
   * renderer).
   */
  protected _canvas: d3.Selection<HTMLCanvasElement, any, any, any>;

  /**
   * A Plot draws some visualization of the inputted Datasets.
   *
   * @constructor
   */
  constructor() {
    super();
    this._overflowHidden = true;
    this.addClass("plot");
    this._datasetToDrawer = new Utils.Map<Dataset, Drawer>();
    this._attrBindings = d3.map<Plots.AccessorScaleBinding<any, any>>();
    this._attrExtents = d3.map<any[]>();
    this._includedValuesProvider = (scale: Scale<any, any>) => this._includedValuesForScale(scale);
    this._renderCallback = (scale) => this.render();
    this._onDatasetUpdateCallback = () => this._onDatasetUpdate();
    this._propertyBindings = d3.map<Plots.AccessorScaleBinding<any, any>>();
    this._propertyExtents = d3.map<any[]>();
    const mainAnimator = new Animators.Easing().maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
    this.animator(Plots.Animator.MAIN, mainAnimator);
    this.animator(Plots.Animator.RESET, new Animators.Null());
  }

  public anchor(selection: d3.Selection<HTMLElement, any, any, any>) {
    selection = coerceExternalD3(selection);
    super.anchor(selection);
    this._dataChanged = true;
    this._cachedEntityStore = undefined;
    this._updateExtents();
    return this;
  }

  protected _setup() {
    if (this._isSetup) {
      return;
    }
    super._setup();
    if (this._canvas != null) {
      this._appendCanvasNode();
    }
    this._renderArea = this.content().append("g").classed("render-area", true);
    this.datasets().forEach((dataset) => this._createNodesForDataset(dataset));
  }

  private _appendCanvasNode() {
    let canvasContainer = this.element().select<HTMLDivElement>(".plot-canvas-container");
    if (canvasContainer.empty()) {
      canvasContainer = this.element().append<HTMLDivElement>("div").classed("plot-canvas-container", true);
      canvasContainer.node().appendChild(this._canvas.node());
    }
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    if (this._canvas != null) {
      // update canvas width/height; this will also clear the canvas of any drawn elements so we should
      // be sure not to computeLayout() without a render() in the future.
      this._canvas.attr("width", this.width());
      this._canvas.attr("height", this.height());
    }
    return this;
  }

  public destroy() {
    super.destroy();
    this._scales().forEach((scale) => scale.offUpdate(this._renderCallback));
    this.datasets([]);
  }

  protected _createNodesForDataset(dataset: Dataset) {
    const drawer = this._datasetToDrawer.get(dataset);
    if (this.renderer() === "svg") {
      drawer.renderArea(this._renderArea.append("g"));
    } else {
      drawer.canvas(this._canvas);
    }
    return drawer;
  }

  protected _createDrawer(dataset: Dataset): Drawer {
    return new Drawer(dataset);
  }

  protected _getAnimator(key: string): Animator {
    if (this._animateOnNextRender()) {
      return this._animators[key] || new Animators.Null();
    } else {
      return new Animators.Null();
    }
  }

  protected _onDatasetUpdate() {
    this._updateExtents();
    this._dataChanged = true;
    this._cachedEntityStore = undefined;
    this.render();
  }

  /**
   * Gets the AccessorScaleBinding for a particular attribute.
   *
   * @param {string} attr
   */
  public attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
  /**
   * Sets a particular attribute to a constant value or the result of an Accessor.
   *
   * @param {string} attr
   * @param {number|string|Accessor<number>|Accessor<string>} attrValue
   * @returns {Plot} The calling Plot.
   */
  public attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): this;
  /**
   * Sets a particular attribute to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the attribute values when autoDomain()-ing.
   *
   * @param {string} attr
   * @param {A|Accessor<A>} attrValue
   * @param {Scale<A, number | string>} scale The Scale used to scale the attrValue.
   * @returns {Plot} The calling Plot.
   */
  public attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): this;
  public attr<A>(attr: string, attrValue?: number | string | Accessor<number> | Accessor<string> | A | Accessor<A>,
                 scale?: Scale<A, number | string>): any {
    if (attrValue == null) {
      return this._attrBindings.get(attr);
    }
    this._bindAttr(attr, attrValue, scale);
    this.render(); // queue a re-render upon changing projector
    return this;
  }

  protected _bindProperty(property: string, valueOrFn: any | Function, scale: Scale<any, any>) {
    const binding = this._propertyBindings.get(property);
    const oldScale = binding != null ? binding.scale : null;

    const accessor = typeof valueOrFn === "function" ? valueOrFn : () => valueOrFn;
    this._propertyBindings.set(property, { accessor, scale });
    this._updateExtentsForProperty(property);

    if (oldScale != null) {
      this._uninstallScaleForKey(oldScale, property);
    }
    if (scale != null) {
      this._installScaleForKey(scale, property);
    }
  }

  private _bindAttr(attr: string, valueOrFn: any | Function, scale: Scale<any, any>) {
    const binding = this._attrBindings.get(attr);
    const oldScale = binding != null ? binding.scale : null;

    const accessor = typeof valueOrFn === "function" ? valueOrFn : () => valueOrFn;
    this._attrBindings.set(attr, { accessor, scale });
    this._updateExtentsForAttr(attr);

    if (oldScale != null) {
      this._uninstallScaleForKey(oldScale, attr);
    }
    if (scale != null) {
      this._installScaleForKey(scale, attr);
    }
  }

  protected _generateAttrToProjector(): AttributeToProjector {
    const h: AttributeToProjector = {};
    this._attrBindings.each((binding, attr) => {
      const accessor = binding.accessor;
      const scale = binding.scale;
      const fn = scale ? (d: any, i: number, dataset: Dataset) => scale.scale(accessor(d, i, dataset)) : accessor;
      h[attr] = fn;
    });
    const propertyProjectors = this._propertyProjectors();
    Object.keys(propertyProjectors).forEach((key) => {
      if (h[key] == null) {
        h[key] = propertyProjectors[key];
      }
    });
    return h;
  }

  public renderImmediately() {
    super.renderImmediately();
    if (this._isAnchored) {
      this._paint();
      this._dataChanged = false;
    }
    return this;
  }

  /**
   * Returns whether the plot will be animated.
   */
  public animated(): boolean;
  /**
   * Enables or disables animation.
   */
  public animated(willAnimate: boolean): this;
  public animated(willAnimate?: boolean): any {
    if (willAnimate == null) {
      return this._animate;
    }

    this._animate = willAnimate;
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
    const scales: Scale<any, any>[] = [];
    this._attrBindings.each((binding, attr) => {
      const scale = binding.scale;
      if (scale != null && scales.indexOf(scale) === -1) {
        scales.push(scale);
      }
    });
    this._propertyBindings.each((binding, property) => {
      const scale = binding.scale;
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
    this._attrBindings.each((_, attr) => this._updateExtentsForAttr(attr));
    this._propertyExtents.each((_, property) => this._updateExtentsForProperty(property));
    this._scales().forEach((scale) => scale.addIncludedValuesProvider(this._includedValuesProvider));
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

  private _updateExtentsForKey(key: string, bindings: d3.Map<Plots.AccessorScaleBinding<any, any>>,
                               extents: d3.Map<any[]>, filter: Accessor<boolean>) {
    const accScaleBinding = bindings.get(key);
    if (accScaleBinding == null || accScaleBinding.accessor == null) {
      return;
    }
    extents.set(key, this.datasets().map((dataset) => this._computeExtent(dataset, accScaleBinding, filter)));
  }

  private _computeExtent(dataset: Dataset, accScaleBinding: Plots.AccessorScaleBinding<any, any>, filter: Accessor<boolean>): any[] {
    const accessor = accScaleBinding.accessor;
    const scale = accScaleBinding.scale;

    if (scale == null) {
      return [];
    }

    let data = dataset.data();
    if (filter != null) {
      data = data.filter((d, i) => filter(d, i, dataset));
    }
    const appliedAccessor = (d: any, i: number) => accessor(d, i, dataset);
    const mappedData = data.map(appliedAccessor);

    return scale.extentOfValues(mappedData);
  }

  /**
   * Override in subclass to add special extents, such as included values
   */
  protected _extentsForProperty(property: string) {
    return this._propertyExtents.get(property);
  }

  private _includedValuesForScale<D>(scale: Scale<D, any>): D[] {
    if (!this._isAnchored) {
      return [];
    }
    let includedValues: D[] = [];
    this._attrBindings.each((binding, attr) => {
      if (binding.scale === scale) {
        const extents = this._attrExtents.get(attr);
        if (extents != null) {
          includedValues = includedValues.concat(<D[]> d3.merge(extents));
        }
      }
    });

    this._propertyBindings.each((binding, property) => {
      if (binding.scale === scale) {
        const extents = this._extentsForProperty(property);
        if (extents != null) {
          includedValues = includedValues.concat(<D[]> d3.merge(extents));
        }
      }
    });

    return includedValues;
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

  /**
   * Get the renderer for this Plot, either "svg" or "canvas".
   */
  public renderer(): Renderer;
  /**
   * Set the Renderer to be either "svg" or "canvas" on this Plot.
   * @param renderer
   */
  public renderer(renderer: Renderer): this;
  public renderer(renderer?: Renderer): Renderer | this {
    if (renderer === undefined) {
      return this._canvas == null ? "svg" : "canvas";
    } else {
      if (this._canvas == null && renderer === "canvas") {
        // construct the canvas, remove drawer's renderAreas, set drawer's canvas
        this._canvas = d3.select(document.createElement("canvas")).classed("plot-canvas", true);
        if (this.element() != null) {
          this._appendCanvasNode();
        }
        this._datasetToDrawer.forEach((drawer) => {
          if (drawer.renderArea() != null) {
            drawer.renderArea().remove();
          }
          drawer.canvas(this._canvas);
        });
        this.render();
      } else if (this._canvas != null && renderer == "svg") {
        this._canvas.remove();
        this._canvas = null;
        this._datasetToDrawer.forEach((drawer) => {
          drawer.renderArea(this._renderArea.append("g"));
        });
        this.render();
      }
      return this;
    }
  }

  /**
   * Adds a Dataset to the Plot.
   *
   * @param {Dataset} dataset
   * @returns {Plot} The calling Plot.
   */
  public addDataset(dataset: Dataset) {
    this._addDataset(dataset);
    this._onDatasetUpdate();
    return this;
  }

  protected _addDataset(dataset: Dataset) {
    this._removeDataset(dataset);
    const drawer = this._createDrawer(dataset);
    this._datasetToDrawer.set(dataset, drawer);

    if (this._isSetup) {
      this._createNodesForDataset(dataset);
    }

    dataset.onUpdate(this._onDatasetUpdateCallback);
    return this;
  }

  /**
   * Removes a Dataset from the Plot.
   *
   * @param {Dataset} dataset
   * @returns {Plot} The calling Plot.
   */
  public removeDataset(dataset: Dataset): this {
    this._removeDataset(dataset);
    this._onDatasetUpdate();
    return this;
  }

  protected _removeDataset(dataset: Dataset) {
    if (this.datasets().indexOf(dataset) === -1) {
      return this;
    }

    this._removeDatasetNodes(dataset);
    dataset.offUpdate(this._onDatasetUpdateCallback);
    this._datasetToDrawer.delete(dataset);
    return this;
  }

  protected _removeDatasetNodes(dataset: Dataset) {
    const drawer = this._datasetToDrawer.get(dataset);
    drawer.remove();
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    const currentDatasets: Dataset[] = [];
    this._datasetToDrawer.forEach((drawer, dataset) => currentDatasets.push(dataset));
    if (datasets == null) {
      return currentDatasets;
    }

    currentDatasets.forEach((dataset) => this._removeDataset(dataset));
    datasets.forEach((dataset) => this._addDataset(dataset));
    this._onDatasetUpdate();
    return this;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    return [{ attrToProjector: this._generateAttrToProjector(), animator: new Animators.Null() }];
  }

  protected _additionalPaint(time: number) {
    // no-op
  }

  /**
   * _buildLightweightPlotEntities constucts {LightweightPlotEntity[]} from
   * all the entities in the plot
   * @param {Dataset[]} [datasets] - datasets comprising this plot
   */
  protected _buildLightweightPlotEntities(datasets: Dataset[]) {
    const lightweightPlotEntities: Plots.LightweightPlotEntity[] = [];
    datasets.forEach((dataset: Dataset, datasetIndex: number) => {
      const drawer = this._datasetToDrawer.get(dataset);
      let validDatumIndex = 0;

      dataset.data().forEach((datum: any, datumIndex: number) => {
        const position = this._pixelPoint(datum, datumIndex, dataset);
        if (Utils.Math.isNaN(position.x) || Utils.Math.isNaN(position.y)) {
          return;
        }

        const plot = this;
        lightweightPlotEntities.push({
          datum,
          get position() {
            // only calculate position when needing to improve pan zoom performance #3159
            return plot._pixelPoint.call(plot, datum, datumIndex, dataset);
          },
          index: datumIndex,
          dataset,
          datasetIndex,
          component: this,
          drawer,
          validDatumIndex,
        });
        validDatumIndex++;
      });
    });

    return lightweightPlotEntities;
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw: Utils.Map<Dataset, any[]> = new Utils.Map<Dataset, any[]>();
    this.datasets().forEach((dataset) => dataToDraw.set(dataset, dataset.data()));
    return dataToDraw;
  }

  private _paint() {
    const drawSteps = this._generateDrawSteps();
    const dataToDraw = this._getDataToDraw();
    const drawers = this.datasets().map((dataset) => this._datasetToDrawer.get(dataset));

    if (this.renderer() === "canvas") {
      const canvas = this._canvas.node();
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.datasets().forEach((ds, i) => drawers[i].draw(dataToDraw.get(ds), drawSteps));

    const times = this.datasets().map((ds, i) => drawers[i].totalDrawTime(dataToDraw.get(ds), drawSteps));
    const maxTime = Utils.Math.max(times, 0);
    this._additionalPaint(maxTime);
  }

  /**
   * Retrieves the drawn visual elements for the specified Datasets as a d3 Selection.
   *
   * @param {Dataset[]} [datasets] The Datasets to retrieve the Selections for.
   *   If not provided, Selections will be retrieved for all Datasets on the Plot.
   * @returns {d3.Selection}
   */
  public selections(datasets = this.datasets()): SimpleSelection<any> {
    if (this.renderer() === "canvas") {
      return null;
    } else {
      const selections: d3.BaseType[] = [];

      datasets.forEach((dataset) => {
        const drawer = this._datasetToDrawer.get(dataset);
        if (drawer == null) {
          return;
        }
        drawer.renderArea().selectAll(drawer.selector()).each(function () {
          selections.push(this);
        });
      });

      return d3.selectAll(selections);
    }
  }

  /**
   * Gets the Entities associated with the specified Datasets.
   *
   * @param {Dataset[]} datasets The Datasets to retrieve the Entities for.
   *   If not provided, returns defaults to all Datasets on the Plot.
   * @return {Plots.PlotEntity[]}
   */
  public entities(datasets?: Dataset[]): Plots.PlotEntity[] {
    return this._getEntityStore(datasets).map((entity) => this._lightweightPlotEntityToPlotEntity(entity));
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

  protected _lightweightPlotEntityToPlotEntity(entity: Plots.LightweightPlotEntity) {
    const plotEntity: Plots.PlotEntity = {
      datum: entity.datum,
      position: entity.position,
      dataset: entity.dataset,
      datasetIndex: entity.datasetIndex,
      index: entity.index,
      component: entity.component,
      selection: entity.drawer.selectionForIndex(entity.validDatumIndex),
    };
    return plotEntity;
  }

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
  public entitiesAt(point: Point): Plots.PlotEntity[] {
    throw new Error("plots must implement entitiesAt");
  }

  /**
   * Returns the {Plots.PlotEntity} nearest to the query point,
   * or undefined if no {Plots.PlotEntity} can be found.
   *
   * @param {Point} queryPoint
   * @param {bounds} Bounds The bounding box within which to search. By default, bounds is the bounds of
   * the chart, relative to the parent.
   * @returns {Plots.PlotEntity} The nearest PlotEntity, or undefined if no {Plots.PlotEntity} can be found.
   */
  public entityNearest(queryPoint: Point, bounds = this.bounds()): Plots.PlotEntity {
    const nearest = this._getEntityStore().entityNearest(queryPoint, (entity: Plots.LightweightPlotEntity) => {
      return this._entityVisibleOnPlot(entity, bounds);
    });

    return nearest === undefined ? undefined : this._lightweightPlotEntityToPlotEntity(nearest);
  }

  protected _entityVisibleOnPlot(entity: Plots.PlotEntity | Plots.LightweightPlotEntity, chartBounds: Bounds) {
    return !(entity.position.x < chartBounds.topLeft.x || entity.position.y < chartBounds.topLeft.y ||
    entity.position.x > chartBounds.bottomRight.x || entity.position.y > chartBounds.bottomRight.y);
  }

  protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
    scale.offUpdate(this._renderCallback);
    scale.removeIncludedValuesProvider(this._includedValuesProvider);
  }

  protected _installScaleForKey(scale: Scale<any, any>, key: string) {
    scale.onUpdate(this._renderCallback);
    scale.addIncludedValuesProvider(this._includedValuesProvider);
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

  protected _animateOnNextRender() {
    return this._animate && this._dataChanged;
  }
}
