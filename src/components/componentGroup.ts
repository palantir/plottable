///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Group extends Abstract.ComponentContainer {

    /**
     * Creates a ComponentGroup.
     *
     * @constructor
     * @param {Component[]} [components] The Components in the Group.
     */
    constructor(components: Abstract.Component[] = []){
      super();
      this.classed("component-group", true);
      components.forEach((c: Abstract.Component) => this._addComponent(c));
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requests = this._components.map((c: Abstract.Component) => c._requestedSpace(offeredWidth, offeredHeight));
      return {
        width : Util.Methods.max(requests, (request: ISpaceRequest) => request.width ),
        height: Util.Methods.max(requests, (request: ISpaceRequest) => request.height),
        wantsWidth : requests.map((r: ISpaceRequest) => r.wantsWidth ).some((x: boolean) => x),
        wantsHeight: requests.map((r: ISpaceRequest) => r.wantsHeight).some((x: boolean) => x)
      };
    }

    public merge(c: Abstract.Component): Group {
      this._addComponent(c);
      return this;
    }

    public _computeLayout(xOrigin?: number,
                          yOrigin?: number,
                   availableWidth?: number,
                  availableHeight?: number): Group {
      super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
      this._components.forEach((c) => {
        c._computeLayout(0, 0, this.width(), this.height());
      });
      return this;
    }

    public _isFixedWidth(): boolean {
      return this._components.every((c) => c._isFixedWidth());
    }

    public _isFixedHeight(): boolean {
      return this._components.every((c) => c._isFixedHeight());
    }
  }
}
}
