///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class Group extends ComponentContainer {

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
    constructor(components: Component[] = []){
      super();
      this.classed("component-group", true);
      components.forEach((c: Component) => this._addComponent(c));
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var requests = this.components().map((c: Component) => c._requestedSpace(offeredWidth, offeredHeight));
      return {
        width: Utils.Methods.max<_SpaceRequest, number>(requests, (request: _SpaceRequest) => request.width, 0),
        height: Utils.Methods.max<_SpaceRequest, number>(requests, (request: _SpaceRequest) => request.height, 0),
        wantsWidth: requests.map((r: _SpaceRequest) => r.wantsWidth ).some((x: boolean) => x),
        wantsHeight: requests.map((r: _SpaceRequest) => r.wantsHeight).some((x: boolean) => x)
      };
    }

    public merge(c: Component, below: boolean): Group {
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

    public isFixedWidth(): boolean {
      return this.components().every((c) => c.isFixedWidth());
    }

    public isFixedHeight(): boolean {
      return this.components().every((c) => c.isFixedHeight());
    }
  }
}
}
