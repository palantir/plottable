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

    public _isFixedWidth(): boolean {
      var components = this.components();
      var allFixedWidth = components.every((c) => c._isFixedWidth());
      var allSameXAlignment = components.every((c) => c.xAlign() === components[0].xAlign());
      return allFixedWidth && allSameXAlignment;
    }

    public _isFixedHeight(): boolean {
      var components = this.components();
      var allFixedHeight = components.every((c) => c._isFixedHeight());
      var allSameYAlignment = components.every((c) => c.yAlign() === components[0].yAlign());
      return allFixedHeight && allSameYAlignment;
    }
  }
}
}
