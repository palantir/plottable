/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Animators from "../animators";
import { Animator } from "../animators/animator";
import { SVGComponent } from "../components/svgComponent";
import { Accessor, Point, AttributeToProjector, Bounds } from "../core/interfaces";
import { Dataset, DatasetCallback } from "../core/dataset";
import * as Drawers from "../drawers";
import { Drawer } from "../drawers/drawer";
import * as Scales from "../scales";
import { Scale, ScaleCallback } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./commons";
import { BasePlot, IPlot } from "./basePlot";

export class Plot extends SVGComponent implements IPlot {
  protected static _ANIMATION_MAX_DURATION = 600;

  protected _renderArea: d3.Selection<void>;
  protected _plot: BasePlot;

  /**
   * A Plot draws some visualization of the inputted Datasets.
   *
   * @constructor
   */
  constructor() {
    super();
    this._plot = this._createPlot();
    this._plot.onDatasetRemoved((dataset) => this._onDatasetRemoved(dataset));
    this._plot.onDatasetUpdate(() => this._onDatasetUpdate());
    this._plot.onDatasetsUpdate(() => this._onDatasetUpdate());
    this._plot.renderCallback((scale) => this.render());

    this._clipPathEnabled = true;
    this.addClass("plot");
    let mainAnimator = new Animators.Easing().maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
    this.animator(Plots.Animator.MAIN, mainAnimator);
    this.animator(Plots.Animator.RESET, new Animators.Null());
  }

  public anchor(selection: d3.Selection<void>) {
    super.anchor(selection);
    this._plot.clearDataCache();
    this._plot.updateExtents();
    return this;
  }

  protected _setup() {
    super._setup();
    this._renderArea = this.content().append("g").classed("render-area", true);
    this._plot.renderArea(() => this._renderArea.append("g"));
  }

  public destroy() {
    super.destroy();
    this._plot.destroy();
  }

  protected _onDatasetUpdate() {
    this._plot.updateExtents();
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
    const plotAttr = this._plot.attr<A>(attr, attrValue as A, scale);
    if (attrValue == null) {
      return plotAttr;
    }

    return this;
  }

  public renderImmediately() {
    super.renderImmediately();
    if (this._isAnchored) {
      this._plot.renderImmediately();
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
    const plotAnimate = this._plot.animated(willAnimate);
    if (willAnimate == null) {
      return plotAnimate;
    }

    return this;
  }

  public detach() {
    super.detach();
    // make the domain resize
    this._plot.updateExtents();
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
    const plotAnimator = this._plot.animator(animatorKey, animator);
    if (animator === undefined) {
      return plotAnimator;
    }

    return this;
  }

  /**
   * Adds a Dataset to the Plot.
   *
   * @param {Dataset} dataset
   * @returns {Plot} The calling Plot.
   */
  public addDataset(dataset: Dataset) {
    this._plot.addDataset(dataset);
    return this;
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

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    const returnedDatasets = this._plot.datasets(datasets);
    if (datasets == null) {
      return returnedDatasets;
    }
    return this;
  }

  /**
   * Retrieves Selections of this Plot for the specified Datasets.
   *
   * @param {Dataset[]} [datasets] The Datasets to retrieve the Selections for.
   *   If not provided, Selections will be retrieved for all Datasets on the Plot.
   * @returns {d3.Selection}
   */
  public selections(datasets = this.datasets()): d3.Selection<any> {
    let selections: Element[] = [];

    datasets.forEach((dataset) => {
      let drawer = this._plot.drawer(dataset);
      if (drawer == null) {
        return;
      }
      drawer.renderArea().selectAll((drawer as Drawer).selector()).each(function () {
        selections.push(this);
      });
    });

    return d3.selectAll(selections);
  }

  /**
   * Gets the Entities associated with the specified Datasets.
   *
   * @param {Dataset[]} datasets The Datasets to retrieve the Entities for.
   *   If not provided, returns defaults to all Datasets on the Plot.
   * @return {Plots.PlotEntity[]}
   */
  public entities(datasets?: Dataset[]): Plots.PlotEntity[] {
    return this._plot.entities(datasets);
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
    return this._plot.entitiesAt(point);
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
    return this._plot.entityNearest(queryPoint, bounds);
  }

  protected _onDatasetRemoved(dataset: Dataset) {
    // sub classes implement

  }

  protected _createPlot() {
    return new BasePlot((dataset) => new Drawer(dataset), this);
  }
}
