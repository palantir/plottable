///<reference path="../reference.ts" />

module Plottable {
  export class ComponentGroup extends ComponentContainer {

    /**
     * Creates a ComponentGroup.
     *
     * @constructor
     * @param {Component[]} [components] The Components in the ComponentGroup.
     */
    constructor(components: Component[] = []){
      super();
      this.classed("component-group", true);
      components.forEach((c: Component) => this._addComponent(c));
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requests = this._components.map((c: Component) => c._requestedSpace(offeredWidth, offeredHeight));
      var isEmpty = this.empty();
      var desiredWidth  = isEmpty ? 0 : d3.max(requests, (l: ISpaceRequest) => l.width );
      var desiredHeight = isEmpty ? 0 : d3.max(requests, (l: ISpaceRequest) => l.height);
      return {
        width : Math.min(desiredWidth , offeredWidth ),
        height: Math.min(desiredHeight, offeredHeight),
        wantsWidth : isEmpty ? false : requests.map((r: ISpaceRequest) => r.wantsWidth ).some((x: boolean) => x),
        wantsHeight: isEmpty ? false : requests.map((r: ISpaceRequest) => r.wantsHeight).some((x: boolean) => x)
      };
    }

    public merge(c: Component): ComponentGroup {
      this._addComponent(c);
      return this;
    }

    public _computeLayout(xOrigin?: number,
                          yOrigin?: number,
                   availableWidth?: number,
                  availableHeight?: number): ComponentGroup {
      super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
      this._components.forEach((c) => {
        c._computeLayout(0, 0, this.availableWidth, this.availableHeight);
      });
      return this;
    }

    public isFixedWidth(): boolean {
      return this._components.every((c) => c.isFixedWidth());
    }

    public isFixedHeight(): boolean {
      return this._components.every((c) => c.isFixedHeight());
    }
  }
}
