/*
Copyright 2014-present Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

import * as d3 from "d3";

import * as Animators from "../animators";
import { Animator } from "../animators/animator";
import { Accessor, Point, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { Scale } from "../scales/scale";
import { QuantitativeScale } from "../scales/quantitativeScale";
import * as Utils from "../utils";

import * as Plots from "./";
import { Area } from "./areaPlot";
import { Plot } from "./plot";

export class StackedArea<X> extends Area<X> {
  private _stackingOrder: Utils.Stacking.IStackingOrder;
  private _stackingResult: Utils.Stacking.StackingResult;
  private _stackedExtent: number[];

  private _baseline: d3.Selection<void>;
  private _baselineValue = 0;
  private _baselineValueProvider: () => number[];

  /**
   * @constructor
   */
  constructor() {
    super();
    this._stackingOrder = "bottomup";
    this.addClass("stacked-area-plot");
    this.attr("fill-opacity", 1);
    this._stackingResult = new Utils.Map<Dataset, Utils.Map<string, Utils.Stacking.StackedDatum>>();
    this._stackedExtent = [];
    this._baselineValueProvider = () => [this._baselineValue];
    this.croppedRenderingEnabled(false);
  }

  public croppedRenderingEnabled(): boolean;
  public croppedRenderingEnabled(croppedRendering: boolean): this;
  public croppedRenderingEnabled(croppedRendering?: boolean): any {
    if (croppedRendering == null) {
      return super.croppedRenderingEnabled();
    }

    if (croppedRendering === true) {
      // HACKHACK #3032: cropped rendering doesn't currently work correctly on StackedArea
      Utils.Window.warn("Warning: Stacked Area Plot does not support cropped rendering.");
      return this;
    }

    return super.croppedRenderingEnabled(croppedRendering);
  }

  protected _getAnimator(key: string): Animator {
    return new Animators.Null();
  }

  protected _setup() {
    super._setup();
    this._baseline = this._renderArea.append("line").classed("baseline", true);
  }

  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }
    if (xScale == null) {
      super.x(<number | Accessor<number>> x);
    } else {
      super.x(<X | Accessor<X>> x, xScale);
    }

    this._updateStackExtentsAndOffsets();

    return this;
  }

  public y(): Plots.TransformableAccessorScaleBinding<number, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: number | Accessor<number>, yScale: QuantitativeScale<number>): this;
  public y(y?: number | Accessor<number>, yScale?: QuantitativeScale<number>): any {
    if (y == null) {
      return super.y();
    }
    if (yScale == null) {
      super.y(<number | Accessor<number>> y);
    } else {
      super.y(<number | Accessor<number>> y, yScale);
    }

    this._updateStackExtentsAndOffsets();

    return this;
  }

  /**
   * Gets the stacking order of the plot.
   */
  public stackingOrder(): Utils.Stacking.IStackingOrder;
  /**
   * Sets the stacking order of the plot.
   *
   * By default, stacked plots are "bottomup", meaning for positive data, the
   * first series will be placed at the bottom of the scale and subsequent
   * data series will by stacked on top. This can be reveresed by setting
   * stacking order to "topdown".
   *
   * @returns {Plots.StackedArea} This plot
   */
  public stackingOrder(stackingOrder: Utils.Stacking.IStackingOrder): this;
  public stackingOrder(stackingOrder?: Utils.Stacking.IStackingOrder): any {
    if (stackingOrder == null) {
      return this._stackingOrder;
    }
    this._stackingOrder = stackingOrder;
    this._onDatasetUpdate();
    return this;
  }

  /**
   * Gets if downsampling is enabled
   *
   * When downsampling is enabled, two consecutive lines with the same slope will be merged to one line.
   */
  public downsamplingEnabled(): boolean;
  /**
   * Sets if downsampling is enabled
   *
   * For now, downsampling is always disabled in stacked area plot
   * @returns {Plots.StackedArea} The calling Plots.StackedArea
   */
  public downsamplingEnabled(downsampling: boolean): this;
  public downsamplingEnabled(downsampling?: boolean): any {
    if (downsampling == null) {
      return super.downsamplingEnabled();
    }
    Utils.Window.warn("Warning: Stacked Area Plot does not support downsampling");
    return this;
  }

  protected _additionalPaint() {
    let scaledBaseline = this.y().scale.scale(this._baselineValue);
    let baselineAttr: any = {
      "x1": 0,
      "y1": scaledBaseline,
      "x2": this.width(),
      "y2": scaledBaseline,
    };

    this._getAnimator("baseline").animate(this._baseline, baselineAttr);
  }

  protected _updateYScale() {
    let yBinding = this.y();
    let scale = <QuantitativeScale<any>> (yBinding && yBinding.scale);
    if (scale == null) {
      return;
    }
    scale.addPaddingExceptionsProvider(this._baselineValueProvider);
    scale.addIncludedValuesProvider(this._baselineValueProvider);
  }

  protected _onDatasetUpdate() {
    this._updateStackExtentsAndOffsets();
    super._onDatasetUpdate();
    return this;
  }

  protected _updateExtentsForProperty(property: string) {
    super._updateExtentsForProperty(property);
    if ((property === "x" || property === "y") && this._projectorsReady()) {
      this._updateStackExtentsAndOffsets();
    }
  }

  protected _extentsForProperty(attr: string) {
    let primaryAttr = "y";
    if (attr === primaryAttr) {
      return [this._stackedExtent];
    } else {
      return super._extentsForProperty(attr);
    }
  }

  private _updateStackExtentsAndOffsets() {
    if (!this._projectorsReady()) {
      return;
    }

    let datasets = this.datasets();
    let keyAccessor = this.x().accessor;
    let valueAccessor = this.y().accessor;
    let filter = this._filterForProperty("y");

    this._checkSameDomain(datasets, keyAccessor);
    this._stackingResult = Utils.Stacking.stack(datasets, keyAccessor, valueAccessor, this._stackingOrder);
    this._stackedExtent = Utils.Stacking.stackedExtent(this._stackingResult, keyAccessor, filter);
  }

  private _checkSameDomain(datasets: Dataset[], keyAccessor: Accessor<any>) {
    let keySets = datasets.map((dataset) => {
      return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset).toString())).values();
    });
    let domainKeys = StackedArea._domainKeys(datasets, keyAccessor);

    if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
      Utils.Window.warn("the domains across the datasets are not the same. Plot may produce unintended behavior.");
    }
  }

  /**
   * Given an array of Datasets and the accessor function for the key, computes the
   * set reunion (no duplicates) of the domain of each Dataset. The keys are stringified
   * before being returned.
   *
   * @param {Dataset[]} datasets The Datasets for which we extract the domain keys
   * @param {Accessor<any>} keyAccessor The accessor for the key of the data
   * @return {string[]} An array of stringified keys
   */
  private static _domainKeys(datasets: Dataset[], keyAccessor: Accessor<any>) {
    let domainKeys = d3.set();
    datasets.forEach((dataset) => {
      dataset.data().forEach((datum, index) => {
        domainKeys.add(keyAccessor(datum, index, dataset));
      });
    });

    return domainKeys.values();
  }

  protected _propertyProjectors(): AttributeToProjector {
    let propertyToProjectors = super._propertyProjectors();
    let yAccessor = this.y().accessor;
    let xAccessor = this.x().accessor;
    let normalizedXAccessor = (datum: any, index: number, dataset: Dataset) => {
      return Utils.Stacking.normalizeKey(xAccessor(datum, index, dataset));
    };
    let stackYProjector = (d: any, i: number, dataset: Dataset) =>
      this.y().scale.scale(+yAccessor(d, i, dataset) + this._stackingResult.get(dataset).get(normalizedXAccessor(d, i, dataset)).offset);
    let stackY0Projector = (d: any, i: number, dataset: Dataset) =>
      this.y().scale.scale(this._stackingResult.get(dataset).get(normalizedXAccessor(d, i, dataset)).offset);

    propertyToProjectors["d"] = this._constructAreaProjector(Plot._scaledAccessor(this.x()), stackYProjector, stackY0Projector);
    return propertyToProjectors;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    let pixelPoint = super._pixelPoint(datum, index, dataset);
    let xValue = this.x().accessor(datum, index, dataset);
    let yValue = this.y().accessor(datum, index, dataset);
    let scaledYValue = this.y().scale.scale(+yValue + this._stackingResult.get(dataset).get(Utils.Stacking.normalizeKey(xValue)).offset);
    return { x: pixelPoint.x, y: scaledYValue };
  }

}
