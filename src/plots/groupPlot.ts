module Plottable.Plots {
  export class PlotGroup extends Components.Group {
    public entityNearest(point: Point): PlotEntity {
      let closestPlotEntity: PlotEntity = null;
      let minDistSquared = Infinity;
      this.components().forEach((plot: Plot) => {
        let candidatePlotEntity = plot.entityNearest(point);
        if (candidatePlotEntity == null) {
            return;
        }

        let position = candidatePlotEntity.position;
        let distSquared = Math.pow(position.x - point.x, 2) + Math.pow(position.y - point.y, 2);
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
    public append(component: Component): any {
      if (component != null && !(component instanceof Plot)) {
        throw new Error("Plot Group only accepts plots");
      }
      return <PlotGroup> super.append(component);
    }
  }
}
