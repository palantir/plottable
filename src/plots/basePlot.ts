import * as d3 from "d3";

import * as Plots from "./";

import { Null } from "../animators";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import * as Utils from "../utils";

import { Dataset, DatasetCallback } from "../core/dataset";
import { Accessor, AttributeToProjector } from "../core/interfaces";
import { IDrawer } from "../drawers/drawer";
import { Scale, ScaleCallback } from "../scales/scale";

export interface IPlot {
  addDataset(dataset: Dataset): this;
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
  removeDataset(dataset: Dataset): this;
  renderImmediately(): this;
}

export type DrawerFactory = (dataset: Dataset) => IDrawer;

export class BasePlot implements IPlot {
  private _attrBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
  private _attrExtents: d3.Map<any[]>;
  private _datasetToDrawer: Utils.Map<Dataset, IDrawer>;
  private _drawerFactory: DrawerFactory;
  private _includedValuesProvider: Scales.IncludedValuesProvider<any>;
  private _onDatasetsUpdate: Function;
  private _onDatasetUpdate: DatasetCallback;
  private _renderArea: d3.Selection<void>;
  private _renderCallback: ScaleCallback<Scale<any, any>>;

  protected _propertyBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
  protected _propertyExtents: d3.Map<any[]>;

  constructor(drawerFactory: DrawerFactory) {
    this._attrBindings = d3.map<Plots.AccessorScaleBinding<any, any>>();
    this._attrExtents = d3.map<any[]>();
    this._drawerFactory = drawerFactory;
    this._datasetToDrawer = new Utils.Map<Dataset, IDrawer>();
    this._propertyBindings = d3.map<Plots.AccessorScaleBinding<any, any>>();
    this._propertyExtents = d3.map<any[]>();

    this._includedValuesProvider = (scale: Scale<any, any>) => this._includedValuesForScale(scale);
  }

  public addDataset(dataset: Dataset) {
    this._addDataset(dataset);
    this._onDatasetsUpdate();
    return this;
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
    return this;
  }

  public renderArea(): d3.Selection<void>;
  public renderArea(renderArea: d3.Selection<void>): this;
  public renderArea(renderArea?: d3.Selection<void>): any {
    if (renderArea === undefined) {
        return this._renderArea;
    }

    this._renderArea = renderArea;

    this.datasets().forEach((dataset) => {
      this._datasetToDrawer.get(dataset).renderArea(renderArea);
    });

    return this;
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    let currentDatasets: Dataset[] = [];
    this._datasetToDrawer.forEach((drawer, dataset) => currentDatasets.push(dataset));
    if (datasets == null) {
       return currentDatasets;
    }

    currentDatasets.forEach((dataset) => this._removeDataset(dataset));
    datasets.forEach((dataset) => this._addDataset(dataset));
    this._onDatasetsUpdate();
    return this;
  }

  public onDatasetsUpdate(_onDatasetsUpdate: Function) {
    this._onDatasetsUpdate = _onDatasetsUpdate;
  }

  public onDatasetUpdate(_onDatasetUpdate: DatasetCallback) {
    this._onDatasetUpdate = _onDatasetUpdate;
  }

  /**
   * Removes a Dataset from the Plot.
   *
   * @param {Dataset} dataset
   * @returns {Plot} The calling Plot.
   */
  public removeDataset(dataset: Dataset) {
    this._removeDataset(dataset)
    this._onDatasetsUpdate();
    return this;
  }

  public renderImmediately() {
    let drawSteps = this._generateDrawSteps();
    let dataToDraw = this._getDataToDraw();
    let drawers = this._getDrawersInOrder();
    this.datasets().forEach((ds, i) => drawers[i].draw(dataToDraw.get(ds), drawSteps));

    return this;
  }

  public renderCallback(_renderCallback:ScaleCallback<Scale<any, any>>) {
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
        drawer.renderArea(this._renderArea);
      }

      this._datasetToDrawer.set(dataset, drawer);
      dataset.onUpdate(this._onDatasetUpdate);
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

  protected _getDrawersInOrder(): IDrawer[] {
    return this.datasets().map((dataset) => this._datasetToDrawer.get(dataset));
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw: Utils.Map<Dataset, any[]> = new Utils.Map<Dataset, any[]>();
    this.datasets().forEach((dataset) => dataToDraw.set(dataset, dataset.data()));
    return dataToDraw;
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

  protected _propertyProjectors(): AttributeToProjector {
     return {};
  }

  protected _removeDataset(dataset: Dataset) {
    if (this.datasets().indexOf(dataset) === -1) {
      return this;
    }

    // this._removeDatasetNodes(dataset);
    dataset.offUpdate(this._onDatasetUpdate);
    this._datasetToDrawer.delete(dataset);
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
