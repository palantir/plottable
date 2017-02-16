/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { BaseAreaPlot, IAreaPlot } from "./baseAreaPlot";
import { Accessor, Point, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { DrawStep } from "../drawers";


import { Scale } from "../scales/scale";
import { QuantitativeScale } from "../scales/quantitativeScale";

export interface IStackedAreaPlot<X> extends IAreaPlot<X> {
  /**
   * Gets the stacking order of the plot.
   */
  stackingOrder(): Utils.Stacking.IStackingOrder;
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
  stackingOrder(stackingOrder: Utils.Stacking.IStackingOrder): this;
  stackingOrder(stackingOrder?: Utils.Stacking.IStackingOrder): any;
}

export class BaseStackedAreaPlot<X> extends BaseAreaPlot<X> implements IStackedAreaPlot<X> {
  public baselineValue = 0;

  private _stackingResult = new Utils.Map<Dataset, Utils.Map<string | number, Utils.Stacking.StackedDatum>>();
  private _stackedExtent: number[] = [];
  private _stackingOrder: Utils.Stacking.IStackingOrder = "bottomup";

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

  public stackingOrder(stackingOrder?: Utils.Stacking.IStackingOrder): any {
    if (stackingOrder == null) {
      return this._stackingOrder;
    }
    this._stackingOrder = stackingOrder;
    this._onDatasetUpdate();
    return this;
  }

  protected _extentsForProperty(attr: string) {
    let primaryAttr = "y";
    if (attr === primaryAttr) {
      return [this._stackedExtent];
    } else {
      return super._extentsForProperty(attr);
    }
  }

  protected _generateLineDrawSteps(): DrawStep[] {
    // We don't draw lines for area plots
    return [];
  }

  protected _onDatasetUpdate() {
    this._updateStackExtentsAndOffsets();
    super._onDatasetUpdate();
    return this;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    let pixelPoint = super._pixelPoint(datum, index, dataset);
    let xValue = this.x().accessor(datum, index, dataset);
    let yValue = this.y().accessor(datum, index, dataset);
    let scaledYValue = this.y().scale.scale(+yValue + this._stackingResult.get(dataset).get(Utils.Stacking.normalizeKey(xValue)).offset);
    return { x: pixelPoint.x, y: scaledYValue };
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

    propertyToProjectors["d"] = this._constructAreaProjector(BaseStackedAreaPlot._scaledAccessor(this.x()), stackYProjector, stackY0Projector);
    return propertyToProjectors;
  }

  protected _updateExtentsForProperty(property: string) {
    super._updateExtentsForProperty(property);
    if ((property === "x" || property === "y") && this._projectorsReady()) {
      this._updateStackExtentsAndOffsets();
    }
  }

  protected _updateYScale() {
    let yBinding = this.y();
    let scale = <QuantitativeScale<any>> (yBinding && yBinding.scale);
    if (scale == null) {
      return;
    }
    scale.addPaddingExceptionsProvider(() => [this.baselineValue]);
    scale.addIncludedValuesProvider(() => [this.baselineValue]);
  }

  private _checkSameDomain(datasets: Dataset[], keyAccessor: Accessor<any>) {
    let keySets = datasets.map((dataset) => {
      return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset).toString())).values();
    });
    let domainKeys = BaseStackedAreaPlot._domainKeys(datasets, keyAccessor);

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
}
