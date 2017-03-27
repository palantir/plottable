/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point } from "../core/interfaces";
import * as Plots from "../plots";
import { Plot } from "../plots/plot";
import * as Utils from "../utils";

import { Component } from "./component";
import { Group } from "./group";

export class PlotGroup extends Group {
  public entityNearest(point: Point): Plots.IPlotEntity {
    let closestPlotEntity: Plots.IPlotEntity;
    let minDistSquared = Infinity;
    this.components().forEach((plotComponent: Component) => {
      // we know it's a Plot since .append() throws a runtime error otherwise
      const plot: Plot = <Plot> <any> plotComponent;
      const candidatePlotEntity = plot.entityNearest(point);
      if (candidatePlotEntity == null) {
        return;
      }

      const distSquared = Utils.Math.distanceSquared(candidatePlotEntity.position, point);
      if (distSquared <= minDistSquared) {
        minDistSquared = distSquared;
        closestPlotEntity = candidatePlotEntity;
      }
    });

    return closestPlotEntity;
  }

  /**
   * Adds a Plot to this Plot Group.
   * The added Plot will be rendered above Plots already in the Group.
   */
  public append(plot: Component): this {
    if (plot != null && !(plot instanceof Plot)) {
      throw new Error("Plot Group only accepts plots");
    }
    super.append(plot);
    return this;
  }
}
