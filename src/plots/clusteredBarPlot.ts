/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";
import * as Scales from "../scales";
import * as Utils from "../utils";
import * as Drawers from "../drawers";


import { Bar } from "./barPlot";
import { Plot } from "./plot";

import { SVGPlotEntity } from "../plots";
import { IComponent } from "../components";

import { BaseClusteredBarPlot, IClusteredBarPlot } from "./baseClusteredBarPlot";

export class ClusteredBar<X, Y> extends Bar<X, Y> implements IClusteredBarPlot<X, Y> {
  protected _plot: BaseClusteredBarPlot<X, Y, SVGPlotEntity>;

  /**
   * A ClusteredBar Plot groups bars across Datasets based on the primary value of the bars.
   *   On a vertical ClusteredBar Plot, the bars with the same X value are grouped.
   *   On a horizontal ClusteredBar Plot, the bars with the same Y value are grouped.
   *
   * @constructor
   * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
   */
  constructor(orientation = Bar.ORIENTATION_VERTICAL) {
    super(orientation);
  }

  protected _createPlot() {
    return new BaseClusteredBarPlot((dataset) => new Drawers.Rectangle(dataset), ClusteredBar.SVGEntityAdapter, this);
  }
}
