///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class Group extends ComponentContainer {
    private _components: Component[] = [];

    /**
     * Constructs a Component.Group.
     *
     * A Component.Group is a set of Components that will be rendered on top of
     * each other. Components added later will be rendered on top of existing Components.
     *
     * @constructor
     * @param {Component[]} components The Components in the resultant Component.Group (default = []).
     */
    constructor(components: Component[] = []) {
      super();
      this.classed("component-group", true);
      components.forEach((c: Component) => this.append(c));
    }

    protected _forEach(callback: (component: Component) => any) {
      this._components.forEach(callback);
    }

    /**
     * Checks whether the specified Component is in the Group.
     */
    public has(component: Component) {
      return this._components.indexOf(component) >= 0;
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      var requests = this._components.map((c: Component) => c.requestedSpace(offeredWidth, offeredHeight));
      return {
        minWidth: Utils.Methods.max<SpaceRequest, number>(requests, (request) => request.minWidth, 0),
        minHeight: Utils.Methods.max<SpaceRequest, number>(requests, (request) => request.minHeight, 0)
      };
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._forEach((component) => {
        component.computeLayout({ x: 0, y: 0 }, this.width(), this.height());
      });
      return this;
    }

    protected _getSize(availableWidth: number, availableHeight: number) {
      return {
        width: availableWidth,
        height: availableHeight
      };
    }

    public fixedWidth(): boolean {
      return this._components.every((c) => c.fixedWidth());
    }

    public fixedHeight(): boolean {
      return this._components.every((c) => c.fixedHeight());
    }

    /**
     * @return {Component[]} The Components in this Group.
     */
    public components(): Component[] {
      return this._components.slice();
    }

    public append(component: Component) {
      if (component != null && !this.has(component)) {
        component.detach();
        this._components.push(component);
        this._adoptAndAnchor(component);
        this.redraw();
      }
      return this;
    }

    protected _remove(component: Component) {
      var removeIndex = this._components.indexOf(component);
      if (removeIndex >= 0) {
        this._components.splice(removeIndex, 1);
        return true;
      }
      return false;
    }

  }
}
}
