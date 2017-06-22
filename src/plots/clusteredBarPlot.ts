/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import * as Scales from "../scales";
import * as Utils from "../utils";

import { Bar, BarOrientation } from "./barPlot";
import { Plot } from "./plot";

export class ClusteredBar<X, Y> extends Bar<X, Y> {

  private _clusterOffsets: Utils.Map<Dataset, number>;

  /**
   * A ClusteredBar Plot groups bars across Datasets based on the primary value of the bars.
   *   On a vertical ClusteredBar Plot, the bars with the same X value are grouped.
   *   On a horizontal ClusteredBar Plot, the bars with the same Y value are grouped.
   *
   * @constructor
   * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
   */
  constructor(orientation: BarOrientation = "vertical") {
    super(orientation);
    this._clusterOffsets = new Utils.Map<Dataset, number>();
  }

  protected _generateAttrToProjector() {
    const attrToProjector = super._generateAttrToProjector();
    // the width is constant, so set the inner scale range to that
    const innerScale = this._makeInnerScale();
    const innerWidthF = (d: any, i: number) => innerScale.rangeBand();
    attrToProjector["width"] = this._isVertical ? innerWidthF : attrToProjector["width"];
    attrToProjector["height"] = !this._isVertical ? innerWidthF : attrToProjector["height"];

    const xAttr = attrToProjector["x"];
    const yAttr = attrToProjector["y"];
    attrToProjector["x"] = this._isVertical ?
      (d: any, i: number, ds: Dataset) => xAttr(d, i, ds) + this._clusterOffsets.get(ds) :
      (d: any, i: number, ds: Dataset) => xAttr(d, i, ds);
    attrToProjector["y"] = this._isVertical ?
      (d: any, i: number, ds: Dataset) => yAttr(d, i, ds) :
      (d: any, i: number, ds: Dataset) => yAttr(d, i, ds) + this._clusterOffsets.get(ds);

    return attrToProjector;
  }

  private _updateClusterPosition() {
    const innerScale = this._makeInnerScale();
    this.datasets().forEach((d, i) => this._clusterOffsets.set(d, innerScale.scale(String(i)) - innerScale.rangeBand() / 2));
  }

  private _makeInnerScale() {
    const innerScale = new Scales.Category();
    innerScale.domain(this.datasets().map((d, i) => String(i)));
    const widthProjector = Plot._scaledAccessor(this.attr(Bar._BAR_THICKNESS_KEY));
    innerScale.range([0, widthProjector(null, 0, null)]);
    return innerScale;
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    this._updateClusterPosition();
    return super._getDataToDraw();
  }
}
