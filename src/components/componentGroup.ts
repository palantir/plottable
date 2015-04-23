///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Group extends AbstractComponentContainer {

    /**
     * Constructs a Component.Group.
     *
     * A Component.Group is a set of Components that will be rendered on top of
     * each other. When you call Component.above(Component) or Component.below(Component),
     * it creates and returns a Component.Group.
     *
     * Note that the order of the components will determine placement on the z-axis,
     * with the previous items rendered below the later items.
     *
     * @constructor
     * @param {Component[]} components The Components in the resultant Component.Group (default = []).
     */
    constructor(components: AbstractComponent[] = []){
      super();
      this.classed("component-group", true);
      components.forEach((c: AbstractComponent) => this._addComponent(c));
    }

    /**
     * Retrieves closest PlotData to queryPoint across all plots in this group.
     *
     * Each plot is queried using getClosestPlotData(queryPoint) and the closest
     * to queryPoint by Euclidean norm is returned. Ties are in Euclidean norm
     * broken by favoring the plot ordered highest in the group.
     *
     * @param {Point} queryPoint The point to which plot data should be compared
     *
     * @returns {PlotData} The PlotData closest to queryPoint in this group
     */
    public getClosestPlotData(queryPoint: Point): Plot.PlotData {
      var minDistSquared = Infinity;
      var closestPlotData: Plot.PlotData = {
        data: [],
        pixelPoints: [],
        plot: null,
        selection: d3.select()
      };

      this.components().forEach((c) => {
        if (c instanceof Plot.AbstractPlot || c instanceof Group) {
          var cpd = (<Plot.AbstractPlot | Group> c).getClosestPlotData(queryPoint);

          // it is possible for multiple data to be considered "closest" by a plot (e.g., overlapping bars)
          cpd.pixelPoints.forEach((pixelPoint, index) => {
            var distanceSquared = _Util.Methods.distanceSquared(pixelPoint, queryPoint);
            if (distanceSquared <= minDistSquared) {
              minDistSquared = distanceSquared;

              // some PlotData results, i.e., line, have only one element in their selection
              var selection = cpd.selection[0];
              var selectionIndex = Math.min(selection.length - 1, index);

              closestPlotData = {
                data: [cpd.data[index]],
                pixelPoints: [pixelPoint],
                plot: cpd.plot,
                selection: d3.select(selection[selectionIndex])
              };
            }
          });
        }
      });

      return closestPlotData;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var requests = this.components().map((c: AbstractComponent) => c._requestedSpace(offeredWidth, offeredHeight));
      return {
        width : _Util.Methods.max<_SpaceRequest, number>(requests, (request: _SpaceRequest) => request.width, 0),
        height: _Util.Methods.max<_SpaceRequest, number>(requests, (request: _SpaceRequest) => request.height, 0),
        wantsWidth : requests.map((r: _SpaceRequest) => r.wantsWidth ).some((x: boolean) => x),
        wantsHeight: requests.map((r: _SpaceRequest) => r.wantsHeight).some((x: boolean) => x)
      };
    }

    public _merge(c: AbstractComponent, below: boolean): Group {
      this._addComponent(c, !below);
      return this;
    }

    public _computeLayout(offeredXOrigin?: number,
                          offeredYOrigin?: number,
                   availableWidth?: number,
                  availableHeight?: number): Group {
      super._computeLayout(offeredXOrigin, offeredYOrigin, availableWidth, availableHeight);
      this.components().forEach((c) => {
        c._computeLayout(0, 0, this.width(), this.height());
      });
      return this;
    }

    protected _getSize(availableWidth: number, availableHeight: number) {
      return {
        width: availableWidth,
        height: availableHeight
      };
    }

    public _isFixedWidth(): boolean {
      return this.components().every((c) => c._isFixedWidth());
    }

    public _isFixedHeight(): boolean {
      return this.components().every((c) => c._isFixedHeight());
    }
  }
}
}
