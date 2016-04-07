module Plottable.Components {
  export class PlotGroup extends Group {
    public entityNearest(point: Point): Plots.PlotEntity {
      let closestPlotEntity: Plots.PlotEntity;
      let minDistSquared = Infinity;
      this.components().forEach((plot: Plot) => {
        let candidatePlotEntity = plot.entityNearest(point);
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
    public append(plot: Plot): this {
      if (plot != null && !(plot instanceof Plot)) {
        throw new Error("Plot Group only accepts plots");
      }
      super.append(plot);
      return this;
    }
  }
}
