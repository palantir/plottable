/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Utils from "../utils";

import {BaseBarPlot, IBarPlot } from "./baseBarPlot";
import { LabeledComponent } from "../components/labeled";
import * as Scales from "../scales";
import { Category } from "../scales";

import { PlotEntity } from "./";
import { EntityAdapter, DrawerFactory } from "./basePlot";
import { Dataset } from "../core/dataset";

export interface IClusteredBarPlot<X, Y> extends IBarPlot<X, Y> {}

export class BaseClusteredBarPlot<X, Y, P extends PlotEntity> extends BaseBarPlot<X, Y, P> implements IClusteredBarPlot<X, Y> {
  private _clusterOffsets: Utils.Map<Dataset, number>;

  constructor(drawerFactory: DrawerFactory, entityAdapter: EntityAdapter<P>, component: LabeledComponent) {
    super(drawerFactory, entityAdapter, component);
    this._clusterOffsets = new Utils.Map<Dataset, number>();
  }

  /**
   *  Public for testing
   */
  public makeInnerScale() {
    let innerScale = new Scales.Category();
    innerScale.domain(this.datasets().map((d, i) => String(i)));
    let widthProjector = BaseClusteredBarPlot._scaledAccessor(this.attr("width"));
    innerScale.range([0, widthProjector(null, 0, null)]);
    return innerScale;
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();
    // the width is constant, so set the inner scale range to that
    let innerScale = this.makeInnerScale();
    let innerWidthF = (d: any, i: number) => innerScale.rangeBand();
    attrToProjector["width"] = this._isVertical ? innerWidthF : attrToProjector["width"];
    attrToProjector["height"] = !this._isVertical ? innerWidthF : attrToProjector["height"];

    let xAttr = attrToProjector["x"];
    let yAttr = attrToProjector["y"];
    attrToProjector["x"] = this._isVertical ?
      (d: any, i: number, ds: Dataset) => xAttr(d, i, ds) + this._clusterOffsets.get(ds) :
      (d: any, i: number, ds: Dataset) => xAttr(d, i, ds);
    attrToProjector["y"] = this._isVertical ?
      (d: any, i: number, ds: Dataset) => yAttr(d, i, ds) :
      (d: any, i: number, ds: Dataset) => yAttr(d, i, ds) + this._clusterOffsets.get(ds);

    return attrToProjector;
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    this._updateClusterPosition();
    return super._getDataToDraw();
  }

  private _updateClusterPosition() {
    let innerScale = this.makeInnerScale();
    this.datasets().forEach((d, i) => this._clusterOffsets.set(d, innerScale.scale(String(i)) - innerScale.rangeBand() / 2));
  }


}