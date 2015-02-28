///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Group extends AbstractComponentContainer {

    /**
     * Constructs a GroupComponent.
     *
     * A GroupComponent is a set of Components that will be rendered on top of
     * each other. When you call Component.merge(Component), it creates and
     * returns a GroupComponent.
     *
     * @constructor
     * @param {Component[]} components The Components in the Group (default = []).
     */
    constructor(components: AbstractComponent[] = []){
      super();
      _Util.Methods.uniqPush(this._cssClasses, "component-group");

      components.forEach((c: AbstractComponent) => {
        if (c !== null) {
          _Util.Methods.uniqPush(this._components, c);
          c._parent = this;
        }
      });
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

    public merge(c: AbstractComponent): Group {
      this._addComponent(c);
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
      return false;
    }

    public _isFixedHeight(): boolean {
      return false;
    }
  }
}
}
