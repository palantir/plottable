/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Animators from "../animators";
import * as Utils from "../utils";
import * as Plots from "../plots";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";

import { BasePlot, IPlot } from "./basePlot";

import { HTMLComponent } from "../components/htmlComponent";
import { Accessor, AttributeToProjector, Point } from "../core/interfaces";
import { Dataset, DatasetCallback } from "../core/dataset";
import * as Drawers from "../drawers";
import { CanvasDrawer } from "../drawers/canvasDrawer";
import { Drawer } from "../drawers/drawer";

export class CanvasPlot extends HTMLComponent implements IPlot {
  private _cachedEntityStore: Utils.EntityStore<Plots.LightweightPlotEntity>;
  private _dataChanged = false;
  protected _plot: BasePlot;

  constructor() {
    super();
    this._plot = this._createPlot();
    this._plot.onDatasetUpdate(() => this._onDatasetUpdate());
    this._plot.onDatasetsUpdate(() => this._onDatasetUpdate());
    this._plot.renderCallback((scale) => this.render());
  }

  public addDataset(dataset: Dataset) {
    this._plot.addDataset(dataset);
    return this;
  }

  public anchor(selection: HTMLElement) {
    super.anchor(selection);
    this._dataChanged = true;
    this._cachedEntityStore = undefined;
    this._plot.updateExtents();
    return this;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    const canvas = this._plot.renderArea().node() as HTMLCanvasElement;
    canvas.width = this.width();
    canvas.height = this.height();

    return this;
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

    this._plot.attr<A>(attr, attrValue as A, scale);
    this.render(); // queue a re-render upon changing projector
    return this;
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    const returnedDatasets = this._plot.datasets(datasets);
    return datasets === undefined ? returnedDatasets : this;
  }

 /**
  * Removes a Dataset from the Plot.
  *
  * @param {Dataset} dataset
  * @returns {Plot} The calling Plot.
  */
  public removeDataset(dataset: Dataset): this {
    this._plot.removeDataset(dataset);
    return this;
  }

  public renderImmediately() {
    super.renderImmediately();
    if (this._isAnchored) {
      this._plot.renderImmediately();
    }

    return this;
  }

  protected _createPlot() {
    return new BasePlot((dataset) => new CanvasDrawer(dataset));
  }

  protected _onDatasetUpdate() {
    this._plot.updateExtents();
    this._dataChanged = true;
    this._cachedEntityStore = undefined;
    this.render();
  }


  protected _setup() {
    super._setup();
    this._plot.renderArea(this.element().append("canvas"));
  }
}
