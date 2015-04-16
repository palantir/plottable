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
     * Plots define their own notion of closeness; this function compares results across
     * plots and picks the closest to queryPoint using the Euclidean norm. Ties are
     * broken by favoring the plots higher in the group.
     *
     * @param {Point} queryPoint The point to which plot data should be compared
     *
     * @returns {PlotData} The PlotData closest to queryPoint
     */
    public getClosestPlotData(queryPoint: Point): Plot.PlotData {
      var minDistSquared = Infinity;
      var closestPlotData: Plot.PlotData = {
        data: [],
        pixelPoints: [],
        plot: null,
        selection: d3.selectAll([])
      };

      this.components().forEach((c) => {
        // consider only components implementing this function
        if ((<any>c).getClosestPlotData !== undefined) {
          var cpd = (<any>c).getClosestPlotData(queryPoint);
          if (cpd.data.length > 0) {
            // we tie-break multiple closest within a single plot by taking the first
            var distanceSquared = _Util.Methods.distanceSquared(cpd.pixelPoints[0], queryPoint);
            if (distanceSquared <= minDistSquared) {
              minDistSquared = distanceSquared;
              closestPlotData = cpd;
            }
          }
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
