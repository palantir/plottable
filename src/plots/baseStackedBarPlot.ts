/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Utils from "../utils";
import * as Plots from "./";

import { Map } from "../utils";
import { BaseBarPlot, IBarPlot } from "./baseBarPlot";
import { Dataset, DatasetCallback } from "../core/dataset";
import { Accessor, AttributeToProjector, Point } from "../core/interfaces";
import { Scale } from "../scales/scale";

import { LabeledComponent } from "../components/labeled";
import { DrawerFactory } from "./basePlot";

export interface IStackedBarPlot<X, Y> extends IBarPlot<X, Y> {
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

export class BaseStackedBarPlot<X, Y> extends BaseBarPlot<X, Y> implements IStackedBarPlot<X, Y> {
  private _stackingOrder: Utils.Stacking.IStackingOrder;
  private _stackingResult: Utils.Stacking.StackingResult;
  private _stackedExtent: number[];

  constructor(drawerFactory: DrawerFactory, component: LabeledComponent, width: () => number, height: () => number) {
    super(drawerFactory, component, width, height);
    this._stackingOrder = "bottomup";
    this._stackingResult = new Utils.Map<Dataset, Utils.Map<string, Utils.Stacking.StackedDatum>>();
    this._stackedExtent = [];
  }

  public onDatasetUpdate(_onDatasetUpdateCallback: DatasetCallback) {
    this._onDatasetUpdateCallback = (dataset?: Dataset) => {
        this._updateStackExtentsAndOffsets();
        _onDatasetUpdateCallback(dataset);
    };
  }

  public stackingOrder(): Utils.Stacking.IStackingOrder;
  public stackingOrder(stackingOrder: Utils.Stacking.IStackingOrder): this;
  public stackingOrder(stackingOrder?: Utils.Stacking.IStackingOrder): any {
    if (stackingOrder == null) {
      return this._stackingOrder;
    }
    this._stackingOrder = stackingOrder;
    this._onDatasetUpdateCallback(null);
    return this;
  }

  public stackingResult() {
    return this._stackingResult;
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

  public y(): Plots.TransformableAccessorScaleBinding<Y, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    if (y == null) {
      return super.y();
    }
    if (yScale == null) {
      super.y(<number | Accessor<number>> y);
    } else {
      super.y(<Y | Accessor<Y>> y, yScale);
    }

    this._updateStackExtentsAndOffsets();
    return this;
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();

    let valueAttr = this._isVertical ? "y" : "x";
    let keyAttr = this._isVertical ? "x" : "y";
    let primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
    let primaryAccessor = this._propertyBindings.get(valueAttr).accessor;
    let keyAccessor = this._propertyBindings.get(keyAttr).accessor;
    let normalizedKeyAccessor = (datum: any, index: number, dataset: Dataset) => {
      return Utils.Stacking.normalizeKey(keyAccessor(datum, index, dataset));
    };
    let getStart = (d: any, i: number, dataset: Dataset) =>
      primaryScale.scale(this._stackingResult.get(dataset).get(normalizedKeyAccessor(d, i, dataset)).offset);
    let getEnd = (d: any, i: number, dataset: Dataset) =>
      primaryScale.scale(+primaryAccessor(d, i, dataset) +
        this._stackingResult.get(dataset).get(normalizedKeyAccessor(d, i, dataset)).offset);

    let heightF = (d: any, i: number, dataset: Dataset) => {
      return Math.abs(getEnd(d, i, dataset) - getStart(d, i, dataset));
    };
    attrToProjector[this._isVertical ? "height" : "width"] = heightF;

    let attrFunction = (d: any, i: number, dataset: Dataset) =>
      +primaryAccessor(d, i, dataset) < 0 ? getStart(d, i, dataset) : getEnd(d, i, dataset);
    attrToProjector[valueAttr] = (d: any, i: number, dataset: Dataset) =>
      this._isVertical ? attrFunction(d, i, dataset) : attrFunction(d, i, dataset) - heightF(d, i, dataset);

    return attrToProjector;
  }

  protected _updateExtentsForProperty(property: string) {
    super._updateExtentsForProperty(property);
    if ((property === "x" || property === "y") && this._projectorsReady()) {
      this._updateStackExtentsAndOffsets();
    }
  }

  protected _extentsForProperty(attr: string) {
    let primaryAttr = this._isVertical ? "y" : "x";
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
    let keyAccessor = this._isVertical ? this.x().accessor : this.y().accessor;
    let valueAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
    let filter = this._filterForProperty(this._isVertical ? "y" : "x");

    this._stackingResult = Utils.Stacking.stack(datasets, keyAccessor, valueAccessor, this._stackingOrder);
    this._stackedExtent = Utils.Stacking.stackedExtent(this._stackingResult, keyAccessor, filter);
  }
}